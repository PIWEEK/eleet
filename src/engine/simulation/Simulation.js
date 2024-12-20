import { vec3, mat4 } from 'gl-matrix'
import { linear } from '@taoro/math-interpolation'
import { Component } from '@taoro/component'
import { SimulationScale } from './SimulationScale'
import { ShipComponent } from './components/ShipComponent'
import { TransformComponent } from '../components/TransformComponent'
import { SphereColliderComponent } from './components/SphereColliderComponent'
import { OrbitBodyComponent } from './components/OrbitBodyComponent'
import { OrbitComponent } from './components/OrbitComponent'
import { BodyComponent } from './components/BodyComponent'
import { BodyType } from '../BodyType'
import Zone from '../../game/entities/Zone'

export class Simulation {
  /**
   * Cuerpo en el que se encuentra el jugador, null si no
   * se encuentra en ninguna zona en concreto.
   *
   * @type {BodyComponent}
   */
  #currentBodyComponent = null

  /**
   *
   *
   * @type {TransformComponent}
   */
  #currentBodyTransformComponent = null

  /**
   * @type {Game}
   */
  #game = null

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

          if (
            aCollider.scale & SimulationScale.STELLAR &&
            vec3.distance(
              aTransform.largeScalePosition,
              bTransform.largeScalePosition
            ) <
              aCollider.radius + bCollider.radius
          ) {
            const collision = {
              scale: SimulationScale.STELLAR,
              colliders: [aCollider, bCollider],
              transforms: [aTransform, bTransform],
            }
            aCollider.collisions.set(bCollider, collision)
            bCollider.collisions.set(aCollider, collision)
          }

          if (
            aCollider.scale & SimulationScale.ZONE &&
            vec3.distance(
              aTransform.smallScalePosition,
              bTransform.smallScalePosition
            ) <
              aCollider.radius + bCollider.radius
          ) {
            const collision = {
              scale: SimulationScale.ZONE,
              colliders: [aCollider, bCollider],
              transforms: [aTransform, bTransform],
            }
            aCollider.collisions.set(bCollider, collision)
            bCollider.collisions.set(aCollider, collision)
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
  #narrowPhase() {}

  #updateColliders() {
    this.#broadPhase()
    this.#narrowPhase()
  }

