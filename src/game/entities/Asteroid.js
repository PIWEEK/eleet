import { TransformComponent, MeshComponent } from '../../engine/CustomRenderer'
import MeshGeometry from '../../engine/geometries/MeshGeometry'

export function * Asteroid(game) {
  const transform = new TransformComponent('asteroid')
  const model = game.resources.get('models/asteroide-peque.blend.json')
  const mesh = new MeshComponent('asteroid',
    new MeshGeometry(model.meshes[0])
  )

  while (true) {
    yield
  }
}
