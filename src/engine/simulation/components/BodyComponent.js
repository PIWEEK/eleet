import { vec3 } from 'gl-matrix'
import { Component } from '@taoro/component'
import { BodyType } from '../../BodyType'

export class BodyComponent extends Component {
  /**
   * @type {BodyType}
   */
  #type = BodyType.STAR

  velocity = vec3.create()

  angularVelocity = vec3.create()

  angularAcceleration = vec3.fromValues(
    0,
    0,
    0,
  )

  linearAcceleration = vec3.fromValues(
    0,
    0,
    0
  )

  linearVelocity = vec3.fromValues(
    0,
    0,
    0,
  )

  /**
   * Constructor
   *
   * @param {string} id
   * @param {BodyType} type
   * @param {*} [options]
   */
  constructor(id, type, options = {}) {
    super(id, options)
    Component.register(this, BodyComponent, id)
    this.#type = type

    if (options?.linearAcceleration) {
      vec3.copy(this.linearAcceleration, options.linearAcceleration)
    }

    if (options?.angularAcceleration) {
      vec3.copy(this.angularAcceleration, options.angularAcceleration)
    }
  }

  get type() {
    return this.#type
  }
}
