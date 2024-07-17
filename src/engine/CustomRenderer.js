import { Component } from '@taoro/component'
// import { Matrix4 } from '@taoro/math-matrix4'
// import { Vector3 } from '@taoro/math-vector3'
import WebGL from '@taoro/webgl'
import { mat4, vec3, quat } from 'gl-matrix'
import shaders from './shaders'
import PerspectiveProjection from './PerspectiveProjection'
import { Body } from '../game/models/Body'
import { Ring } from '../game/models/Ring'
import { Zone } from '../game/models/Zone'

// Entity Component System

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

  // FIXME: Creo que esto no debería estar en el componente
  // debería estar en el Renderer en un mapa referenciado
  // por este componente.
  set vao(vao) {
    if (!(vao instanceof WebGLVertexArrayObject)) {
      throw new TypeError('Invalid Vertex Array Object')
    }
    this.#vao = vao
  }
}

export class MeshComponent extends Component {
  #geometry = null
  #indexBuffer = null
  #vertexBuffer = null
  #edgeBuffer = null

  constructor(id, geometry) {
    super(id)
    this.#geometry = geometry
  }

  get geometry() {
    return this.#geometry
  }

  get indexBuffer() {
    return this.#indexBuffer
  }

  get vertexBuffer() {
    return this.#vertexBuffer
  }

  get edgeBuffer() {
    return this.#edgeBuffer
  }

}

export class DustComponent extends Component {
  constructor(id) {
    super(id)
  }
}

export class StarfieldComponent extends GeometryComponent {
  constructor(id, geometry) {
    super(id, geometry)
  }
}

export class RingComponent extends Component {
  #ring = null

  constructor(id, ring) {
    super(id)
    this.#ring = ring
  }

  get ring() {
    return this.#ring
  }

  get innerRadius() {
    return this.#ring.innerRadius
  }

  get outerRadius() {
    return this.#ring.outerRadius
  }
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

  get radius() {
    return this.#body?.radius ?? 5
  }
}

/**
 * Este componente de transformación tiene dos sistemas
 * de coordenadas, a diferencia de `component-transform-3d`
 * que sólo tiene uno.
 */
export class TransformComponent extends Component {
  #linkedObject = null

  #rotationMatrix = mat4.create()
  #positionMatrix = mat4.create()
  #matrix = mat4.create()

  #largeScalePosition = vec3.create()
  #smallScalePosition = vec3.create()

  constructor(id, options) {
    super(id)
    this.#linkedObject = options?.linkedObject ?? null
    this.#largeScalePosition = options?.largeScalePosition ?? vec3.create()
    this.#smallScalePosition = options?.smallScalePosition ?? vec3.create()
  }

