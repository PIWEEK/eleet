import { Component } from '@taoro/component'

export class RingComponent extends Component {
  #ring = null

  constructor(id, ring) {
    super(id)
    this.#ring = ring
  }

  get ring() {
    return this.#ring
  }

  get innerRadius() {
    return this.#ring.innerRadius
  }

  get outerRadius() {
    return this.#ring.outerRadius
  }
}