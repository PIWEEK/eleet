import { TransformComponent, MeshComponent } from '../../engine/CustomRenderer'
import MeshGeometry from '../../engine/geometries/MeshGeometry'

export function* Station(game, options) {
  const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
  const transform = new TransformComponent(`asteroid_${id}`, {
    smallScalePosition: options.smallScalePosition,
  })
  if (!game.resources.has('geometries/station.blend.json')) {
    const model = game.resources.get('models/station.blend.json')
    game.resources.set(
      'geometries/station.blend.json',
      new MeshGeometry(model.meshes[0])
    )
  }
  const geometry = game.resources.get('geometries/station.blend.json')
  const mesh = new MeshComponent(`asteroid_${id}`, geometry)

  while (true) {
    yield
  }
}

export default Station