  get linkedObject() {
    return this.#linkedObject
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

export class UITextComponent extends Component {
    #text = null
    #x = 0
    #y = 0
    #font = '16px monospace'
    #textAlign = 'left'
    #textBaseline = 'top'
    #fillStyle = 'black'

    constructor(id, text, x ,y, font, textAlign, textBaseline, fillStyle) {
      super(id)
      this.#text = text
      this.#x = x
      this.#y = y
      this.#font = font
      this.#textAlign = textAlign
      this.#textBaseline = textBaseline
      this.#fillStyle = fillStyle
    }

    get text() { return this.#text}
    get x() { return this.#x}
    get y() { return this.#y}
    get font() { return this.#font}
    get textAlign() { return this.#textAlign }
    get textBaseline() { return this.#textBaseline }
    get fillStyle() { return this.#fillStyle }
    set text(newText) {this.#text = newText }
  }

/**
 * Componente cámara que utilizará el renderizador.
 */
export class CameraComponent extends Component {
  #projection = null
  #projectionViewMatrix = null

  constructor(id, options) {
    super(id)
    this.#projection = options?.projection ?? new PerspectiveProjection(
      Math.PI * 0.5,
      1,
      0.1,
      1_000_000
    )
    this.#projectionViewMatrix = mat4.create()
  }

  get projection() {
    return this.#projection
  }

  get projectionViewMatrix() {
    return this.#projectionViewMatrix
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

  #ui = null

  /**
   * Matrices de transformación y perspectiva
   * utilizadas para los cálculos del render.
   */
  #view = mat4.create()
  #model = mat4.create()
  #projectionViewModel = mat4.create()

  /**
   * Constructor
   *
   * @param {HTMLCanvasElement|OffscreenCanvas} canvas
   */
  constructor(canvas) {
    this.#canvas = canvas

    globalThis.debugRenderer = {
      largeScale: true,
      starfields: true,
      orbits: true,
      rings: true,
      imposters: true,
      smallScale: true,
      meshes: true,
      dusts: true,
    }

    const gl = canvas.getContext('webgl2', {
      depth: true,
      stencil: false,
      antialias: true
    })

    const uiCanvas = new OffscreenCanvas(1920, 1080)
    const uiContext = uiCanvas.getContext('2d', {
      alpha: true
    })
    const uiTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, uiTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, uiCanvas.width, uiCanvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    /*
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      uiCanvas
    )
    */
    gl.bindTexture(gl.TEXTURE_2D, null)

    this.#ui = {
      canvas: uiCanvas,
      context: uiContext,
      texture: uiTexture
    }

    /*
    console.log('Depth bits', gl.getParameter(gl.DEPTH_BITS))
    console.log(
      'Depth func',
      Object.entries(WebGL2RenderingContext).find(([key, value]) =>
        gl.getParameter(gl.DEPTH_FUNC) === value ? key : null
      )
    )
    console.log(
      'Depth mask',
      gl.getParameter(gl.DEPTH_WRITEMASK)
    )
    console.log(
      'Depth clear value',
      gl.getParameter(gl.DEPTH_CLEAR_VALUE)
    )
    console.log('Depth range', gl.getParameter(gl.DEPTH_RANGE))
    */

    this.#gl = gl

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
  #renderStarfield(gl, camera, cameraTransform, starfield) {
    if (!starfield.geometry.hasVertexArrayObject) {
      starfield.geometry.createVertexArrayObject(gl)
    }

    const position = vec3.create()
    const model = mat4.create()
    mat4.getTranslation(position, cameraTransform.matrix)
    mat4.translate(model, model, position)
    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      model
    )

    gl.uniformMatrix4fv(
      gl.getUniformLocation(
        this.#programs.get('default'),
        'u_modelViewProjection'
      ),
      false,
      this.#projectionViewModel
    )
    gl.bindVertexArray(starfield.geometry.vao)
    gl.drawArrays(gl.POINTS, 0, 1000)
    gl.bindVertexArray(null)
  }

  #renderOrbit(gl, camera, cameraTransform, orbit) {
    const total = 100
    gl.uniform1i(
      gl.getUniformLocation(this.#programs.get('orbit'), 'u_total'),
      total,
    )
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('orbit'), 'u_radius'),
      orbit.semiMajorAxis
    )
    gl.drawArrays(gl.LINE_LOOP, 0, total)
  }

  #renderRing(gl, camera, cameraTransform, ring) {
    const total = 100
    const transform = Component.findByIdAndConstructor(
      ring.id,
      TransformComponent
    )
    if (transform) {
      mat4.multiply(
        this.#projectionViewModel,
        camera.projectionViewMatrix,
        transform.matrix
      )
      gl.uniformMatrix4fv(
        gl.getUniformLocation(
          this.#programs.get('ring'),
          'u_modelViewProjection'
        ),
        false,
        this.#projectionViewModel
      )
    }
    gl.uniform1i(
      gl.getUniformLocation(this.#programs.get('ring'), 'u_radius'),
      total
    )
    gl.uniform2f(
      gl.getUniformLocation(this.#programs.get('ring'), 'u_radius'),
      ring.innerRadius,
      ring.outerRadius
    )
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, total)
  }

  #renderImposter(gl, camera, cameraTransform, imposter) {
    const transform = Component.findByIdAndConstructor(imposter.id, TransformComponent)
    if (transform) {
      const cameraRotation = quat.create()
      const position = vec3.create()
      mat4.getRotation(cameraRotation, cameraTransform.matrix)
      mat4.getTranslation(position, transform.matrix)
      mat4.fromRotationTranslation(this.#model, cameraRotation, position)
      mat4.multiply(
        this.#projectionViewModel,
        camera.projectionViewMatrix,
        this.#model
      )
      gl.uniformMatrix4fv(
        gl.getUniformLocation(
          this.#programs.get('imposter'),
          'u_modelViewProjection'
        ),
        false,
        this.#projectionViewModel
      )
    }
    const colors = {
      [Body]: [1, 0, 0, 1],
      [Ring]: [0, 1, 0, 1],
      [Zone]: [0, 0, 1, 1]
    }
    const [r, g, b, a] = colors[imposter.body.constructor]
    gl.uniform4f(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_color'),
      r, g, b, a
    )
    gl.uniform1i(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_type'),
      1
    )
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_time'),
      performance.now() / 100
    )
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_size'),
      imposter.radius
    )
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  }

  #renderStarfields(gl, camera, cameraTransform, starfields) {
    if (!globalThis.debugRenderer.starfields) return
    for (const starfield of starfields) {
      this.#renderStarfield(gl, camera, cameraTransform, starfield)
    }
  }

  #renderOrbits(gl, camera, cameraTransform, orbits) {
    if (!globalThis.debugRenderer.orbits) return
    gl.useProgram(this.#programs.get('orbit'))

    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      mat4.create()
    )

    gl.uniformMatrix4fv(
      gl.getUniformLocation(
        this.#programs.get('orbit'),
        'u_modelViewProjection'
      ),
      false,
      this.#projectionViewModel
    )
    for (const orbit of orbits) {
      this.#renderOrbit(gl, camera, cameraTransform, orbit)
    }
  }

  #renderRings(gl, camera, cameraTransform, rings) {
    if (!globalThis.debugRenderer.rings) return
    gl.useProgram(this.#programs.get('ring'))

    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      mat4.create()
    )

    gl.uniformMatrix4fv(
      gl.getUniformLocation(
        this.#programs.get('ring'),
        'u_modelViewProjection'
      ),
      false,
      this.#projectionViewModel
    )
    for (const ring of rings) {
      this.#renderRing(gl, camera, cameraTransform, ring)
    }
  }

  #renderImposters(gl, camera, cameraTransform, imposters) {
    if (!globalThis.debugRenderer.imposters) return
    gl.useProgram(this.#programs.get('imposter'))
    for (const imposter of imposters) {
      this.#renderImposter(gl, camera, cameraTransform, imposter)
    }
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
  #renderLargeScale(gl, camera, cameraTransform) {
    if (!globalThis.debugRenderer.largeScale) return
    gl.useProgram(this.#programs.get('default'))
    const starfields = Component.findByConstructor(StarfieldComponent)
    if (starfields) {
      this.#renderStarfields(gl, camera, cameraTransform, starfields)
    }

    const orbits = Component.findByConstructor(OrbitComponent)
    if (orbits) {
      this.#renderOrbits(gl, camera, cameraTransform, orbits)
    }

    const rings = Component.findByConstructor(RingComponent)
    if (rings) {
      this.#renderRings(gl, camera, cameraTransform, rings)
    }

    const imposters = Component.findByConstructor(ImposterComponent)
    if (imposters) {
      this.#renderImposters(gl, camera, cameraTransform, imposters)
    }
  }

  /**
   * Renderiza el polvo utilizando puntos.
   *
   * @param {WebGL2RenderingContext} gl
   * @param {CameraComponent} camera
   * @param {TransformComponent} cameraTransform
   * @param {DustComponent} dust
   */
  #renderDust(gl, camera, cameraTransform, dust) {
    gl.drawArrays(gl.POINTS, 0, 2700)
  }

  #renderMeshSolid(gl, camera, cameraTransform, mesh) {
    gl.uniform4f(gl.getUniformLocation(this.#programs.get('mesh'), 'u_color'), 0.0, 0.0, 0.0, 1.0)
    gl.bindVertexArray(mesh.geometry.triangleVertexArrayObject)
    gl.drawElements(gl.TRIANGLES, mesh.geometry.triangles.length, gl.UNSIGNED_SHORT, 0)
    gl.bindVertexArray(null)
  }

  #renderMeshLines(gl, camera, cameraTransform, mesh) {
    gl.uniform4f(gl.getUniformLocation(this.#programs.get('mesh'), 'u_color'), 1.0, 1.0, 1.0, 1.0)
    gl.bindVertexArray(mesh.geometry.edgeVertexArrayObject)
    gl.drawElements(gl.LINES, mesh.geometry.edges.length, gl.UNSIGNED_SHORT, 0)
    gl.bindVertexArray(null)
  }

  #renderMesh(gl, camera, cameraTransform, mesh) {
    if (!mesh.geometry.hasVertexArrayObject) {
      mesh.geometry.createVertexArrayObject(gl)
    }

    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      mat4.create()
    )

    gl.uniformMatrix4fv(
      gl.getUniformLocation(
        this.#programs.get('mesh'),
        'u_modelViewProjection'
      ),
      false,
      this.#projectionViewModel
    )

    this.#renderMeshSolid(gl, camera, cameraTransform, mesh)
    this.#renderMeshLines(gl, camera, cameraTransform, mesh)
  }

  #renderMeshes(gl, camera, cameraTransform, meshes) {
    if (!globalThis.debugRenderer.meshes) return
    gl.useProgram(this.#programs.get('mesh'))
    for (const mesh of meshes) {
      this.#renderMesh(gl, camera, cameraTransform, mesh)
    }
  }

  #renderDusts(gl, camera, cameraTransform, dusts) {
    if (!globalThis.debugRenderer.dusts) return
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.useProgram(this.#programs.get('dust'))

    const cameraPosition = vec3.create()
    mat4.getTranslation(cameraPosition, cameraTransform.matrix)

    mat4.identity(this.#model)
    mat4.translate(this.#model, this.#model, cameraPosition)

    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      this.#model
    )

    gl.uniform3fv(
      gl.getUniformLocation(this.#programs.get('dust'), 'u_position'),
      cameraPosition
    )

    gl.uniformMatrix4fv(
      gl.getUniformLocation(
        this.#programs.get('dust'),
        'u_modelViewProjection'
      ),
      false,
      this.#projectionViewModel
    )
    for (const dust of dusts) {
      this.#renderDust(gl, camera, cameraTransform, dust)
    }
    gl.disable(gl.BLEND)
  }

  /**
   * Renderizamos todos los elementos que se encuentran a pequeña escala.
   * - Estaciones.
   * - Naves.
   * - Cargamentos.
   *
   * @param {WebGL2RenderingContext} gl
   * @param {CameraComponent} camera
   * @param {TransformComponent} cameraTransform
   */
  #renderSmallScale(gl, camera, cameraTransform) {
    if (!globalThis.debugRenderer.smallScale) return
    const meshes = Component.findByConstructor(MeshComponent)
    if (meshes) {
      this.#renderMeshes(gl, camera, cameraTransform, meshes)
    }

    const dusts = Component.findByConstructor(DustComponent)
    if (dusts) {
      this.#renderDusts(gl, camera, cameraTransform, dusts)
    }
  }

  #computeStarfieldMatrices(camera) {

  }

  /**
   * Calculamos las matrices de la vista que se reutilizarán
   * en las siguientes vistas.
   *
   * @param {CameraComponent} camera
   */
  #computeViewMatrices(camera, cameraTransform) {
    mat4.identity(this.#model)

    mat4.invert(this.#view, cameraTransform.matrix)

    mat4.multiply(
      camera.projectionViewMatrix,
      camera.projection.matrix,
      this.#view
    )

    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      this.#model
    )
  }

  /**
   * Renderiza una vista.
   *
   * @param {WebGLRenderingContext} gl
   * @param {CameraComponent} camera
   */
  #renderView(gl, camera, cameraTransform) {
    const aspectRatio = this.#canvas.width / this.#canvas.height
    camera.projection.aspectRatio = aspectRatio

    this.#computeViewMatrices(camera, cameraTransform)

    this.#renderLargeScale(gl, camera, cameraTransform)
    this.#renderSmallScale(gl, camera, cameraTransform)
  }

