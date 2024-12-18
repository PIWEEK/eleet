import { Component } from '@taoro/component'

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

  get type() { return this.#body.type }

  get subtype() { return this.#body.subtype }

  get radius() {
    return this.#body?.radius ?? 5
  }
}
