import { Component } from '@taoro/component'

export class RingComponent extends Component {
  #innerRadius = 1
  #outerRadius = 1
  #texture  = null

  constructor(id, options) {
    super(id)
    this.#innerRadius = options?.innerRadius
    this.#outerRadius = options?.outerRadius
    this.#texture = options?.texture
  }

  get texture() {
    return this.#texture
  }

  get innerRadius() {
    return this.#innerRadius
  }

  get outerRadius() {
    return this.#outerRadius
  }
}
