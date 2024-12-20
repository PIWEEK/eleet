import { TransformComponent } from '../../engine/components/TransformComponent'
import { MeshComponent } from '../../engine/renderer/components/MeshComponent'
import { MeshGeometry } from '../../engine/renderer/geometries/MeshGeometry'
import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-wasm'
import { mat4 } from 'gl-matrix'

export function* Station(game, options) {
  const random = new Random(new RandomProvider())
  const stations = ['station-big.blend.json']
  const stationModel = random.pickOne(stations)

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

  while (true) {
    mat4.rotateZ(transform.smallScaleMatrix, transform.smallScaleMatrix, 0.00001)
    yield
  }

  transform.unregister()
  mesh.unregister()
}

export default Station
