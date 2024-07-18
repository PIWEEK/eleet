import { Component } from '@taoro/component'
import { mat4 } from 'gl-matrix'
import PerspectiveProjection from '../../PerspectiveProjection'

/**
 * Componente cámara que utilizará el renderizador.
 */
export class CameraComponent extends Component {
  #projection = null
  #projectionViewMatrix = mat4.create()
  #viewMatrix = mat4.create()

  constructor(id, options) {
    super(id)
    this.#projection = options?.projection ?? new PerspectiveProjection(
      Math.PI * 0.5,
      1,
      0.1,
      1_000_000
    )
  }

  get projection() {
    return this.#projection
  }

  get projectionViewMatrix() {
    return this.#projectionViewMatrix
  }

  get viewMatrix() {
    return this.#viewMatrix
  }
}