import { Component } from '@taoro/component'
import { Matrix4 } from '@taoro/math-matrix4'
import { Vector3 } from '@taoro/math-vector3'
import WebGL from '@taoro/webgl'
import shaders from './shaders'
import PerspectiveProjection from './PerspectiveProjection'

export class GeometryComponent extends Component {
  #geometry = null
  #buffer = null
  #vao = null

  constructor(id, geometry) {
    super(id)
    this.#geometry = geometry
  }

  get geometry() {
    return this.#geometry
  }

  get buffer() {
    return this.#buffer
  }

  set buffer(buffer) {
    if (!(buffer instanceof WebGLBuffer)) {
      throw new TypeError('Invalid Buffer')
    }
    this.#buffer = buffer
  }

  get vao() {
    return this.#vao
  }

  set vao(vao) {
    if (!(vao instanceof WebGLVertexArrayObject)) {
      throw new TypeError('Invalid Vertex Array Object')
    }
    this.#vao = vao
  }
}

export class StarfieldComponent extends GeometryComponent {
  constructor(id, geometry) {
    super(id, geometry)
  }
}

export class RingComponent extends Component {

}

export class OrbitComponent extends Component {
  #orbit = null

  constructor(id, orbit) {
    super(id)
    this.#orbit = orbit
  }

  get orbit() {
    return this.#orbit
  }

  get semiMajorAxis() {
    return this.#orbit.semiMajorAxis
  }

  get semiMinorAxis() {
    return this.#orbit.semiMinorAxis
  }
}

export class ImposterComponent extends Component {
  /**
   * Cuerpo (y subcuerpos) que renderizará este componente.
   *
   * @type {Body}
   */
  #body = null

  constructor(id, body) {
    super(id)
    this.#body = body
  }

  get body() { return this.#body }

  get radius() { return this.#body.radius }
}

/**
 * Este componente de transformación tiene dos sistemas
 * de coordenadas, a diferencia de `component-transform-3d`
 * que sólo tiene uno.
 */
export class TransformComponent extends Component {
  #rotationMatrix = new Matrix4()
  #positionMatrix = new Matrix4()
  #matrix = new Matrix4()

  #largeScalePosition = new Vector3()
  #smallScalePosition = new Vector3()

  constructor(id) {
    super(id)
  }

  get positionMatrix() {
    return this.#positionMatrix
  }

  get rotationMatrix() {
    return this.#rotationMatrix
  }

  get matrix() {
    return this.#matrix
  }

  get largeScalePosition() {
    return this.#largeScalePosition
  }

  get smallScalePosition() {
    return this.#smallScalePosition
  }
}

/**
 * Componente cámara que utilizará el renderizador.
 */
export class CameraComponent extends Component {
  #projection = null

  constructor(id, options) {
    super(id)
    this.#projection = options?.projection ?? new PerspectiveProjection(
      Math.PI * 0.5,
      1,
      0.00000001,
      1_000_000
    )
  }

  get projection() {
    return this.#projection
  }
}

/**
 * Renderizador custom para el juego.
 */
export class CustomRenderer {
  /**
   * Canvas
   *
   * @type {HTMLCanvasElement|OffscreenCanvas}
   */
  #canvas = null

  /**
   * Contexto WebGL
   *
   * @type {WebGL2RenderingContext}
   */
  #gl = null

  /**
   * Programas
   *
   * @type {Map.<string, WebGLProgram>}
   */
  #programs = new Map()

  /**
   * VertexArrayObjects
   *
   * @type {Map.<string, WebGLVertexArrayObject>}
   */
  #vaos = new Map()

  /**
   * Matrices de transformación y perspectiva
   * utilizadas para los cálculos del render.
   */
  #view = new Matrix4()
  #viewPosition = new Matrix4()
  #viewRotation = new Matrix4()
  #viewModel = new Matrix4()

  #model = new Matrix4()
  #modelView = new Matrix4()
  #modelViewProjection = new Matrix4()

  #billboard = new Matrix4()
  #billboardView = new Matrix4()
  #billboardModelView = new Matrix4()
  #billboardModelViewProjection = new Matrix4()

  /**
   * Constructor
   *
   * @param {HTMLCanvasElement|OffscreenCanvas} canvas
   */
  constructor(canvas) {
    this.#canvas = canvas
    const gl = (this.#gl = canvas.getContext('webgl2'))

    for (const [name, program] of Object.entries(shaders)) {
      this.#programs.set(
        name,
        WebGL.program.createProgramFromSources(
          gl,
          program.vertexShader,
          program.fragmentShader
        )
      )
    }
  }

  /**
   * Renderizamos el fondo de estrellas.
   *
   * @param {WebGL2RenderingContext} gl
   * @param {CameraComponent} camera
   * @param {StarfieldComponent} starfield
   */
  #renderStarfield(gl, camera, viewTransform, starfield) {
    if (!starfield.buffer) {
      starfield.buffer = WebGL.buffer.createArrayBufferFrom(
        gl,
        starfield.geometry.vertices
      )
    }

    if (!starfield.vao) {
      starfield.vao = WebGL.vao.createVertexArray(gl, {
        attributes: [
          { index: 0, size: 4, type: gl.FLOAT, buffer: starfield.buffer },
        ],
      })
    }