  #updateZones() {
    if (this.#currentBodyComponent) {
    }
  }

  #updateOrbitBodies() {
    const orbitBodies = Component.findByConstructor(OrbitBodyComponent)
    if (!orbitBodies) return

    const identity = mat4.create()
    for (const orbitBody of orbitBodies) {
      const transform = Component.findByIdAndConstructor(
        orbitBody.id,
        TransformComponent
      )
      if (!transform) {
        throw new Error('Orbit body needs a transform component')
      }
      const orbit = Component.findByIdAndConstructor(
        orbitBody.orbit,
        OrbitComponent
      )
      if (!orbit) {
        debugger
        throw new Error('Orbit body needs a orbit component')
      }

      // MEECK
      // orbitBody.trueAnomaly += 0.000001

      const x = Math.cos(orbitBody.trueAnomaly) * orbit.semiMajorAxis
      const y = 0
      const z = Math.sin(orbitBody.trueAnomaly) * orbit.semiMinorAxis

      vec3.set(transform.largeScalePosition, x, y, z)
      mat4.translate(
        transform.largeScaleMatrix,
        identity,
        transform.largeScalePosition
      )
    }
  }

  #updateShips() {
    const ships = Component.findByConstructor(ShipComponent)
    if (!ships) return

    for (const ship of ships) {
      const transform = Component.findByIdAndConstructor(
        ship.id,
        TransformComponent
      )
      if (!transform) {
        throw new Error('A ship needs a transform component')
      }

      const collider = Component.findByIdAndConstructor(
        ship.id,
        SphereColliderComponent
      )
      if (!collider) {
        throw new Error('A ship needs a collider component')
      }

      // Si estamos en el modo a pequeña escala actualizamos
      // las coordenadas del vector de escape.
      if (ship.scale === SimulationScale.ZONE) {
        switch (this.#currentBodyComponent.type) {
          case BodyType.ZONE:
            {
              vec3.normalize(ship.exitVector, transform.smallScalePosition)
              const length = vec3.length(transform.smallScalePosition)
              vec3.scale(ship.exitVector, ship.exitVector, length + 100)

              if (length > 50) {
                ship.canExit = true
              } else {
                ship.canExit = false
              }
            }
            break

          case BodyType.STAR:
          case BodyType.PLANET:
            {
              vec3.subtract(
                ship.exitVector,
                transform.largeScalePosition,
                this.#currentBodyTransformComponent.largeScalePosition
              )
              const length = vec3.length(transform.smallScalePosition)
              vec3.normalize(ship.exitVector, ship.exitVector)
              vec3.scale(ship.exitVector, ship.exitVector, length + 100)
              if (length > 50) {
                ship.canExit = true
              } else {
                ship.canExit = false
              }
            }
            break
        }
      }

      // Si la nave tiene activo el piloto automático
      // entonces lo que hacemos es restringir el movimiento de la
      // nave durante unos segundos.
      if (ship.autoPilot) {
        if (ship.fsd === true) {
          ship.fsd = false
          const autoPilotTime = Date.now() - ship.autoPilotStart
          ship.linearVelocity[2] = linear(autoPilotTime / 1000, -0.001, -0.05)

          if (autoPilotTime >= 1000) {
            ship.linearVelocity[2] = -0.05
            ship.autoPilot = false
          }
        } else {
          const autoPilotTime = Date.now() - ship.autoPilotStart
          ship.linearVelocity[2] = linear(autoPilotTime / 1000, -0.5, -0.001)
          if (autoPilotTime >= 1000) {
            ship.linearVelocity[2] = -0.001
            ship.autoPilot = false
          }
        }
      }

      // Si colisionamos y estamos en el modo a gran escala, podemos estar
      // entrando en una zona, algunas zonas "forzarán" la entrada, como las
      // colisiones con estrellas o planetas y otras zonas simplemente
      // darán la opción de entrar en la zona.
      if (
        collider.collisions.size > 0 &&
        ship.scale === SimulationScale.STELLAR
      ) {
        for (const [otherCollider, collision] of collider.collisions) {
          const bodyComponent = Component.findByIdAndConstructor(
            otherCollider.id,
            BodyComponent
          )
          this.#currentBodyComponent = bodyComponent

          const bodyTransformComponent = Component.findByIdAndConstructor(
            otherCollider.id,
            TransformComponent
          )
          this.#currentBodyTransformComponent = bodyTransformComponent

          // TODO: Asegurarnos de que corregimos la posición del jugador
          //       cuando entra en una zona.
          if (collision.colliders[0] === collider) {
            vec3.subtract(
              ship.enterVector,
              collision.transforms[0].largeScalePosition,
              collision.transforms[1].largeScalePosition
            )
          } else {
            vec3.subtract(
              ship.enterVector,
              collision.transforms[1].largeScalePosition,
              collision.transforms[0].largeScalePosition
            )
          }

          // Colocamos la nave en la posición relativa al vector
          // de entrada.
          vec3.normalize(ship.enterVector, ship.enterVector)
          vec3.scale(transform.smallScalePosition, ship.enterVector, 300)

          ship.pitch = 0
          ship.yaw = 0
          ship.roll = 0

          ship.autoPilot = true
          ship.autoPilotStart = Date.now()

          collider.scale = SimulationScale.ZONE
          ship.scale = SimulationScale.ZONE

          globalThis.debugRenderer.orbits = false
          globalThis.debugRenderer.ui.zones = false

          this.#game.scheduler.add(Zone(this.#game, this.#currentBodyComponent))
        }
      }

      if (ship.roll !== 0) {
        mat4.rotateZ(
          transform.rotationMatrix,
          transform.rotationMatrix,
          ship.roll
        )
      }

      if (ship.pitch !== 0) {
        mat4.rotateX(
          transform.rotationMatrix,
          transform.rotationMatrix,
          ship.pitch
        )
      }

      if (ship.yaw !== 0) {
        mat4.rotateY(
          transform.rotationMatrix,
          transform.rotationMatrix,
          ship.yaw
        )
      }

      vec3.transformMat4(
        transform.forward,
        TransformComponent.FORWARD,
        transform.rotationMatrix
      )
      vec3.transformMat4(
        transform.up,
        TransformComponent.UP,
        transform.rotationMatrix
      )

      vec3.copy(ship.velocity, transform.forward)
      vec3.scale(ship.velocity, ship.velocity, ship.linearVelocity[2])

      // Si esto en la escala "estelar" actualizo la matriz de posición
      // largeScaleMatrix, si entro en la escala "pequeña" o escala de "zona"
      // entonces actualizo la smallScaleMatrix.
      if (ship.scale === SimulationScale.STELLAR) {
        vec3.add(
          transform.largeScalePosition,
          transform.largeScalePosition,
          ship.velocity
        )

        mat4.identity(transform.positionMatrix)
        mat4.translate(
          transform.positionMatrix,
          transform.positionMatrix,
          transform.largeScalePosition
        )

        mat4.identity(transform.largeScaleMatrix)
        mat4.multiply(
          transform.largeScaleMatrix,
          transform.largeScaleMatrix,
          transform.positionMatrix
        )
        mat4.multiply(
          transform.largeScaleMatrix,
          transform.largeScaleMatrix,
          transform.rotationMatrix
        )

        mat4.copy(transform.matrix, transform.largeScaleMatrix)

        // Estos son los cálculos para las matrices de la escala
        // de "zona".
      } else {
        vec3.add(
          transform.smallScalePosition,
          transform.smallScalePosition,
          ship.velocity
        )

        mat4.identity(transform.positionMatrix)
        mat4.translate(
          transform.positionMatrix,
          transform.positionMatrix,
          transform.largeScalePosition
        )

        mat4.identity(transform.largeScaleMatrix)
        mat4.multiply(
          transform.largeScaleMatrix,
          transform.largeScaleMatrix,
          transform.positionMatrix
        )
        mat4.multiply(
          transform.largeScaleMatrix,
          transform.largeScaleMatrix,
          transform.rotationMatrix
        )

        mat4.identity(transform.positionMatrix)
        mat4.translate(
          transform.positionMatrix,
          transform.positionMatrix,
          transform.smallScalePosition
        )

        mat4.identity(transform.smallScaleMatrix)
        mat4.multiply(
          transform.smallScaleMatrix,
          transform.smallScaleMatrix,
          transform.positionMatrix
        )
        mat4.multiply(
          transform.smallScaleMatrix,
          transform.smallScaleMatrix,
          transform.rotationMatrix
        )

        mat4.copy(transform.matrix, transform.smallScaleMatrix)
      }
    }
  }

  constructor(game) {
    this.#game = game
  }

  update() {
    this.#updateColliders()
    this.#updateOrbitBodies()
    this.#updateZones()
    this.#updateShips()
  }
}

export default Simulation
