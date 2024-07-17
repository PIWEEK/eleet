import { Component } from '@taoro/component'
import { TransformComponent } from './CustomRenderer'
import { vec3 } from 'gl-matrix'

export const ColliderScale = {
  LARGE: 1,
  SMALL: 2,
  BOTH:  3
}

export class ColliderComponent extends Component {
  #scale = ColliderScale.LARGE
  #collisions = new Map()

  constructor(id, options) {
    super(id)
    this.#scale = options?.scale ?? ColliderScale.LARGE
  }

  get scale() { return this.#scale }
  get collisions() { return this.#collisions }
}

export class SphereColliderComponent extends ColliderComponent {
  #radius = 1.0

  constructor(id, options) {
    super(id, options)
    Component.registerByConstructor(ColliderComponent, this)
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
  /**
   * En la broadphase comprobamos las colisiones
   * a gran escala entre los elementos que pueden colisionar.
   */
  #broadPhase() {
    const colliders = Component.findByConstructor(SphereColliderComponent)
    if (colliders) {
      for (const collider of colliders) {
        collider.collisions.clear()
      }
      for (let a = 0; a < colliders.length - 1; a++) {
        const aCollider = colliders[a]
        const aTransform = Component.findByIdAndConstructor(
          aCollider.id,
          TransformComponent
        )
        for (let b = 1; b < colliders.length; b++) {
          const bCollider = colliders[b]
          const bTransform = Component.findByIdAndConstructor(
            bCollider.id,
            TransformComponent
          )

          if ((aCollider.scale & ColliderScale.LARGE)
            && vec3.distance(aTransform.largeScalePosition, bTransform.largeScalePosition) <
            aCollider.radius + bCollider.radius
          ) {
            aCollider.collisions.set(bCollider, ColliderScale.LARGE)
            bCollider.collisions.set(aCollider, ColliderScale.LARGE)
          }
          if ((aCollider.scale & ColliderScale.SMALL)
            && vec3.distance(aTransform.smallScalePosition, bTransform.smallScalePosition) <
            aCollider.radius + bCollider.radius
          ) {
            aCollider.colliders.set(bCollider, (aCollider.collisions.get(bCollider) ?? 0) | ColliderScale.SMALL)
            bCollider.colliders.set(aCollider, (bCollider.collisions.get(aCollider) ?? 0) | ColliderScale.SMALL)
          }
        }
      }
    }
  }

  /**
   * En la narrowphase sólo comprobamos aquellas
   * colisiones que se hayan resuelto en la
   * broadphase.
   */
  #narrowPhase() {

  }

  update() {
    this.#broadPhase()
    this.#narrowPhase()
  }
}

export default CustomCollider
