// import { Matrix4 } from '@taoro/math-matrix4'
// import { Vector3 } from '@taoro/math-vector3'
import { mat4, vec3 } from 'gl-matrix'
import { linear } from '@taoro/math-interpolation'
import { Component } from '@taoro/component'
import { SphereColliderComponent } from '../../engine/simulation/components/SphereColliderComponent'

import { TransformComponent } from '../../engine/components/TransformComponent'
import { MeshComponent } from '../../engine/renderer/components/MeshComponent'
import { UITextAnchor, UITextComponent } from '../../engine/renderer/components/UITextComponent'
import { UIImageAnchor, UIImageComponent } from '../../engine/renderer/components/UIImageComponent'
import { UIExitComponent } from '../../engine/renderer/components/UIExitComponent'
import { CameraComponent } from '../../engine/renderer/components/CameraComponent'

import { Zone } from './Zone'
import { Zone as ZoneModel } from '../models/Zone'
import { ShipComponent } from '../../engine/simulation/components/ShipComponent'
import { SimulationScale } from '../../engine/simulation/SimulationScale'

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

  const collider = new SphereColliderComponent('player', {
    radius: 0.5,
    scale: SimulationScale.STELLAR,
  })

  const ship = new ShipComponent('player')

  const camera = new CameraComponent('player')

  const descriptionText = new UITextComponent(
    'description',
    { y: 240, text: 'Lorem ipsum\ndolor sit amet' }
  )

  const escapeText = new UITextComponent(
    'player_exit',
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

  let currentZone = null
  let currentZoneModel = null

  const sharedState = {
    exit: false
  }

  while (true) {

    /*
    if (exitTransform) {
      vec3.copy(exitTransform.smallScalePosition, ship.exitVector)
      mat4.translate(
        exitTransform.smallScaleMatrix,
        exitTransform.smallScaleMatrix,
        exitTransform.smallScalePosition
      )
    }
    */

    if (!ship.autoPilot) {
      if (game.input.stateOf(0, 'throttle-up')) {
        ship.linearVelocity[2] += ship.linearAcceleration[2]
      } else if (game.input.stateOf(0, 'throttle-down')) {
        ship.linearVelocity[2] -= ship.linearAcceleration[2]
      }

      if (game.input.stateOf(0, 'pitch-up')) {
        ship.pitch -= ship.angularAcceleration[0]
      } else if (game.input.stateOf(0, 'pitch-down')) {
        ship.pitch += ship.angularAcceleration[0]
      } else {
        ship.pitch *= 0.9
      }

      if (game.input.stateOf(0, 'roll-left')) {
        ship.roll += ship.angularAcceleration[2]
      } else if (game.input.stateOf(0, 'roll-right')) {
        ship.roll -= ship.angularAcceleration[2]
      } else {
        ship.roll *= 0.9
      }

      if (game.input.stateOf(0, 'yaw-left')) {
        ship.yaw += ship.angularAcceleration[1]
      } else if (game.input.stateOf(0, 'yaw-right')) {
        ship.yaw -= ship.angularAcceleration[1]
      } else {
        ship.yaw *= 0.9
      }

      if (game.input.stateOf(0, 'fsd') && ship.canExit) {
        vec3.normalize(ship.exitVector, transform.smallScalePosition)
        // const length = vec3.length(transform.smallScalePosition)
        vec3.scale(ship.exitVector, ship.exitVector, 0.1)
        vec3.add(
          transform.largeScalePosition,
          transform.largeScalePosition,
          ship.exitVector
        )
        mat4.translate(
          transform.largeScaleMatrix,
          transform.largeScaleMatrix,
          transform.largeScalePosition
        )

        ship.scale = SimulationScale.STELLAR

        exitUI.unregister()
        exitTransform.unregister()
        exitUI = null
        exitTransform = null

        ship.canExit = false

        descriptionText.text = ''
        ship.autoPilot = true
      }
    } else {
      ship.exitTransform = new TransformComponent('player_exit', {
        smallScalePosition: vec3.fromValues(0, 0, 0),
      })
      exitUI = new UIExitComponent('player_exit')
    }

    if (currentZoneModel !== null) {
      if (descriptionText.text.length < currentZoneModel.description.length) {
        descriptionText.text = currentZoneModel.description.slice(
          0,
          descriptionText.text.length + 1
        )
      }
    } else {
      descriptionText.text = ''
    }

    escapeText.text = ship.canExit ? 'FSD' : ''
    dateText.text = getCurrentDate()
    velocityText.text = `${(-ship.linearVelocity[2] * 10000).toFixed(2)}m/s`;
    yield
  }

  Component.unregisterAllById('player')
}

export default Player
