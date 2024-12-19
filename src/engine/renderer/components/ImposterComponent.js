import { Component } from '@taoro/component'

export class ImposterComponent extends Component {
  /**
   * Cuerpo (y subcuerpos) que renderizará este componente.
   *
   * @type {BodyType}
   */
  #type = null

  /**
   * Radio del imposter.
   *
   * @type {number}
   */
  #radius = 5

  /**
   * Textura que se va a utilizar del imposter.
   *
   * @type {string}
   */
  #texture = null

  constructor(id, options) {
    super(id)
    this.#type = options?.type
    this.#radius = options?.radius
    this.#texture = options?.texture
  }

  get type() {
    return this.#type
  }

  get radius() {
    return this.#radius ?? 5
  }

  get texture() {
    return this.#texture
  }
}
