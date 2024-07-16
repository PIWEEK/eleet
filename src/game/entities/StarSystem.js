import Vector3 from '@taoro/math-vector3'
import { DustComponent, ImposterComponent, OrbitComponent, StarfieldComponent, TransformComponent } from '../../engine/CustomRenderer'
import { StarfieldGeometry } from '../../engine/geometries/StarfieldGeometry'
import { Matrix4 } from '@taoro/math-matrix4'

export function * StarSystem(game, star) {
  const starfield = new StarfieldComponent('starfield', new StarfieldGeometry(star.seed))
  // const imposterStar = new ImposterComponent('imposter_star', star)
  // new TransformComponent('imposter_star')

  const dustComponent = new DustComponent('dust')

  // TODO: Crear todos los componentes a partir de la estrella.
  for (let orbitIndex = 0; orbitIndex < star.orbits.length; orbitIndex++) {
    const orbit = star.orbits[orbitIndex]
    const orbitComponent = new OrbitComponent(`orbit_${orbitIndex}`, star.orbits[orbitIndex])
    console.log('orbit', orbit, orbitComponent)
    for (let orbitBodyIndex = 0; orbitBodyIndex < orbit.orbitBodies.length; orbitBodyIndex++) {
      const orbitBody = orbit.orbitBodies[orbitBodyIndex]
      console.log('suborbits', orbit, orbitBody, orbitBodyIndex)
      const bodyComponent = new ImposterComponent(`imposter_${orbitIndex}_${orbitBodyIndex}`, orbitBody.body)
      const transformComponent = new TransformComponent(`imposter_${orbitIndex}_${orbitBodyIndex}`)
      const position = new Vector3(
        Float32Array,
        orbitBody.x,
        orbitBody.y,
        orbitBody.z
      )
      Matrix4.translate(
        transformComponent.matrix,
        transformComponent.positionMatrix,
        position
      )
    }
  }

  while (true) {
    // TODO: Eventos
    yield
  }
}

export default StarSystem
