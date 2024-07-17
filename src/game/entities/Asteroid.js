import { TransformComponent, MeshComponent } from '../../engine/CustomRenderer'
import MeshGeometry from '../../engine/geometries/MeshGeometry'

export const AsteroidSize = {
  SMALL: 0,
  MEDIUM: 1,
  BIG: 2,
}

export const AsteroidSizeResource = {
  [AsteroidSize.SMALL]: 'asteroide-peque.blend.json',
  [AsteroidSize.MEDIUM]: 'asteroide-mediano.blend.json',
  [AsteroidSize.BIG]: 'asteroide-grande.blend.json',
}

export function * Asteroid(game, options) {
  const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
  const transform = new TransformComponent(`asteroid_${id}`, {
    smallScalePosition: options.smallScalePosition
  })

  const type = options?.type ?? AsteroidSize.SMALL
  const resourceName = AsteroidSizeResource[type]
  if (!game.resources.has(`geometries/${resourceName}`)) {
    const model = game.resources.get(`models/${resourceName}`)
    game.resources.set(`geometries/${resourceName}`, new MeshGeometry(model.meshes[0]))
  }
  const geometry = game.resources.get(`geometries/${resourceName}`)
  const mesh = new MeshComponent(`asteroid_${id}`,
    geometry
  )

  while (true) {
    yield
  }
}
