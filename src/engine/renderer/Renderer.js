import { Component } from '@taoro/component'
import { WebGL } from '@taoro/webgl'
import { mat4, vec3 } from 'gl-matrix'
import shaders from './shaders'
import { BodyType } from '../../engine/BodyType'
import { CameraComponent } from './components/CameraComponent'
import { TransformComponent } from '../components/TransformComponent'
import { StarfieldComponent } from './components/StarfieldComponent'
import { EllipseComponent } from './components/EllipseComponent'
import { RingComponent } from './components/RingComponent'
import { ImposterComponent } from './components/ImposterComponent'
import { MeshComponent } from './components/MeshComponent'
import { DustComponent } from './components/DustComponent'
import { UIRenderer } from './UIRenderer'

/**
 * Renderizador custom para el juego.
 */
export class Renderer {
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
   * Textures.
   *
   * @type {Map.<string, WebGLTexture>}
   */
  #textures = new Map()

  /**
   * @type {Resources}
   */
  #resources

  #ui = new UIRenderer()

  /**
   * Matrices de transformación y perspectiva
   * utilizadas para los cálculos del render.
   */
  #view = mat4.create()
  #viewForward = vec3.create()
  #viewRight = vec3.create()
  #viewUp = vec3.create()
  #viewPosition = vec3.create()
  #model = mat4.create()
  #projectionViewModel = mat4.create()
  #imposter = mat4.create()
  #imposterRotation = mat4.create()
  #imposterPosition = vec3.create()

