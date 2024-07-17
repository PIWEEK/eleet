// import { Matrix4 } from '@taoro/math-matrix4'
// import { Vector3 } from '@taoro/math-vector3'
import { mat4, vec3 } from 'gl-matrix'
import { SphereColliderComponent } from '../../engine/CustomCollider'
import { CameraComponent, TransformComponent, UITextComponent } from '../../engine/CustomRenderer'

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
  const speedUIText = new UITextComponent('player', 
    'HOLA',
    0,
    0,
    '120px monospace',
    'left',
    'top',
    'pink'
  )

  const FORWARD = vec3.fromValues(0, 0, 1)
  const UP = vec3.fromValues(0, 1, 0)

  const velocity = vec3.create()
  const forward = vec3.fromValues(0, 0, 1)
  const up = vec3.fromValues(0, 1, 0)

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

  let flightMode = 'large-scale'

  let rotateX = 0
  let rotateY = 0
  let rotateZ = 0

  while (true) {
    if (collider.collisions.size > 0) {
      // console.log('CHOCÓ!')
      for (const [otherCollider, scale] of collider.collisions) {
        console.log('collision', otherCollider, scale)
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

    vec3.transformMat4(forward, FORWARD, transform.rotationMatrix)
    vec3.transformMat4(up, UP, transform.rotationMatrix)

    vec3.copy(velocity, forward)
    vec3.scale(velocity, velocity, linearVelocity[2])
    vec3.add(transform.largeScalePosition, transform.largeScalePosition, velocity)

    mat4.identity(transform.positionMatrix)
    mat4.translate(transform.positionMatrix, transform.positionMatrix, transform.largeScalePosition)

    mat4.identity(transform.matrix)
    mat4.multiply(transform.matrix, transform.matrix, transform.positionMatrix)
    mat4.multiply(transform.matrix, transform.matrix, transform.rotationMatrix)

    speedUIText.text = velocity[2];
    yield
  }

  transform.unregister()
  camera.unregister()
}

export default Player
