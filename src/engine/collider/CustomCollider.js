import { Component } from '@taoro/component'
import { TransformComponent } from '../renderer/components/TransformComponent'
import { vec3 } from 'gl-matrix'
import { SphereColliderComponent } from './components/SphereColliderComponent'


export const ColliderScale = {
  LARGE: 1,
  SMALL: 2,
  BOTH:  3
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
            const collision = {
              scale: ColliderScale.LARGE,
              colliders: [aCollider, bCollider],
              transforms: [aTransform, bTransform]
            }
            aCollider.collisions.set(bCollider, collision)
            bCollider.collisions.set(aCollider, collision)
          }

          if ((aCollider.scale & ColliderScale.SMALL)
            && vec3.distance(aTransform.smallScalePosition, bTransform.smallScalePosition) <
            aCollider.radius + bCollider.radius
          ) {
            const collision = {
              scale: ColliderScale.SMALL,
              colliders: [aCollider, bCollider],
              transforms: [aTransform, bTransform],
            }
            aCollider.colliders.set(bCollider, collision)
            bCollider.colliders.set(aCollider, collision)
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
