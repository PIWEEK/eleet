import { TransformComponent } from '../../engine/renderer/components/TransformComponent'
import { MeshComponent } from '../../engine/renderer/components/MeshComponent'
import MeshGeometry from '../../engine/geometries/MeshGeometry'

export function* Station(game, options, sharedState) {
  const id = Math
    .floor(Math.random() * Number.MAX_SAFE_INTEGER)
    .toString(36)

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

  while (!sharedState.exit) {
    yield
  }

  transform.unregister()
  mesh.unregister()
}

export default Station
