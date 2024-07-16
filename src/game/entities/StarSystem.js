import { ImposterComponent, OrbitComponent, StarfieldComponent, TransformComponent } from '../../engine/CustomRenderer'
import { StarfieldGeometry } from '../../engine/geometries/StarfieldGeometry'

export function * StarSystem(game, star) {
  const starfield = new StarfieldComponent('starfield', new StarfieldGeometry(star.seed))
  const imposterStar = new ImposterComponent('imposter_star', star)
  new TransformComponent('imposter_star')
  // TODO: Crear todos los componentes a partir de la estrella.
  for (let orbitIndex = 0; orbitIndex < star.orbits.length; orbitIndex++) {
    const orbit = star.orbits[orbitIndex]
    const orbitComponent = new OrbitComponent(`orbit_${orbitIndex}`, star.orbits[orbitIndex])
    console.log(orbit, orbitComponent)
    for (let orbitBodyIndex = 0; orbitBodyIndex < orbit.orbitBodies.length; orbitBodyIndex++) {
      const imposterComponent = new ImposterComponent(`imposter_${orbitIndex}_${orbitBodyIndex}`, {})
    }
  }

  while (true) {
    yield
  }
}

export default StarSystem
