import { Component } from '@taoro/component'

export class OrbitComponent extends Component {
  #seed = 0
  #semiMajorAxis = 1
  #semiMinorAxis = 1

  constructor(id, options) {
    super(id)
    this.#semiMajorAxis = options?.semiMajorAxis
    this.#semiMinorAxis = options?.semiMinorAxis
  }

  get seed() {
    return this.#seed
  }

  get semiMajorAxis() {
    return this.#semiMajorAxis
  }

  get semiMinorAxis() {
    return this.#semiMinorAxis
  }
}
