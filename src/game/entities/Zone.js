import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-lcg'
import { vec3 } from 'gl-matrix'
import { Asteroid } from './Asteroid'
import { Station } from './Station'

export function * Zone(game, zone) {
  // ÑAPAZA
  // TODO: Esto debería poder exponerse
  // en el motor del juego (la clase
  // game debería permitir el acceso
  // al renderer con game.renderer)
  globalThis.debugRenderer.orbits = false
  globalThis.debugRenderer.ui.zones = false

  const random = new Random(new RandomProvider(zone.seed ?? 0))
  console.log(zone)
  if (zone) {
    const numAsteroids = random.intBetween(50, 100)
    console.log(numAsteroids)
    for (let index = 0; index < numAsteroids; index++) {
      game.scheduler.add(
        Asteroid(game, {
          type: random.intBetween(0, 2),
          smallScalePosition: vec3.fromValues(
            random.between(-50, 50),
            random.between(-50, 50),
            random.between(-50, 50)
          ),
        })
      )
    }
    game.scheduler.add(
      Station(game, {
        smallScalePosition: vec3.fromValues(0, 0, 0),
      })
    )
  }

  while (true) {
    yield
  }

  globalThis.debugRenderer.orbits = true
  globalThis.debugRenderer.ui.zones = true
}

export default Zone
