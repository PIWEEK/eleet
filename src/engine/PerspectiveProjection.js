import Updatable from './Updatable'
// import { Matrix4 } from '@taoro/math-matrix4'
import { mat4 } from 'gl-matrix'

export class PerspectiveProjection extends Updatable {
  /**
   * @type {number}
   */
  #fieldOfView = Math.PI * 0.5

  /**
   * @type {number}
   */
  #aspectRatio = 1

  /**
   * @type {number}
   */
  #near = 0.1

  /**
   * @type {number}
   */
  #far = 100

  /**
   * @type {Matrix4}
   */
  #matrix = mat4.create()

  constructor(
    fieldOfView = Math.PI * 0.5,
    aspectRatio = 1,
    near = 0.1,
    far = 1000.0
  ) {
    super()
    this.#fieldOfView = fieldOfView
    this.#aspectRatio = aspectRatio
    this.#near = near
    this.#far = far
  }

  get matrix() {
    if (this.needsUpdate) {
      mat4.perspective(
        this.#matrix,
        this.#fieldOfView,
        this.#aspectRatio,
        this.#near,
        this.#far
      )
      this.updated()
    }
    return this.#matrix
  }

  get fieldOfView() {
    return this.#fieldOfView
  }

  set fieldOfView(newFieldOfView) {
    this.#fieldOfView = newFieldOfView
    this.shouldUpdate()
  }

  get aspectRatio() {
    return this.#aspectRatio
  }

  set aspectRatio(newAspectRatio) {
    this.#aspectRatio = newAspectRatio
    this.shouldUpdate()
  }

  get near() {
    return this.#near
  }

  set near(newNear) {
    this.#near = newNear
    this.shouldUpdate()
  }

  get far() {
    return this.#far
  }

  set far(newFar) {
    this.#far = newFar
    this.shouldUpdate()
  }
}

export default PerspectiveProjection
