import { DustComponent, RingComponent, ImposterComponent, OrbitComponent, StarfieldComponent, TransformComponent } from '../../engine/CustomRenderer'
import { SphereColliderComponent } from '../../engine/CustomCollider'
import { StarfieldGeometry } from '../../engine/geometries/StarfieldGeometry'
import { Ring } from '../models/Ring'
// import { Matrix4 } from '@taoro/math-matrix4'
// import { Vector3 } from '@taoro/math-vector3'
import { mat4, vec3 } from 'gl-matrix'

function createComponents(body) {
  // TODO: Crear todos los componentes a partir de la estrella.
  for (let orbitIndex = 0; orbitIndex < body.orbits.length; orbitIndex++) {
    const orbit = body.orbits[orbitIndex]
    // OrbitComponent pinta los components
    const orbitComponent = new OrbitComponent(
      `orbit_${orbitIndex}`,
      body.orbits[orbitIndex]
    )
    console.log('orbit', orbit, orbitComponent)
    for (
      let orbitObjectIndex = 0;
      orbitObjectIndex < orbit.orbitObjects.length;
      orbitObjectIndex++
    ) {
      const orbitObject = orbit.orbitObjects[orbitObjectIndex]
      console.log('suborbits', orbit, orbitObject, orbitObjectIndex)
      const transformComponent = new TransformComponent(
        `orbit_${orbitIndex}_${orbitObjectIndex}`,
        {
          largeScalePosition: vec3.fromValues(
            orbitObject.x,
            orbitObject.y,
            orbitObject.z
          ),
        }
      )
      mat4.translate(
        transformComponent.matrix,
        transformComponent.matrix,
        transformComponent.largeScalePosition
      )
      if (['body','zone'].includes(orbitObject.type)) {
        new ImposterComponent(
          `orbit_${orbitIndex}_${orbitObjectIndex}`,
          orbitObject.content
        )
      }

      if (orbitObject.type === 'ring') {
        new RingComponent(
          `orbit_${orbitIndex}_${orbitObjectIndex}`,
          orbitObject.content
        )
      }
    }
  }
}

export function * StarSystem(game, star) {
  const starfield = new StarfieldComponent(
    'starfield',
    new StarfieldGeometry(star.seed)
  )

  const imposterStar = new ImposterComponent('imposter_star', star)
  const transformStar = new TransformComponent('imposter_star')
  const colliderStar = new SphereColliderComponent('imposter_star', {
    radius: star.radius * 1.5
  })

  new RingComponent(
    'ring',
    new Ring({
      innerRadius: 5,
      outerRadius: 6,
    })
  )

  const dustComponent = new DustComponent('dust')
  createComponents(star)

  while (true) {
    // TODO: Eventos
    yield
  }

  starfield.unregister()
  imposterStar.unregister()
  transformStar.unregister()
  colliderStar.unregister()
  dustComponent.unregister()
}

export default StarSystem
