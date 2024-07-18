import { Component } from '@taoro/component'
import { ColliderScale } from '../CustomCollider'

export class ColliderComponent extends Component {
  #scale = ColliderScale.LARGE
  #collisions = new Map()

  constructor(id, options) {
    super(id)
    this.#scale = options?.scale ?? ColliderScale.LARGE
  }

  get scale() { return this.#scale }
  set scale(newScale) { this.#scale = newScale }
  get collisions() { return this.#collisions }
}
