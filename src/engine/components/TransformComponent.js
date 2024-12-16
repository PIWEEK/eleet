import { Component } from '@taoro/component'
import { mat4, vec4, vec3 } from 'gl-matrix'

/**
 * Este componente de transformación tiene dos sistemas
 * de coordenadas, a diferencia de `component-transform-3d`
 * que sólo tiene uno.
 */
export class TransformComponent extends Component {
  static UP = vec3.fromValues(0, 1, 0)
  static FORWARD = vec3.fromValues(0, 0, 1)

  #parentTransform = null

  #rotationMatrix = mat4.create()
  #positionMatrix = mat4.create()
  #largeScaleMatrix = mat4.create()
  #smallScaleMatrix = mat4.create()

  // TODO: Hacen falta dos matrices, la largeScaleMatrix
  // y la smallScaleMatrix.
  #matrix = mat4.create()

  #largeScalePosition = vec3.create()
  #smallScalePosition = vec3.create()
  #projectedPosition = vec4.create()

  #up = vec3.create()
  #forward = vec3.create()

  constructor(id, options) {
    super(id)
    this.#parentTransform = options?.parentTransform ?? null
    this.#largeScalePosition = options?.largeScalePosition ?? vec3.create()
    this.#smallScalePosition = options?.smallScalePosition ?? vec3.create()
  }

  get up() { return this.#up }
  get forward() { return this.#forward }

  get parentTransform() {
    return this.#parentTransform
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

  get largeScaleMatrix() {
    return this.#largeScaleMatrix
  }

  get smallScaleMatrix() {
    return this.#smallScaleMatrix
  }

  get largeScalePosition() {
    return this.#largeScalePosition
  }

  get smallScalePosition() {
    return this.#smallScalePosition
  }

  get projectedPosition() {
    return this.#projectedPosition
  }
}