  #renderUIText(gl, context, text) {
    context.font = text.font
    context.textAlign = text.textAlign
    context.textBaseline = text.textBaseline
    context.fillStyle = text.fillStyle
    context.fillText(text.text, text.x, text.y)
  }

  #renderUI(gl, context) {
    context.clearRect(0, 0,context.canvas.width, context.canvas.height)
    const uiTexts = Component.findByConstructor(UITextComponent);
    if (uiTexts) {
      for (const uiText of uiTexts) {
        this.#renderUIText(gl, context, uiText)
      }
    }

    // Pintamos todo lo que vaya en el canvas 2D.
    gl.useProgram(this.#programs.get('ui'))
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.#ui.texture)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.#ui.canvas)
    gl.uniform1i(gl.getUniformLocation(this.#programs.get('ui'), 'u_sampler'), 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.disable(gl.BLEND)
  }

  /**
   * Renderiza todos los elementos del escenario.
   */
  update() {
    const gl = this.#gl
    gl.viewport(0, 0, this.#canvas.width, this.#canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    // gl.disable(gl.CULL_FACE)
    for (const camera of Component.findByConstructor(CameraComponent)) {
      const cameraTransform = Component.findByIdAndConstructor(
        camera.id,
        TransformComponent
      )
      this.#renderView(gl, camera, cameraTransform)
    }
    gl.disable(gl.DEPTH_TEST)
    this.#renderUI(gl, this.#ui.context)
  }
}
