import { Component } from '@taoro/component'
import WebGL from '@taoro/webgl'
import { mat4, vec4, vec3, quat } from 'gl-matrix'
import shaders from '../shaders'
import PerspectiveProjection from '../PerspectiveProjection'
import { Body } from '../../game/models/Body'
import { Ring } from '../../game/models/Ring'
import { Zone } from '../../game/models/Zone'
import { CameraComponent } from './components/CameraComponent'
import { TransformComponent } from './components/TransformComponent'
import { StarfieldComponent } from './components/StarfieldComponent'
import { OrbitComponent } from './components/OrbitComponent'
import { RingComponent } from './components/RingComponent'
import { ImposterComponent } from './components/ImposterComponent'
import { MeshComponent } from './components/MeshComponent'
import { DustComponent } from './components/DustComponent'
import { UIZoneComponent } from './components/UIZoneComponent'
import { UITextAnchor, UITextComponent } from './components/UITextComponent'
import { UIImageAnchor, UIImageComponent } from './components/UIImageComponent'
import { UIExitComponent } from './components/UIExitComponent'
import { SphereColliderComponent } from '../collider/components/SphereColliderComponent'

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
        images: true
      },
    }

    const gl = canvas.getContext('webgl2', {
      depth: true,
      stencil: false,
      antialias: true,
    })

    const uiCanvas = new OffscreenCanvas(1920, 1080)
    const uiContext = uiCanvas.getContext('2d', {
      alpha: true,
    })
    const uiTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, uiTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      uiCanvas.width,
      uiCanvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    )
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
      texture: uiTexture,
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

  #renderOrbit(gl, camera, cameraTransform, orbit) {
    const transform = Component.findByIdAndConstructor(
      orbit.id,
      TransformComponent
    )
    if (transform) {
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
    }

    const total = 100
    gl.uniform1i(
      gl.getUniformLocation(this.#programs.get('orbit'), 'u_total'),
      total
    )
    gl.uniform1f(
      gl.getUniformLocation(this.#programs.get('orbit'), 'u_radius'),
      orbit.semiMajorAxis
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
    if (transform) {
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
    const transform = Component.findByIdAndConstructor(
      imposter.id,
      TransformComponent
    )
    if (transform) {
      const cameraRotation = quat.create()
      const cameraPosition = vec3.create()
      const position = vec3.create()

      // FIXME: Sacar este cálculo a #computeViewMatrices
      // porque realmente la rotación y la posición de la cámara
      // se puede extraer de la matriz de transformación de la
      // cámara.
      mat4.getRotation(cameraRotation, cameraTransform.largeScaleMatrix)
      mat4.getTranslation(position, transform.largeScaleMatrix)
      mat4.getTranslation(cameraPosition, cameraTransform.largeScaleMatrix)
      mat4.fromRotationTranslation(this.#model, cameraRotation, position)

      // mat4.targetTo(this.#model, position, cameraPosition, vec3.fromValues(0, 1, 0))
      mat4.multiply(
        this.#projectionViewModel,
        camera.projectionViewMatrix,
        this.#model
      )
      gl.uniformMatrix4fv(
        gl.getUniformLocation(this.#programs.get('imposter'), 'u_view'),
        false,
        // TODO: Ver de qué forma se puede corregir la "rotación"
        //       rara que se forma entre el imposter y la cámara.
        cameraTransform.rotationMatrix
      )
      gl.uniform3fv(
        gl.getUniformLocation(this.#programs.get('imposter'), 'u_position'),
        position
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
      [Body]: [1, 1, 1, 1],
      [Ring]: [0, 1, 0, 1],
      [Zone]: [0, 0, 1, 1],
    }
    const [r, g, b, a] = colors[imposter.body.constructor]
    gl.uniform4f(
      gl.getUniformLocation(this.#programs.get('imposter'), 'u_color'),
      r,
      g,
      b,
      a
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
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
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

  /**
   * Renderiza una vista.
   *
   * @param {WebGLRenderingContext} gl
   * @param {CameraComponent} camera
   */
  #renderView(gl, camera, cameraTransform) {
    const aspectRatio = this.#canvas.width / this.#canvas.height
    camera.projection.aspectRatio = aspectRatio

    this.#computeLargeScaleViewMatrices(camera, cameraTransform)
    this.#renderLargeScale(gl, camera, cameraTransform)

    this.#computeSmallScaleViewMatrices(camera, cameraTransform)
    this.#renderSmallScale(gl, camera, cameraTransform)

    this.#computeIndependentScaleViewMatrices(camera, cameraTransform)
    this.#renderIndependentScale(gl, camera, cameraTransform)
  }

  #renderUIZone(gl, context, camera, cameraTransform, zone) {
    const transform = Component.findByIdAndConstructor(
      zone.id,
      TransformComponent
    )
    if (!transform) return

    mat4.identity(this.#model)
    mat4.invert(camera.viewMatrix, cameraTransform.largeScaleMatrix)
    mat4.multiply(
      camera.projectionViewMatrix,
      camera.projection.matrix,
      camera.viewMatrix
    )

    vec3.transformMat4(
      transform.projectedPosition,
      transform.largeScalePosition,
      camera.projectionViewMatrix
    )

    if (transform.projectedPosition[2] > 1) return

    const x =
      ((1 + transform.projectedPosition[0] / transform.projectedPosition[2]) /
        2) *
      context.canvas.width
    const y =
      ((1 + transform.projectedPosition[1] / -transform.projectedPosition[2]) /
        2) *
      context.canvas.height

    context.strokeStyle = '#fff'
    context.setLineDash([4, 4])
    context.beginPath()
    context.arc(x, y, 32, 0, Math.PI * 2)
    context.stroke()
    context.font = '16px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = 'white'
    context.fillText('ZONE', x, y + 40)
  }

  #renderUIZones(gl, context, camera, cameraTransform, zones) {
    if (!globalThis.debugRenderer.ui.zones) return
    for (const zone of zones) {
      this.#renderUIZone(gl, context, camera, cameraTransform, zone)
    }
  }

  #renderUIText(gl, context, text) {
    context.font = text.font
    context.textAlign = text.textAlign
    context.textBaseline = text.textBaseline
    context.fillStyle = text.fillStyle
    let x = text.x,
      y = text.y
    if (text.anchor) {
      switch (text.anchor) {
        case UITextAnchor.LEFT_TOP:
          x = text.x
          y = text.y
          break

        case UITextAnchor.RIGHT_TOP:
          x = contet.canvas.width + text.dx
          y = text.y
          break

        case UITextAnchor.LEFT_BOTTOM:
          x = text.x
          y = context.canvas.height + text.y
          break

        case UITextAnchor.RIGHT_BOTTOM:
          x = context.canvas.width + text.x
          y = context.canvas.height + text.y
          break

        case UITextAnchor.TOP:
          x = (contxt.canvas.width) / 2 + text.dx
          y = text.y
          break

        case UITextAnchor.BOTTOM:
          x = (context.canvas.width) / 2 + ext.dx
          y = context.canvas.height + text.y
          break

        case UITextAnchor.LEFT:
          x = text.x
          y = (context.canvas.height) / 2 + text.y
          break

        case UITextAnchor.RIGHT:
          x = context.canvas.width + text.x
          y = (context.canvas.height) / 2 + text.y
          break

        default:
        case UITextAnchor.CENTER:
          x = (context.canvas.width) / 2 + text.x
          y = (context.canvas.height) / 2 + text.y
          break
      }
    }
    const lines = `${text.text}`.split('\n') ?? []
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      context.fillText(line, x, y + text.lineHeight * lineIndex)
    }
  }

  #renderUITexts(gl, context, texts) {
    if (!globalThis.debugRenderer.ui.texts) return
    for (const text of texts) {
      this.#renderUIText(gl, context, text)
    }
  }

  #renderUIImage(gl, context, image) {
    let x = 0, y = 0
    switch (image.anchor) {
      case UIImageAnchor.LEFT_TOP:
        x = image.dx
        y = image.dy
        break

      case UIImageAnchor.RIGHT_TOP:
        x = context.canvas.width - image.image.width - image.dx
        y = image.dy
        break

      case UIImageAnchor.LEFT_BOTTOM:
        x = image.dx
        y = context.canvas.height - image.image.height - image.dy
        break

      case UIImageAnchor.RIGHT_BOTTOM:
        x = context.canvas.width - image.image.width - image.dx
        y = context.canvas.height - image.image.height - image.dy
        break

      case UIImageAnchor.TOP:
        x = (context.canvas.width - image.image.width) / 2 + image.dx
        y = image.dy
        break

      case UIImageAnchor.BOTTOM:
        x = (context.canvas.width - image.image.width) / 2 + image.dx
        y = context.canvas.height - image.image.height - image.dy
        break

      case UIImageAnchor.LEFT:
        x = image.dx
        y = (context.canvas.height - image.image.height) / 2 + image.dy
        break

      case UIImageAnchor.RIGHT:
        x = context.canvas.width - image.image.width - image.dx
        y = (context.canvas.height - image.image.height) / 2 + image.dy
        break

      default:
      case UIImageAnchor.CENTER:
        x = (context.canvas.width - image.image.width) / 2 + image.dx
        y = (context.canvas.height - image.image.height) / 2 + image.dy
        break

    }

    context.save()
    context.drawImage(image.image, x, y)
    context.restore()
  }

  #renderUIImages(gl, context, images) {
    if (!globalThis.debugRenderer.ui.images) return
    for (const image of images) {
      this.#renderUIImage(gl, context, image)
    }
  }

  #renderUIExit(gl, context, camera, cameraTransform, exit) {
    const transform = Component.findByIdAndConstructor(
      exit.id,
      TransformComponent
    )
    if (!transform) return

    mat4.identity(this.#model)
    mat4.invert(camera.viewMatrix, cameraTransform.smallScaleMatrix)
    mat4.multiply(
      camera.projectionViewMatrix,
      camera.projection.matrix,
      camera.viewMatrix
    )

    vec3.transformMat4(
      transform.projectedPosition,
      transform.smallScalePosition,
      camera.projectionViewMatrix
    )

    if (transform.projectedPosition[2] > 1) return

    const ppx = transform.projectedPosition[0] / transform.projectedPosition[2]
    const ppy = transform.projectedPosition[1] / -transform.projectedPosition[2]
    if (Math.abs(ppx) < 0.01 && Math.abs(ppy < 0.01)) {
      exit.isAligned = true
    }

    const x =
      ((1 + ppx) /
        2) *
      context.canvas.width
    const y =
      ((1 + ppy) /
        2) *
      context.canvas.height

    context.strokeStyle = '#fff'
    context.setLineDash([4, 4])
    context.beginPath()
    context.arc(x, y, 32, 0, Math.PI * 2)
    context.moveTo(x - 48, y)
    context.lineTo(x + 48, y)
    context.moveTo(x, y - 48)
    context.lineTo(x, y + 48)
    context.stroke()
    context.font = '16px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = 'white'
    context.fillText('ESCAPE VECTOR', x, y + 40)
  }

  #renderUIExits(gl, context, camera, cameraTransform, exits) {
    if (!globalThis.debugRenderer.ui.exits) return
    for (const exit of exits) {
      this.#renderUIExit(gl, context, camera, cameraTransform, exit)
    }
  }

  #renderUI(gl, camera, cameraTransform, context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    const zones = Component.findByConstructor(UIZoneComponent)
    if (zones) {
      this.#renderUIZones(gl, context, camera, cameraTransform, zones)
    }

    const exits = Component.findByConstructor(UIExitComponent)
    if (exits) {
      this.#renderUIExits(gl, context, camera, cameraTransform, exits)
    }

    const images = Component.findByConstructor(UIImageComponent)
    if (images) {
      this.#renderUIImages(gl, context, images)
    }

    const texts = Component.findByConstructor(UITextComponent)
    if (texts) {
      this.#renderUITexts(gl, context, texts)
    }

    // Pintamos todo lo que vaya en el canvas 2D.
    gl.useProgram(this.#programs.get('ui'))
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.#ui.texture)
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
        this.#renderUI(gl, camera, cameraTransform, this.#ui.context)
      }
    }
  }
}
