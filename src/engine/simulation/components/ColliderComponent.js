import { Component } from '@taoro/component'
import { SimulationScale } from '../SimulationScale'

export class ColliderComponent extends Component {
  #scale = SimulationScale.STELLAR
  #collisions = new Map()

  constructor(id, options) {
    super(id)
    // Necesitamos hacer esto en los componentes base.
    Component.register(this, ColliderComponent)
    this.#scale = options?.scale ?? SimulationScale.STELLAR
  }

  get scale() {
    return this.#scale
  }
  set scale(newScale) {
    this.#scale = newScale
  }
  get collisions() {
    return this.#collisions
  }
}
