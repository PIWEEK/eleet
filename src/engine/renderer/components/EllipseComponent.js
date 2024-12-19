import { Component } from '@taoro/component'

export class EllipseComponent extends Component {
  #semiMajorAxis = 1
  #semiMinorAxis = 1

  constructor(id, options) {
    super(id)
    this.#semiMajorAxis = options?.semiMajorAxis ?? 1
    this.#semiMinorAxis = options?.semiMinorAxis ?? 1
  }

  get semiMajorAxis() {
    return this.#semiMajorAxis
  }

  get semiMinorAxis() {
    return this.#semiMinorAxis
  }
}
