import { Component } from '@taoro/component'

export class OrbitComponent extends Component {
  #orbit = null

  constructor(id, orbit) {
    super(id)
    this.#orbit = orbit
  }

  get orbit() {
    return this.#orbit
  }

  get semiMajorAxis() {
    return this.#orbit.semiMajorAxis
  }

  get semiMinorAxis() {
    return this.#orbit.semiMinorAxis
  }
}