    gl.bindVertexArray(starfield.vao)
    gl.drawArrays(gl.POINTS, 0, 1000)
    gl.bindVertexArray(null)
  }

  #renderOrbit(gl, camera, viewTransform, orbit) {
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('orbit'), 'u_radius'),
      orbit.semiMajorAxis
    )
    gl.drawArrays(gl.LINE_LOOP, 0, 1000)
  }

  #renderRing(gl, camera, viewTransform, ring) {
    gl.uniform2f(
      gl.getUniformLocation(this.#programs.get('ring'), 'u_radius'),
      ring.innerRadius,
      ring.outerRadius
    )
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1000)
  }

  #renderImposter(gl, camera, viewTransform, imposter) {
    /*
    const transform = Component.findByIdAndConstructor(imposter.id, TransformComponent)
    if (transform) {
      gl.uniformMatrix4fv(
        gl.getUniformLocation(
          this.#programs.get('imposter'),
          'u_modelViewProjection'
        ),
        false,
        this.#billboardModelViewProjection.rawData
      )
    }
    */
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_size'),
      imposter.radius
    )
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  /**
   * Renderizamos todos los elementos que se encuentran a gran escala:
   * - Las estrellas.
   * - La estrella principal.
   * - Las órbitas.
   * - Los planetas, lunas, etc.
   *
   * @param {WebGL2RenderingContext} gl
   * @param {*} camera
   */
  #renderLargeScale(gl, camera) {
    const viewTransform = Component.findByIdAndConstructor(
      camera.id,
      TransformComponent
    )

    gl.useProgram(this.#programs.get('default'))
    const starfields = Component.findByConstructor(StarfieldComponent)
    if (starfields) {
      gl.uniformMatrix4fv(
        gl.getUniformLocation(
          this.#programs.get('default'),
          'u_modelViewProjection'
        ),
        false,
        this.#modelViewProjection.rawData
      )
      for (const starfield of starfields) {
        this.#renderStarfield(gl, camera, viewTransform, starfield)
      }
    }

    gl.useProgram(this.#programs.get('orbit'))
    const orbits = Component.findByConstructor(OrbitComponent)
    if (orbits) {
      gl.uniformMatrix4fv(
        gl.getUniformLocation(
          this.#programs.get('orbit'),
          'u_modelViewProjection'
        ),
        false,
        this.#modelViewProjection.rawData
      )
      for (const orbit of orbits) {
        this.#renderOrbit(gl, camera, viewTransform, orbit)
      }
    }

    gl.useProgram(this.#programs.get('ring'))
    const rings = Component.findByConstructor(RingComponent)
    if (rings) {
      gl.uniformMatrix4fv(
        gl.getUniformLocation(
          this.#programs.get('ring'),
          'u_modelViewProjection'
        ),
        false,
        this.#modelViewProjection.rawData
      )
      for (const ring of rings) {
        this.#renderRing(gl, camera, viewTransform, orbit)
      }
    }

    gl.useProgram(this.#programs.get('imposter'))
    const imposters = Component.findByConstructor(ImposterComponent)
    if (imposters) {
      gl.uniformMatrix4fv(
        gl.getUniformLocation(
          this.#programs.get('imposter'),
          'u_modelViewProjection'
        ),
        false,
        this.#modelViewProjection.rawData
      )
      for (const imposter of imposters) {
        this.#renderImposter(gl, camera, viewTransform, imposter)
      }
    }
  }

  /**
   * Renderizamos todos los elementos que se encuentran a pequeña escala.
   * - Estaciones.
   * - Naves.
   * - Cargamentos.
   *
   * @param {WebGL2RenderingContext} gl
   * @param {*} camera
   */
  #renderSmallScale(gl, camera) {
    gl.clearDepth(1)
    // TODO: Tengo que ver cómo hago el render de todo esto.
  }

  #computeMatrices(camera) {
    const viewTransform = Component.findByIdAndConstructor(
      camera.id,
      TransformComponent
    )

    this.#viewModel.copy(viewTransform.matrix)
    this.#viewPosition.copy(viewTransform.positionMatrix)
    this.#viewRotation.copy(viewTransform.rotationMatrix)

    Matrix4.invert(this.#view, this.#viewModel)
    Matrix4.invert(this.#billboardView, this.#viewRotation)

    Matrix4.multiply(this.#modelView, this.#model, this.#view)
    Matrix4.multiply(
      this.#modelViewProjection,
      camera.projection.matrix,
      this.#modelView
    )
  }

  /**
   * Renderiza una vista.
   *
   * @param {WebGLRenderingContext} gl
   * @param {CameraComponent} camera
   */
  #renderView(gl, camera) {
    const aspectRatio = this.#canvas.width / this.#canvas.height
    camera.projection.aspectRatio = aspectRatio

    this.#computeMatrices(camera)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.viewport(0, 0, this.#canvas.width, this.#canvas.height)

    this.#renderLargeScale(gl, camera)
    this.#renderSmallScale(gl, camera)
  }

  update() {
    const gl = this.#gl
    for (const camera of Component.findByConstructor(CameraComponent)) {
      this.#renderView(gl, camera)
    }
  }
}
