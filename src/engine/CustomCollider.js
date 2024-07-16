import { Component } from '@taoro/component'

export class ColliderComponent extends Component {
  constructor(id) {
    super(id)
  }
}

export class SphereComponent extends ColliderComponent {
  #radius = 1.0

  constructor(id, options) {
    super(id)
    this.#radius = options?.radius ?? 1.0
  }

  get radius() { return this.#radius }
}

/**
 * Este es el sistema encargado de comprobar
 * las colisiones entre los diferentes elementos
 * del juego.
 */
export class CustomCollider {
  constructor() {
    
  }

  broadPhase() {

  }

  narrowPhase() {

  }

  update() {
    const colliders = Component.getComponentsByConstructor(ColliderComponent)
    if (colliders) {
      for (const collider of colliders) {

      }
    }
  }
}

export default CustomCollider
