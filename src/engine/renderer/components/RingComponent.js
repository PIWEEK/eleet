import { Component } from '@taoro/component'

export class RingComponent extends Component {
  #innerRadius = 1
  #outerRadius = 1

  constructor(id, options) {
    super(id)
    this.#innerRadius = options?.innerRadius
    this.#outerRadius = options?.outerRadius
  }

  get innerRadius() {
    return this.#innerRadius
  }

  get outerRadius() {
    return this.#outerRadius
  }
}
