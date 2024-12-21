import { mat4, vec3 } from 'gl-matrix'
import { Component } from '@taoro/component'
import { TransformComponent } from '../components/TransformComponent'
import { UIZoneComponent } from './components/ui/UIZoneComponent'
import { UITextAnchor, UITextComponent } from './components/ui/UITextComponent'
import {
  UIImageAnchor,
  UIImageComponent,
} from './components/ui/UIImageComponent'
import { UIExitComponent } from './components/ui/UIExitComponent'
import { UIRadarComponent } from './components/ui/UIRadarComponent'
import { UIRadarItemComponent } from './components/ui/UIRadarItemComponent'

export class UIRenderer {
  #canvas = null
  #context = null

  constructor(options) {
    this.#canvas = new OffscreenCanvas(1920, 1080)
    this.#context = this.#canvas.getContext('2d', {
      alpha: true,
    })
  }

  get canvas() {
    return this.#canvas
  }

  get context() {
    return this.#context
  }

  get width() {
    return this.#canvas.width
  }

  set width(value) {
    this.#canvas.width = value
  }

  get height() {
    return this.#canvas.height
  }

  set height(value) {
    this.#canvas.height = value
  }

  #computeProjectedPositions(camera, cameraTransform) {
    const projectableComponents = Component.findByConstructors(
      UIZoneComponent,
      UIExitComponent,
      UIRadarItemComponent
    )
    for (const projectableComponent of projectableComponents) {
      const transform = Component.findByIdAndConstructor(
        projectableComponent.id,
        TransformComponent
      )
      if (!transform) return

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
    }
  }

  // TODO: Quizá sería interesante pintar esto dentro de un canvas temporal
  //       y que se pueda volcar en una textura y que se extraiga esto del
  //       sistema de rendering y meterlo mejor en el sistema de simulación
  //       o incluso en un sistema nuevo que se llame algo así como HUD.
  #renderUIRadar(radar) {
    const transform = Component.findByIdAndConstructor(
      radar.id,
      TransformComponent
    )
    if (!transform) return

    if (transform.projectedPosition[2] > 1) return

    const x =
      ((1 + transform.projectedPosition[0] / transform.projectedPosition[2]) /
        2) *
      this.#context.canvas.width
    const y =
      ((1 + transform.projectedPosition[1] / -transform.projectedPosition[2]) /
        2) *
      this.#context.canvas.height

    this.#context.save()
    this.#context.translate(x, y)
    this.#context.fillRect()
    this.#context.restore()
  }

  #renderUIRadars(radars) {
    if (!globalThis.debugRenderer.ui.radars) return
    for (const radar of radars) {
      this.#renderUIRadar(radar)
    }
  }

  #renderUIZone(zone) {
    const transform = Component.findByIdAndConstructor(
      zone.id,
      TransformComponent
    )
    if (!transform) return

    if (transform.projectedPosition[2] > 1) return

    const x =
      ((1 + transform.projectedPosition[0] / transform.projectedPosition[2]) /
        2) *
      this.#context.canvas.width
    const y =
      ((1 + transform.projectedPosition[1] / -transform.projectedPosition[2]) /
        2) *
      this.#context.canvas.height

    this.#context.save()
    this.#context.translate(x, y)
    this.#context.strokeStyle = '#fff'
    this.#context.setLineDash([4, 4])
    this.#context.beginPath()
    this.#context.arc(0, 0, 32, 0, Math.PI * 2)
    this.#context.stroke()
    this.#context.font = '16px monospace'
    this.#context.textAlign = 'center'
    this.#context.textBaseline = 'top'
    this.#context.fillStyle = 'white'
    this.#context.fillText('ZONE', 0, 40)
    this.#context.restore()
  }

  #renderUIZones(zones) {
    if (!globalThis.debugRenderer.ui.zones) return
    for (const zone of zones) {
      this.#renderUIZone(zone)
    }
  }

  #renderUIText(text) {
    this.#context.font = text.font
    this.#context.textAlign = text.textAlign
    this.#context.textBaseline = text.textBaseline
    this.#context.fillStyle = text.fillStyle
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
          y = this.#context.canvas.height + text.y
          break

        case UITextAnchor.RIGHT_BOTTOM:
          x = this.#context.canvas.width + text.x
          y = this.#context.canvas.height + text.y
          break

        case UITextAnchor.TOP:
          x = contxt.canvas.width / 2 + text.dx
          y = text.y
          break

        case UITextAnchor.BOTTOM:
          x = this.#context.canvas.width / 2 + ext.dx
          y = this.#context.canvas.height + text.y
          break

        case UITextAnchor.LEFT:
          x = text.x
          y = this.#context.canvas.height / 2 + text.y
          break

        case UITextAnchor.RIGHT:
          x = this.#context.canvas.width + text.x
          y = this.#context.canvas.height / 2 + text.y
          break

        default:
        case UITextAnchor.CENTER:
          x = this.#context.canvas.width / 2 + text.x
          y = this.#context.canvas.height / 2 + text.y
          break
      }
    }
    const lines = `${text.text}`.split('\n') ?? []
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      this.#context.fillText(line, x, y + text.lineHeight * lineIndex)
    }
  }

  #renderUITexts(texts) {
    if (!globalThis.debugRenderer.ui.texts) return
    for (const text of texts) {
      this.#renderUIText(text)
    }
  }

  #renderUIImage(image) {
    let x = 0,
      y = 0
    switch (image.anchor) {
      case UIImageAnchor.LEFT_TOP:
        x = image.dx
        y = image.dy
        break

      case UIImageAnchor.RIGHT_TOP:
        x = this.#context.canvas.width - image.image.width - image.dx
        y = image.dy
        break

      case UIImageAnchor.LEFT_BOTTOM:
        x = image.dx
        y = this.#context.canvas.height - image.image.height - image.dy
        break

      case UIImageAnchor.RIGHT_BOTTOM:
        x = this.#context.canvas.width - image.image.width - image.dx
        y = this.#context.canvas.height - image.image.height - image.dy
        break

      case UIImageAnchor.TOP:
        x = (this.#context.canvas.width - image.image.width) / 2 + image.dx
        y = image.dy
        break

      case UIImageAnchor.BOTTOM:
        x = (this.#context.canvas.width - image.image.width) / 2 + image.dx
        y = this.#context.canvas.height - image.image.height - image.dy
        break

      case UIImageAnchor.LEFT:
        x = image.dx
        y = (this.#context.canvas.height - image.image.height) / 2 + image.dy
        break

      case UIImageAnchor.RIGHT:
        x = this.#context.canvas.width - image.image.width - image.dx
        y = (this.#context.canvas.height - image.image.height) / 2 + image.dy
        break

      default:
      case UIImageAnchor.CENTER:
        x = (this.#context.canvas.width - image.image.width) / 2 + image.dx
        y = (this.#context.canvas.height - image.image.height) / 2 + image.dy
        break
    }

    this.#context.save()
    this.#context.drawImage(image.image, x, y)
    this.#context.restore()
  }

  #renderUIImages(images) {
    if (!globalThis.debugRenderer.ui.images) return
    for (const image of images) {
      this.#renderUIImage(image)
    }
  }

  #renderUIExit(exit) {
    const transform = Component.findByIdAndConstructor(
      exit.id,
      TransformComponent
    )
    if (!transform) return

    if (transform.projectedPosition[2] > 1) return

    const ppx = transform.projectedPosition[0] / transform.projectedPosition[2]
    const ppy = transform.projectedPosition[1] / -transform.projectedPosition[2]
    if (Math.abs(ppx) < 0.01 && Math.abs(ppy < 0.01)) {
      exit.isAligned = true
    }

    const x = ((1 + ppx) / 2) * this.#context.canvas.width
    const y = ((1 + ppy) / 2) * this.#context.canvas.height

    this.#context.save()
    this.#context.translate(x, y)
    this.#context.setLineDash([4, 4])
    this.#context.beginPath()
    this.#context.arc(0, 0, 32, 0, Math.PI * 2)
    this.#context.moveTo(-48, 0)
    this.#context.lineTo( 48, 0)
    this.#context.moveTo(0, -48)
    this.#context.lineTo(0,  48)
    this.#context.strokeStyle = '#fff'
    this.#context.stroke()
    this.#context.font = '16px monospace'
    this.#context.textAlign = 'center'
    this.#context.textBaseline = 'top'
    this.#context.fillStyle = 'white'
    this.#context.fillText('ESCAPE VECTOR', 0, 40)
    this.#context.restore()
  }

  #renderUIExits(exits) {
    if (!globalThis.debugRenderer.ui.exits) return
    for (const exit of exits) {
      this.#renderUIExit(exit)
    }
  }

  render(camera, cameraTransform) {
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
    this.#computeProjectedPositions(camera, cameraTransform)
    const zones = Component.findByConstructor(UIZoneComponent)
    if (zones) {
      this.#renderUIZones(zones)
    }

    const exits = Component.findByConstructor(UIExitComponent)
    if (exits) {
      this.#renderUIExits(exits)
    }

    const images = Component.findByConstructor(UIImageComponent)
    if (images) {
      this.#renderUIImages(images)
    }

    const texts = Component.findByConstructor(UITextComponent)
    if (texts) {
      this.#renderUITexts(texts)
    }

    const radars = Component.findByConstructor(UIRadarComponent)
    if (radars) {
      this.#renderUIRadars(radars)
    }
  }
}