  /**
   * Constructor
   *
   * @param {HTMLCanvasElement|OffscreenCanvas} canvas
   * @param {Resources} resources
   */
  constructor(canvas, resources) {
    this.#canvas = canvas
    this.#resources = resources

    // TODO: Esto debería poder exponerse
    // en el motor del juego (la clase
    // game debería permitir el acceso
    // al renderer con game.renderer)
    globalThis.debugRenderer = {
      largeScale: true,
      starfields: true,
      orbits: true,
      rings: true,
      imposters: true,
      smallScale: true,
      meshes: true,
      dusts: true,
      ui: {
        exits: true,
        zones: true,
        texts: true,
        images: true,
      },
    }

    const gl = (this.#gl = canvas.getContext('webgl2', {
      depth: true,
      stencil: false,
      antialias: true,
    }))

    const uiTexture = this.#createTextureFromSize(
      this.#ui.width,
      this.#ui.height
    )

    this.#textures.set('ui', uiTexture)

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

  #createTextureFromImage(image) {
    const gl = this.#gl
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      image.width,
      image.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
  }

  #createTextureFromSize(width, height) {
    const gl = this.#gl
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
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
    mat4.getTranslation(position, cameraTransform.largeScaleMatrix)
    mat4.translate(model, model, position)
    mat4.multiply(this.#projectionViewModel, camera.projectionViewMatrix, model)

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

  /**
   *
   * @param {WebGL2RenderingContext} gl
   * @param {*} camera
   * @param {*} cameraTransform
   * @param {*} orbit
   */
  #renderOrbit(gl, camera, cameraTransform, orbit) {
    const transform = Component.findByIdAndConstructor(
      orbit.id,
      TransformComponent
    )
    if (!transform) {
      throw new Error('Orbit component needs transform')
    }

    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      transform.largeScaleMatrix
    )

    gl.uniformMatrix4fv(
      gl.getUniformLocation(
        this.#programs.get('orbit'),
        'u_modelViewProjection'
      ),
      false,
      this.#projectionViewModel
    )
    const total = 100
    gl.uniform1i(
      gl.getUniformLocation(this.#programs.get('orbit'), 'u_total'),
      total
    )
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('orbit'), 'u_semiMajorAxis'),
      orbit.semiMajorAxis
    )
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('orbit'), 'u_semiMinorAxis'),
      orbit.semiMinorAxis
    )
    gl.drawArrays(gl.LINE_LOOP, 0, total)
  }

  #renderOrbits(gl, camera, cameraTransform, orbits) {
    if (!globalThis.debugRenderer.orbits) return
    gl.useProgram(this.#programs.get('orbit'))

    /*
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
    */
    for (const orbit of orbits) {
      this.#renderOrbit(gl, camera, cameraTransform, orbit)
    }
  }

  #renderRing(gl, camera, cameraTransform, ring) {
    const total = 100
    const transform = Component.findByIdAndConstructor(
      ring.id,
      TransformComponent
    )
    if (!transform) {
      throw new Error('Ring component needs transform')
    }
    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      transform.largeScaleMatrix
    )
    gl.uniformMatrix4fv(
      gl.getUniformLocation(
        this.#programs.get('ring'),
        'u_modelViewProjection'
      ),
      false,
      this.#projectionViewModel
    )
    gl.uniform1i(
      gl.getUniformLocation(this.#programs.get('ring'), 'u_total'),
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
    const transform = Component.findByIdAndConstructor(
      imposter.id,
      TransformComponent
    )
    if (transform) {
      mat4.getTranslation(this.#imposterPosition, transform.largeScaleMatrix)
      mat4.targetTo(
        this.#imposter,
        this.#viewPosition,
        this.#imposterPosition,
        this.#viewUp
      )
      mat4.set(
        this.#model,
        this.#imposter[0],
        this.#imposter[1],
        this.#imposter[2],
        this.#imposter[3],
        this.#imposter[4],
        this.#imposter[5],
        this.#imposter[6],
        this.#imposter[7],
        this.#imposter[8],
        this.#imposter[9],
        this.#imposter[10],
        this.#imposter[11],
        this.#imposterPosition[0],
        this.#imposterPosition[1],
        this.#imposterPosition[2],
        1.0
      )

      mat4.set(
        this.#imposterRotation,
        this.#imposter[0],
        this.#imposter[1],
        this.#imposter[2],
        this.#imposter[3],
        this.#imposter[4],
        this.#imposter[5],
        this.#imposter[6],
        this.#imposter[7],
        this.#imposter[8],
        this.#imposter[9],
        this.#imposter[10],
        this.#imposter[11],
        0,
        0,
        0,
        1
      )

      mat4.multiply(
        this.#projectionViewModel,
        camera.projectionViewMatrix,
        this.#model
      )
      gl.uniformMatrix4fv(
        gl.getUniformLocation(this.#programs.get('imposter'), 'u_imposter'),
        false,
        this.#imposterRotation
      )
      gl.uniform3fv(
        gl.getUniformLocation(this.#programs.get('imposter'), 'u_position'),
        this.#imposterPosition
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
    gl.uniform4f(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_color'),
      1,
      1,
      1,
      1
    )

    gl.uniform1i(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_type'),
      imposter.type
    )
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_time'),
      Date.now()
    )
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_size'),
      imposter.radius
    )
    if (imposter.type === BodyType.PLANET) {
      if (!this.#textures.has(imposter.texture)) {
        this.#textures.set(
          imposter.texture,
          this.#createTextureFromImage(this.#resources.get(imposter.texture))
        )
      }
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.#textures.get(imposter.texture))
      gl.uniform1i(
        gl.getUniformLocation(this.#programs.get('imposter'), 'u_sampler'),
        0
      )
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    if (imposter.type === BodyType.PLANET) {
      gl.bindTexture(gl.TEXTURE_2D, null)
    }
  }

  #renderStarfields(gl, camera, cameraTransform, starfields) {
    if (!globalThis.debugRenderer.starfields) return
    for (const starfield of starfields) {
      this.#renderStarfield(gl, camera, cameraTransform, starfield)
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

    const orbits = Component.findByConstructor(EllipseComponent)
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
    gl.uniform4f(
      gl.getUniformLocation(this.#programs.get('mesh'), 'u_color'),
      0.0,
      0.0,
      0.0,
      1.0
    )
    gl.bindVertexArray(mesh.geometry.triangleVertexArrayObject)
    gl.drawElements(
      gl.TRIANGLES,
      mesh.geometry.triangles.length,
      gl.UNSIGNED_SHORT,
      0
    )
    gl.bindVertexArray(null)
  }

  #renderMeshLines(gl, camera, cameraTransform, mesh) {
    gl.uniform4f(
      gl.getUniformLocation(this.#programs.get('mesh'), 'u_color'),
      1.0,
      1.0,
      1.0,
      1.0
    )
    gl.bindVertexArray(mesh.geometry.edgeVertexArrayObject)
    gl.drawElements(gl.LINES, mesh.geometry.edges.length, gl.UNSIGNED_SHORT, 0)
    gl.bindVertexArray(null)
  }

  #renderMesh(gl, camera, cameraTransform, mesh) {
    if (!mesh.geometry.hasVertexArrayObject) {
      mesh.geometry.createVertexArrayObject(gl)
    }

    const transform = Component.findByIdAndConstructor(
      mesh.id,
      TransformComponent
    )
    if (transform) {
      mat4.multiply(
        this.#projectionViewModel,
        camera.projectionViewMatrix,
        transform.smallScaleMatrix
      )

      gl.uniformMatrix4fv(
        gl.getUniformLocation(
          this.#programs.get('mesh'),
          'u_modelViewProjection'
        ),
        false,
        this.#projectionViewModel
      )
    } else {
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
    }

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
    gl.clear(gl.DEPTH_BUFFER_BIT)
    const meshes = Component.findByConstructor(MeshComponent)
    if (meshes) {
      this.#renderMeshes(gl, camera, cameraTransform, meshes)
    }
  }

  #renderIndependentScale(gl, camera, cameraTransform) {
    const dusts = Component.findByConstructor(DustComponent)
    if (dusts) {
      this.#renderDusts(gl, camera, cameraTransform, dusts)
    }
  }

  #computeStarfieldMatrices(camera) {}

  /**
   * Calculamos las matrices de la vista que se reutilizarán
   * en las siguientes vistas.
   *
   * @param {CameraComponent} camera
   */
  #computeLargeScaleViewMatrices(camera, cameraTransform) {
    mat4.identity(this.#model)

    mat4.invert(camera.viewMatrix, cameraTransform.largeScaleMatrix)

    mat4.multiply(
      camera.projectionViewMatrix,
      camera.projection.matrix,
      camera.viewMatrix
    )

    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      this.#model
    )
  }

  /**
   * Calculamos las matrices de la vista que se reutilizarán
   * en las siguientes vistas.
   *
   * @param {CameraComponent} camera
   */
  #computeSmallScaleViewMatrices(camera, cameraTransform) {
    mat4.identity(this.#model)

    mat4.invert(camera.viewMatrix, cameraTransform.smallScaleMatrix)

    mat4.multiply(
      camera.projectionViewMatrix,
      camera.projection.matrix,
      camera.viewMatrix
    )

    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      this.#model
    )
  }

  /**
   * Calculamos las matrices de la vista que se reutilizarán
   * en las siguientes vistas.
   *
   * @param {CameraComponent} camera
   */
  #computeIndependentScaleViewMatrices(camera, cameraTransform) {
    mat4.identity(this.#model)

    mat4.invert(camera.viewMatrix, cameraTransform.matrix)

    mat4.multiply(
      camera.projectionViewMatrix,
      camera.projection.matrix,
      camera.viewMatrix
    )

    mat4.multiply(
      this.#projectionViewModel,
      camera.projectionViewMatrix,
      this.#model
    )
  }

  #computeAdditionalViewData(camera, cameraTransform) {
    mat4.getTranslation(this.#viewPosition, cameraTransform.largeScaleMatrix)

    vec3.set(
      this.#viewRight,
      cameraTransform.rotationMatrix[0],
      cameraTransform.rotationMatrix[1],
      cameraTransform.rotationMatrix[2]
    )
    vec3.set(
      this.#viewUp,
      cameraTransform.rotationMatrix[4],
      cameraTransform.rotationMatrix[5],
      cameraTransform.rotationMatrix[6]
    )
    vec3.set(
      this.#viewForward,
      cameraTransform.rotationMatrix[8],
      cameraTransform.rotationMatrix[9],
      cameraTransform.rotationMatrix[10]
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

    this.#computeAdditionalViewData(camera, cameraTransform)

    this.#computeLargeScaleViewMatrices(camera, cameraTransform)
    this.#renderLargeScale(gl, camera, cameraTransform)

    this.#computeSmallScaleViewMatrices(camera, cameraTransform)
    this.#renderSmallScale(gl, camera, cameraTransform)

    this.#computeIndependentScaleViewMatrices(camera, cameraTransform)
    this.#renderIndependentScale(gl, camera, cameraTransform)
  }

  #renderUI(gl, camera, cameraTransform) {
    this.#ui.render(camera, cameraTransform)

    // Pintamos todo lo que vaya en el canvas 2D.
    gl.useProgram(this.#programs.get('ui'))
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.#textures.get('ui'))
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.#ui.canvas
    )
    gl.uniform1i(
      gl.getUniformLocation(this.#programs.get('ui'), 'u_sampler'),
      0
    )
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
    const cameras = Component.findByConstructor(CameraComponent)
    if (cameras) {
      for (const camera of cameras) {
        gl.enable(gl.DEPTH_TEST)
        const cameraTransform = Component.findByIdAndConstructor(
          camera.id,
          TransformComponent
        )
        this.#renderView(gl, camera, cameraTransform)
        gl.disable(gl.DEPTH_TEST)
        this.#renderUI(gl, camera, cameraTransform)
      }
    }
  }
}

export default Renderer
