import { Matrix4 } from '@taoro/math-matrix4'
import { Vector3 } from '@taoro/math-vector3'
import { SphereColliderComponent } from '../../engine/CustomCollider'
import { CameraComponent, TransformComponent } from '../../engine/CustomRenderer'

/**
 * Jugador
 *
 * @param {Game} game
 */
export function * Player(game) {
  // TODO: Todos los objetos del universo necesitan
  // dos sistemas de coordenadas. Las coordenadas "large scale"
  // y las coordenadas "small scale.".
  const transform = new TransformComponent('player')
  const camera = new CameraComponent('player')
  const collider = new SphereColliderComponent('player', {
    radius: 0.5
  })

  const FORWARD = new Vector3(Float32Array, 0, 0, 1)
  const UP = new Vector3(Float32Array, 0, 1, 0)

  const velocity = new Vector3()
  const forward = new Vector3(Float32Array, 0, 0, 1)
  const up = new Vector3(Float32Array, 0, 1, 0)

  const angularAcceleration = new Vector3(
    Float32Array,
    0.0001,
    0.0001,
    0.0001,
  )

  const linearAcceleration = new Vector3(
    Float32Array,
    0.0001,
    0.0001,
    0.0001
  )

  const linearVelocity = new Vector3(
    Float32Array,
    0,
    0,
    0,
  )

  let flightMode = 'large-scale'

  let rotateX = 0
  let rotateY = 0
  let rotateZ = 0

  while (true) {
    if (collider.collisions.size > 0) {
      console.log('CHOCÓ!')
    }

    if (game.input.stateOf(0, 'throttle-up')) {
      linearVelocity.z += linearAcceleration.z
    } else if (game.input.stateOf(0, 'throttle-down')) {
      linearVelocity.z -= linearAcceleration.z
    }

    if (game.input.stateOf(0, 'pitch-up')) {
      rotateX -= angularAcceleration.x
    } else if (game.input.stateOf(0, 'pitch-down')) {
      rotateX += angularAcceleration.x
    } else {
      rotateX *= 0.9
    }

    if (game.input.stateOf(0, 'roll-left')) {
      rotateZ += angularAcceleration.z
    } else if (game.input.stateOf(0, 'roll-right')) {
      rotateZ -= angularAcceleration.z
    } else {
      rotateZ *= 0.9
    }

    if (game.input.stateOf(0, 'yaw-left')) {
      rotateY += angularAcceleration.y
    } else if (game.input.stateOf(0, 'yaw-right')) {
      rotateY -= angularAcceleration.y
    } else {
      rotateY *= 0.9
    }

    if (rotateZ !== 0) {
      Matrix4.rotateZ(transform.rotationMatrix, transform.rotationMatrix, rotateZ)
    }

    if (rotateX !== 0) {
      Matrix4.rotateX(transform.rotationMatrix, transform.rotationMatrix, rotateX)
    }

    if (rotateY !== 0) {
      Matrix4.rotateY(transform.rotationMatrix, transform.rotationMatrix, rotateY)
    }

    Vector3.transform(forward, FORWARD, transform.rotationMatrix)
    Vector3.transform(up, UP, transform.rotationMatrix)

    velocity.copy(forward).scale(linearVelocity.z)
    transform.largeScalePosition.add(velocity)

    Matrix4.identity(transform.positionMatrix)
    Matrix4.translate(transform.positionMatrix, transform.positionMatrix, transform.largeScalePosition)

    Matrix4.identity(transform.matrix)
    Matrix4.multiply(transform.matrix, transform.matrix, transform.positionMatrix)
    Matrix4.multiply(transform.matrix, transform.matrix, transform.rotationMatrix)

    yield
  }

  transform.unregister()
  camera.unregister()
}

export default Player
