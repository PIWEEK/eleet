import { TransformComponent } from '../../engine/components/TransformComponent'
import { DustComponent } from '../../engine/renderer/components/DustComponent'
import { RingComponent } from '../../engine/renderer/components/RingComponent'
import { ImposterComponent } from '../../engine/renderer/components/ImposterComponent'
import { OrbitComponent } from '../../engine/renderer/components/OrbitComponent'
import { StarfieldComponent } from '../../engine/renderer/components/StarfieldComponent'
import { UIZoneComponent } from '../../engine/renderer/components/UIZoneComponent'

import { SphereColliderComponent } from '../../engine/collider/components/SphereColliderComponent'
import { StarfieldGeometry } from '../../engine/renderer/geometries/StarfieldGeometry'
// import { Matrix4 } from '@taoro/math-matrix4'
// import { Vector3 } from '@taoro/math-vector3'
import { mat4, vec3 } from 'gl-matrix'

function createComponents(body) {
  for (let orbitIndex = 0; orbitIndex < body.orbits.length; orbitIndex++) {
    const orbit = body.orbits[orbitIndex]
    const orbitId = `orbit_${orbitIndex}`
    const orbitComponent = new OrbitComponent(
      orbitId,
      body.orbits[orbitIndex]
    )
    const transformComponent = new TransformComponent(
      orbitId,
      {
        largeScalePosition: vec3.fromValues(
          0, 0, 0
        )
      }
    )
    console.log('orbit', orbit, orbitComponent)
    for (
      let orbitObjectIndex = 0;
      orbitObjectIndex < orbit.orbitObjects.length;
      orbitObjectIndex++
    ) {
      const orbitObject = orbit.orbitObjects[orbitObjectIndex]
      console.log('suborbits', orbit, orbitObject, orbitObjectIndex)
      const orbitObjectId = `orbit_${orbitIndex}_${orbitObjectIndex}`
      const transformComponent = new TransformComponent(
        orbitObjectId,
        {
          largeScalePosition: vec3.fromValues(
            orbitObject.x,
            orbitObject.y,
            orbitObject.z
          ),
        }
      )
      mat4.translate(
        transformComponent.largeScaleMatrix,
        transformComponent.largeScaleMatrix,
        transformComponent.largeScalePosition
      )
      if (orbitObject.type === 'body') {
        new ImposterComponent(
          orbitObjectId,
          orbitObject.content,
        )
        new SphereColliderComponent(
          orbitObjectId,
          {
            radius: orbitObject.content.radius + 0.1
          }
        )
      }

      if (orbitObject.type === 'zone') {
        new UIZoneComponent(
          orbitObjectId
        )
        new SphereColliderComponent(
          orbitObjectId,
          {
            radius: 0.1,
          }
        )
      }

      if (orbitObject.type === 'ring') {
        new RingComponent(
          orbitObjectId,
          orbitObject.content
        )
      }

      if (orbitObject.type === 'body') {
        createComponents(orbitObject.content)
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
