import { TransformComponent, MeshComponent } from '../../engine/CustomRenderer'
import MeshGeometry from '../../engine/geometries/MeshGeometry'

export function* Station(game, options) {
  const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
  const transform = new TransformComponent(`asteroid_${id}`, {
    smallScalePosition: options.smallScalePosition,
  })
  if (!game.resources.has('geometries/asteroide-peque.blend.json')) {
    const model = game.resources.get('models/asteroide-peque.blend.json')
    game.resources.set(
      'geometries/asteroide-peque.blend.json',
      new MeshGeometry(model.meshes[0])
    )
  }
  const geometry = game.resources.get('geometries/asteroide-peque.blend.json')
  const mesh = new MeshComponent(`asteroid_${id}`, geometry)

  while (true) {
    yield
  }
}

export default Station
