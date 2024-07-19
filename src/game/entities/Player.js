// import { Matrix4 } from '@taoro/math-matrix4'
// import { Vector3 } from '@taoro/math-vector3'
import { mat4, vec3 } from 'gl-matrix'
import { linear } from '@taoro/math-interpolation'
import { ColliderScale } from '../../engine/collider/CustomCollider'
import { SphereColliderComponent } from '../../engine/collider/components/SphereColliderComponent'

import { TransformComponent } from '../../engine/renderer/components/TransformComponent'
import { MeshComponent } from '../../engine/renderer/components/MeshComponent'
import { UITextAnchor, UITextComponent } from '../../engine/renderer/components/UITextComponent'
import { UIImageAnchor, UIImageComponent } from '../../engine/renderer/components/UIImageComponent'
import { UIExitComponent } from '../../engine/renderer/components/UIExitComponent'
import { CameraComponent } from '../../engine/renderer/components/CameraComponent'

import { Zone } from './Zone'
import { Zone as ZoneModel } from '../models/Zone'

function getCurrentDate() {
  const date = new Date()
  return new Date(
    date.getFullYear() + 100,
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  )
}

/**
 * Jugador
 *
 * @param {Game} game
 */
export function * Player(game) {
  // TODO: Todos los objetos del universo necesitan
  // dos sistemas de coordenadas. Las coordenadas "large scale"
  // y las coordenadas "small scale.".
  const transform = new TransformComponent('player', {
    largeScalePosition: vec3.fromValues(-10, -10, -10)
  })
  const camera = new CameraComponent('player')

  const collider = new SphereColliderComponent('player', {
    radius: 0.5,
    scale: ColliderScale.BOTH
  })

  const escapeText = new UITextComponent(
    'player_exit',
    { anchor: UITextAnchor.CENTER, y: -100, textAlign: 'center', text: '' }
  )

  const descriptionText = new UITextComponent(
    'description',
    { anchor: UITextAnchor.CENTER, y: -100, textAlign: 'center', text: '' }
  )

  const dateText = new UITextComponent(
    'player_date',
    { text: '' }
  )

  const velocityText = new UITextComponent('player_vel', {
    y: 20,
    text: 'HOLA',
  })

  const frontRadar = new UIImageComponent('player_front_radar', {
    anchor: UIImageAnchor.LEFT_TOP,
    dx: 20,
    dy: 20,
    image: game.resources.get('images/front.png')
  })

  const rearRadar = new UIImageComponent('player_rear_radar', {
    anchor: UIImageAnchor.RIGHT_TOP,
    dx: 20,
    dy: 20,
    image: game.resources.get('images/rear.png'),
  })

  const cross = new UIImageComponent('player_cross', {
    anchor: UIImageAnchor.CENTER,
    dx: 0,
    dy: 0,
    image: game.resources.get('images/cross.png'),
  })

  const shipInfo = new UIImageComponent('player_ship_info', {
    anchor: UIImageAnchor.LEFT_BOTTOM,
    dx: 20,
    dy: 20,
    image: game.resources.get('images/ship-info.png'),
  })

  const engine = new UIImageComponent('player_engine', {
    anchor: UIImageAnchor.RIGHT_BOTTOM,
    dx: 20,
    dy: 20,
    image: game.resources.get('images/engine.png'),
  })

  const weapons = new UIImageComponent('player_weapons', {
    anchor: UIImageAnchor.RIGHT_BOTTOM,
    dx: 200,
    dy: 20,
    image: game.resources.get('images/weapons.png'),
  })

  // Vector de salida de una zona.
  const exitVector = vec3.create()
  // Vector de entrada en una zona.
  const enterVector = vec3.create()

  let exitTransform = null
  let exitUI = null

  // TODO: Todo esto habría que meterlo en un componente
  //       que controle el sistema de vuelo.
  const velocity = vec3.create()

  const angularAcceleration = vec3.fromValues(
    0.0001,
    0.0001,
    0.0001,
  )

  const linearAcceleration = vec3.fromValues(
    0.0001,
    0.0001,
    0.0001
  )

  const linearVelocity = vec3.fromValues(
    0,
    0,
    0,
  )

  let flightScale = 'large-scale'
  let currentZone = null
  let currentZoneModel = null

  let rotateX = 0
  let rotateY = 0
  let rotateZ = 0

  let canExit = false
  let autoPilot = false
  let autoPilotStart = 0

  const sharedState = {
    exit: false
  }

  while (true) {

    // Si estamos en el modo a pequeña escala actualizamos
    // las coordenadas del vector de escape.
    if (flightScale === 'small-scale') {
      vec3.normalize(
        exitVector,
        transform.smallScalePosition
      )
      const length = vec3.length(transform.smallScalePosition)
      vec3.scale(
        exitVector,
        exitVector,
        length + 100
      )

      if (length > 50 && exitUI && exitUI.isAligned) {
        canExit = true
      } else {
        canExit = false
      }

      if (exitTransform) {
        vec3.copy(exitTransform.smallScalePosition, exitVector)
        mat4.translate(exitTransform.smallScaleMatrix, exitTransform.smallScaleMatrix, exitTransform.smallScalePosition)
      }
    }

    // Si colisionamos y estamos en el modo a gran escala, es que
    // estamos entrando en una zona.
    if (collider.collisions.size > 0 && flightScale === 'large-scale') {
      // debugger
      for (const [otherCollider, collision] of collider.collisions) {
        if (collision.colliders[0] === collider) {
          vec3.subtract(
            enterVector,
            collision.transforms[0].largeScalePosition,
            collision.transforms[1].largeScalePosition
          )
        } else {
          vec3.subtract(
            enterVector,
            collision.transforms[1].largeScalePosition,
            collision.transforms[0].largeScalePosition
          )
        }

        vec3.scale(
          transform.smallScalePosition,
          enterVector,
          100
        )

        rotateX = 0
        rotateY = 0
        rotateZ = 0

        autoPilot = true
        autoPilotStart = Date.now()

        collider.scale = ColliderScale.SMALL

        flightScale = 'small-scale'

        currentZone = Zone(game, otherCollider, sharedState)
        currentZoneModel = new ZoneModel(333)
        
        game.scheduler.add(currentZone)
      }
    }

    if (currentZone !== null) {
      descriptionText.text = currentZoneModel.description
    } else {
      descriptionText.text = ""
    }

    if (!autoPilot) {
      if (game.input.stateOf(0, 'throttle-up')) {
        linearVelocity[2] += linearAcceleration[2]
      } else if (game.input.stateOf(0, 'throttle-down')) {
        linearVelocity[2] -= linearAcceleration[2]
      }

      if (game.input.stateOf(0, 'pitch-up')) {
        rotateX -= angularAcceleration[0]
      } else if (game.input.stateOf(0, 'pitch-down')) {
        rotateX += angularAcceleration[0]
      } else {
        rotateX *= 0.9
      }

      if (game.input.stateOf(0, 'roll-left')) {
        rotateZ += angularAcceleration[2]
      } else if (game.input.stateOf(0, 'roll-right')) {
        rotateZ -= angularAcceleration[2]
      } else {
        rotateZ *= 0.9
      }

      if (game.input.stateOf(0, 'yaw-left')) {
        rotateY += angularAcceleration[1]
      } else if (game.input.stateOf(0, 'yaw-right')) {
        rotateY -= angularAcceleration[1]
      } else {
        rotateY *= 0.9
      }

      if (game.input.stateOf(0, 'fsd') && canExit) {
        vec3.normalize(exitVector, transform.smallScalePosition)
        // const length = vec3.length(transform.smallScalePosition)
        vec3.scale(exitVector, exitVector, 0.1)
        vec3.add(
          transform.largeScalePosition,
          transform.largeScalePosition,
          exitVector
        )
        mat4.translate(
          transform.largeScaleMatrix,
          transform.largeScaleMatrix,
          transform.largeScalePosition
        )

        flightScale = 'large-scale'

        exitUI.unregister()
        exitTransform.unregister()
        exitUI = null
        exitTransform = null

        canExit = false

        sharedState.exit = true
        autoPilot = true
      }
    } else {

      if (sharedState.exit === true) {
        const autoPilotTime = Date.now() - autoPilotStart
        linearVelocity[2] = linear(autoPilotTime / 1000, -0.001, -0.05)

        if (autoPilotTime >= 1000) {
          linearVelocity[2] = -0.05

          sharedState.exit = false
          autoPilot = false
        }
      } else {
        const autoPilotTime = Date.now() - autoPilotStart
        linearVelocity[2] = linear(autoPilotTime / 1000, -0.5, -0.001)

        if (autoPilotTime >= 1000) {
          linearVelocity[2] = -0.001

          exitTransform = new TransformComponent('player_exit', {
            smallScalePosition: vec3.fromValues(0, 0, 0),
          })
          exitUI = new UIExitComponent('player_exit')

          autoPilot = false
        }
      }
    }

    if (rotateZ !== 0) {
      mat4.rotateZ(transform.rotationMatrix, transform.rotationMatrix, rotateZ)
    }

    if (rotateX !== 0) {
      mat4.rotateX(transform.rotationMatrix, transform.rotationMatrix, rotateX)
    }

    if (rotateY !== 0) {
      mat4.rotateY(transform.rotationMatrix, transform.rotationMatrix, rotateY)
    }

    vec3.transformMat4(transform.forward, TransformComponent.FORWARD, transform.rotationMatrix)
    vec3.transformMat4(transform.up, TransformComponent.UP, transform.rotationMatrix)

    vec3.copy(velocity, transform.forward)
    vec3.scale(velocity, velocity, linearVelocity[2])

    if (flightScale === 'large-scale') {
      vec3.add(transform.largeScalePosition, transform.largeScalePosition, velocity)

      mat4.identity(transform.positionMatrix)
      mat4.translate(transform.positionMatrix, transform.positionMatrix, transform.largeScalePosition)

      mat4.identity(transform.largeScaleMatrix)
      mat4.multiply(transform.largeScaleMatrix, transform.largeScaleMatrix, transform.positionMatrix)
      mat4.multiply(transform.largeScaleMatrix, transform.largeScaleMatrix, transform.rotationMatrix)

      mat4.copy(transform.matrix, transform.largeScaleMatrix)
    } else {
      vec3.add(transform.smallScalePosition, transform.smallScalePosition, velocity)

      mat4.identity(transform.positionMatrix)
      mat4.translate(transform.positionMatrix, transform.positionMatrix, transform.largeScalePosition)

      mat4.identity(transform.largeScaleMatrix)
      mat4.multiply(transform.largeScaleMatrix, transform.largeScaleMatrix, transform.positionMatrix)
      mat4.multiply(transform.largeScaleMatrix, transform.largeScaleMatrix, transform.rotationMatrix)

      mat4.identity(transform.positionMatrix)
      mat4.translate(transform.positionMatrix, transform.positionMatrix, transform.smallScalePosition)

      mat4.identity(transform.smallScaleMatrix)
      mat4.multiply(transform.smallScaleMatrix, transform.smallScaleMatrix, transform.positionMatrix)
      mat4.multiply(transform.smallScaleMatrix, transform.smallScaleMatrix, transform.rotationMatrix)

      mat4.copy(transform.matrix, transform.smallScaleMatrix)
    }

    escapeText.text = canExit ? 'FSD' : ''
    dateText.text = getCurrentDate()
    velocityText.text = `${(-linearVelocity[2] * 10000).toFixed(2)}m/s`;
    yield
  }

  transform.unregister()
  camera.unregister()
}

export default Player
