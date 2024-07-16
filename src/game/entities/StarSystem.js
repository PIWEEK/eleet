import Vector3 from '@taoro/math-vector3'
import { DustComponent, ImposterComponent, OrbitComponent, StarfieldComponent, TransformComponent } from '../../engine/CustomRenderer'
import { SphereColliderComponent } from '../../engine/CustomCollider'
import { StarfieldGeometry } from '../../engine/geometries/StarfieldGeometry'
import { Matrix4 } from '@taoro/math-matrix4'

export function * StarSystem(game, star) {
  const starfield = new StarfieldComponent('starfield', new StarfieldGeometry(star.seed))
  const imposterStar = new ImposterComponent('imposter_star', star)
  const transformStar = new TransformComponent('imposter_star')
  const colliderStar = new SphereColliderComponent('imposter_star', {
    radius: star.radius * 1.5
  })

  const dustComponent = new DustComponent('dust')

  // TODO: Crear todos los componentes a partir de la estrella.
  for (let orbitIndex = 0; orbitIndex < star.orbits.length; orbitIndex++) {
    const orbit = star.orbits[orbitIndex]
    // OrbitComponent pinta los components
    const orbitComponent = new OrbitComponent(`orbit_${orbitIndex}`, star.orbits[orbitIndex])
    console.log('orbit', orbit, orbitComponent)
    for (let orbitObjectIndex = 0; orbitObjectIndex < orbit.orbitObjects.length; orbitObjectIndex++) {
      const orbitObject = orbit.orbitObjects[orbitObjectIndex]
      console.log('suborbits', orbit, orbitObject, orbitObjectIndex)
      if (orbitObject.type = 'body') {
        const bodyComponent = new ImposterComponent(`imposter_${orbitIndex}_${orbitObjectIndex}`, orbitObject.content)
        const transformComponent = new TransformComponent(`imposter_${orbitIndex}_${orbitObjectIndex}`, {
          largeScalePosition: new Vector3(
            Float32Array,
            orbitObject.x,
            orbitObject.y,
            orbitObject.z
          )
        })
        Matrix4.translate(
          transformComponent.matrix,
          transformComponent.positionMatrix,
          transformComponent.largeScalePosition
        )
      }
    }
  }

  while (true) {
    // TODO: Eventos
    yield
  }
}

export default StarSystem
