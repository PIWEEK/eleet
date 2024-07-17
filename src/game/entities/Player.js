// import { Matrix4 } from '@taoro/math-matrix4'
// import { Vector3 } from '@taoro/math-vector3'
import { mat4, vec3 } from 'gl-matrix'
import { ColliderScale, SphereColliderComponent } from '../../engine/CustomCollider'
import { CameraComponent, TransformComponent, UITextComponent } from '../../engine/CustomRenderer'
import { Zone } from './Zone'

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
    radius: 0.5
  })
  const speedUIText = new UITextComponent(
    'player',
    {
      text: 'HOLA',
    }
  )

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

  let rotateX = 0
  let rotateY = 0
  let rotateZ = 0

  while (true) {
    if (collider.collisions.size > 0 && flightScale === 'large-scale') {
      // console.log('CHOCÓ!')
      for (const [otherCollider, scale] of collider.collisions) {
        console.log('collision', otherCollider, scale)

        collider.scale = ColliderScale.SMALL

        flightScale = 'small-scale'

        currentZone = Zone(game, otherCollider)

        game.scheduler.add(currentZone)
      }
    }

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

    speedUIText.text = flightScale;
    yield
  }

  transform.unregister()
  camera.unregister()
}

export default Player
