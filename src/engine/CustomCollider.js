import { Component } from '@taoro/component'
import { TransformComponent } from './CustomRenderer'

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
            && aTransform.largeScalePosition.distanceTo(
              bTransform.largeScalePosition
            ) <
            aCollider.radius + bCollider.radius
          ) {
            // TODO: Chocan las esferas a gran escala.
            aCollider.collisions.set(bCollider, ['large-scale'])
            bCollider.collisions.set(aCollider, ['large-scale'])
          }
          if ((aCollider.scale & ColliderScale.SMALL)
            && aTransform.smallScalePosition.distanceTo(
              bTransform.smallScalePosition
            ) <
            aCollider.radius + bCollider.radius
          ) {
            // TODO: Chocan las esferas a pequeño escala.
            // aCollider.colliders.set(bCollider, ['small-scale'])
            // bCollider.
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
