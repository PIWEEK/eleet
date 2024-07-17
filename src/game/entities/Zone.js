import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-lcg'
import { vec3 } from 'gl-matrix'
import { Asteroid } from './Asteroid'
import { Station } from './Station'

export function * Zone(game, zone) {
  const random = new Random(new RandomProvider(zone.seed ?? 0))
  console.log(zone)
  if (zone) {
    const numAsteroids = random.intBetween(50, 100)
    console.log(numAsteroids)
    for (let index = 0; index < numAsteroids; index++) {
      debugger
      game.scheduler.add(
        Asteroid(game, {
          smallScalePosition: vec3.fromValues(
            random.between(-1000, 1000),
            random.between(-1000, 1000),
            random.between(-1000, 1000),
          ),
        })
      )
    }
  }

  while (true) {
    yield
  }
}

export default Zone
