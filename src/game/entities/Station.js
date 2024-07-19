import { TransformComponent } from '../../engine/renderer/components/TransformComponent'
import { MeshComponent } from '../../engine/renderer/components/MeshComponent'
import MeshGeometry from '../../engine/geometries/MeshGeometry'
import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-lcg'

export function* Station(game, options, sharedState) {
  const random = new Random(new RandomProvider())
  const stationType = random.intBetween(0, 1)
  const stations = [
    'station.blend.json',
    'estacion-pirata.blend.json'
  ]
  const stationModel = stations[stationType]

  const id = Math
    .floor(Math.random() * Number.MAX_SAFE_INTEGER)
    .toString(36)

    const transform = new TransformComponent(`station_${id}`, {
    smallScalePosition: options.smallScalePosition,
  })

  if (!game.resources.has(`geometries/${stationModel}`)) {
    const model = game.resources.get(`models/${stationModel}`)
    game.resources.set(
      `geometries/${stationModel}`,
      new MeshGeometry(model.meshes[0])
    )
  }

  const geometry = game.resources.get(`geometries/${stationModel}`)
  const mesh = new MeshComponent(`station_${id}`, geometry)

  while (!sharedState.exit) {
    yield
  }

  transform.unregister()
  mesh.unregister()
}

export default Station
