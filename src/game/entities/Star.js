import { RandomProvider } from '@taoro/math-random-wasm'
import { Random } from '@taoro/math-random'
import { mat4, vec3 } from 'gl-matrix'
import { TransformComponent } from '../../engine/components/TransformComponent'
import { DustComponent } from '../../engine/renderer/components/DustComponent'
import { RingComponent } from '../../engine/renderer/components/RingComponent'
import { ImposterComponent } from '../../engine/renderer/components/ImposterComponent'
import { EllipseComponent } from '../../engine/renderer/components/EllipseComponent'
import { StarfieldComponent } from '../../engine/renderer/components/StarfieldComponent'
import { UIZoneComponent } from '../../engine/renderer/components/ui/UIZoneComponent'
import { SphereColliderComponent } from '../../engine/simulation/components/SphereColliderComponent'
import { StarfieldGeometry } from '../../engine/renderer/geometries/StarfieldGeometry'
import { ZoneComponent } from '../../engine/simulation/components/ZoneComponent'
import { StarComponent } from '../../engine/simulation/components/StarComponent'
import { PlanetComponent } from '../../engine/simulation/components/PlanetComponent'
import { PlanetRingComponent } from '../../engine/simulation/components/PlanetRingComponent'
import { OrbitBodyComponent } from '../../engine/simulation/components/OrbitBodyComponent'
import { OrbitComponent } from '../../engine/simulation/components/OrbitComponent'
import { BodyType } from '../../engine/BodyType'
import { PlanetTextures } from '../../engine/PlanetTextures'

/**
 * Esta entidad se encarga de la lógica de la generación
 * de estrellas (y el sistema de la estrella).
 *
 * @param {Eleet} game
 * @param {ConfigParams} params
 */
export function * Star(game, params) {
  game.random.seed = params.seed

  game.music.a.buffer = game.resources.get('audio/music/background.wav?taoro:as=audiobuffer')
  game.music.a.start()
  game.music.a.fadeIn()

  const starfield = new StarfieldComponent(
    'starfield',
    new StarfieldGeometry(params.seed)
  )
  const starComponent = new StarComponent('star', {
    seed: game.random.int(),
    radius: game.random.between(1, 2)
  })
  const imposterStar = new ImposterComponent('star', {
    type: BodyType.STAR,
    radius: starComponent.radius,
  })
  const transformStar = new TransformComponent('star')
  const colliderStar = new SphereColliderComponent('star', {
    radius: starComponent.radius * 1.5,
  })

  const dustComponent = new DustComponent('dust')
  game.random.seed = starComponent.seed
  for (let orbitIndex = 0; orbitIndex < 10; orbitIndex++) {
    const minAxis = 25 * orbitIndex
    const maxAxis = 25 * (orbitIndex + 0.5)
    const orbitId = `orbit_${orbitIndex}`
    const transformComponent = new TransformComponent(orbitId, {
      largeScalePosition: vec3.fromValues(0, 0, 0),
    })
    const orbitComponent = new OrbitComponent(orbitId, {
      semiMajorAxis: game.random.between(minAxis, maxAxis),
      semiMinorAxis: game.random.between(minAxis, maxAxis),
    })
    const ellipseComponent = new EllipseComponent(orbitId, {
      semiMajorAxis: orbitComponent.semiMajorAxis,
      semiMinorAxis: orbitComponent.semiMinorAxis
    })

    const numOrbitBodies = game.random.intBetween(1, 3)
    for (let orbitBodyIndex = 0; orbitBodyIndex < numOrbitBodies; orbitBodyIndex++) {
      const orbitBodyId = `orbit_${orbitIndex}_body_${orbitBodyIndex}`
      const transformComponent = new TransformComponent(orbitBodyId)
      // El primer objeto SIEMPRE es un planeta
      if (orbitBodyIndex === 0) {
        const planetComponent = new PlanetComponent(orbitBodyId, {
          orbit: orbitId,
          radius: game.random.between(0.1, 0.6),
          trueAnomaly: game.random.angle(),
        })
        const planetColliderComponent = new SphereColliderComponent(orbitBodyId, {
          radius: planetComponent.radius + 0.1,
        })
        if (planetComponent.radius > 0.5) {
          const planetRingComponent = new PlanetRingComponent(orbitBodyId, {
            innerRadius: planetComponent.radius + 0.5,
            outerRadius: planetComponent.radius + 1.0
          })
          const ringComponent = new RingComponent(orbitBodyId, {
            innerRadius: planetRingComponent.innerRadius,
            outerRadius: planetRingComponent.outerRadius
          })
        }
        const imposterComponent = new ImposterComponent(orbitBodyId, {
          type: BodyType.PLANET,
          radius: planetComponent.radius,
          texture: `textures/bodies/${game.random.pickOne(PlanetTextures)}`,
        })
      } else {
        const zoneComponent = new ZoneComponent(orbitBodyId, {
          orbit: orbitId,
          trueAnomaly: game.random.angle()
        })
        const zoneColliderComponent = new SphereColliderComponent(orbitBodyId, {
          radius: 0.01,
        })
        const uiZoneComponent = new UIZoneComponent(orbitBodyId)
      }
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
