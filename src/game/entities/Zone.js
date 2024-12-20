import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-wasm'
import { vec3 } from 'gl-matrix'
import { Asteroid } from './Asteroid'
import { Station } from './Station'
import BodyType from '../../engine/BodyType'

export function * Zone(game, zone) {
  // ÑAPAZA
  // TODO: Esto debería poder exponerse
  // en el motor del juego (la clase
  // game debería permitir el acceso
  // al renderer con game.renderer)
  globalThis.debugRenderer.orbits = false
  globalThis.debugRenderer.ui.zones = false

  game.random.seed = zone.seed
  if (zone.type === BodyType.PLANET) {
    // Esto es la generación de la zona, que le mete unos asteroides y una Station
    const numAsteroids = game.random.intBetween(50, 100)
    console.log(numAsteroids)
    for (let index = 0; index < numAsteroids; index++) {
      game.scheduler.add(
        Asteroid(
          game,
          {
            type: game.random.intBetween(0, 2),
            smallScalePosition: vec3.fromValues(
              game.random.between(-50, 50),
              game.random.between(-50, 50),
              game.random.between(-50, 50)
            ),
          }
        )
      )
    }
  }

  if (zone.type === BodyType.ZONE) {
    game.scheduler.add(
      Station(
        game,
        {
          smallScalePosition: vec3.fromValues(0, 0, 0),
        }
      )
    )
  }

  globalThis.debugRenderer.orbits = true
  globalThis.debugRenderer.ui.zones = true
}

export default Zone
