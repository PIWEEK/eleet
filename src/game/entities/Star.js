import { RandomProvider } from '@taoro/math-random-wasm'
import { Random } from '@taoro/math-random'
import { mat4, vec3 } from 'gl-matrix'
import { TransformComponent } from '../../engine/components/TransformComponent'
import { DustComponent } from '../../engine/renderer/components/DustComponent'
import { RingComponent } from '../../engine/renderer/components/RingComponent'
import { ImposterComponent } from '../../engine/renderer/components/ImposterComponent'
import { OrbitComponent } from '../../engine/renderer/components/OrbitComponent'
import { StarfieldComponent } from '../../engine/renderer/components/StarfieldComponent'
import { UIZoneComponent } from '../../engine/renderer/components/UIZoneComponent'
import { SphereColliderComponent } from '../../engine/simulation/components/SphereColliderComponent'
import { StarfieldGeometry } from '../../engine/renderer/geometries/StarfieldGeometry'
import { ZoneComponent } from '../../engine/simulation/components/ZoneComponent'
import { StarComponent } from '../../engine/simulation/components/StarComponent'
import { PlanetComponent } from '../../engine/simulation/components/PlanetComponent'
import { BodyType } from '../../engine/BodyType'
import { OrbitBodyComponent } from '../../engine/simulation/components/OrbitBodyComponent'

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
        new PlanetComponent(
          orbitObjectId,
          {
            radius: random.between(0.1, 0.6)
          }
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
        new ZoneComponent(
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

export function * Star(game, params) {
  const starfield = new StarfieldComponent(
    'starfield',
    new StarfieldGeometry(params.seed)
  )
  const random  = new Random(new RandomProvider(params.seed))

  const star = new StarComponent('star', {
    seed: random.int(),
    radius: random.between(1, 2)
  })
  const imposterStar = new ImposterComponent('star', {
    type: BodyType.STAR,
    radius: star.radius
  })
  const transformStar = new TransformComponent('star')
  const colliderStar = new SphereColliderComponent('star', {
    radius: star.radius * 1.5
  })

  const dustComponent = new DustComponent('dust')
  // createComponents(star)
  random.seed = star.seed
  for (let orbitIndex = 0; orbitIndex < 10; orbitIndex++) {
    const minAxis = 50 * (orbitIndex - 0.5)
    const maxAxis = 50 * (orbitIndex - 0.5)
    const orbitId = `orbit_${orbitIndex}`
    const orbitComponent = new OrbitComponent(orbitId, {
      semiMajorAxis: random.between(minAxis, maxAxis),
      semiMinorAxis: random.between(minAxis, maxAxis)
    })
    const transformComponent = new TransformComponent(orbitId, {
      largeScalePosition: vec3.fromValues(0, 0, 0),
    })

    const numOrbitBodies = random.intBetween(1, 3)
    for (let orbitBodyIndex = 0; orbitBodyIndex < numOrbitBodies; orbitBodyIndex++) {
      const orbitBodyId = `orbit_${orbitIndex}_body_${orbitBodyIndex}`
      const planetComponent = new PlanetComponent(orbitBodyId, {
        orbit: orbitId,
        trueAnomaly: random.value()
      })
      const transformComponent = new TransformComponent(orbitBodyId)
    }
  }

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

export default Star