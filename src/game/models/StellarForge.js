import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-lcg'
import { Body } from './Body'
import { Orbit } from './Orbit'
import { OrbitContent } from './OrbitContent'
import { Zone } from './Zone'

// Radio del sol: 696.340.000 metros
// Radio de mercurio: 2.440.000 metros
// Distancia mercurio: 58.000.000.000 metros
// Radio de venus: 6.051.000 metros
// Distancia venus: 108.000.000.000 metros
// Radio de la tierra: 6.371.000 metros
// Radio de la luna: 1.737.000 metros
// Radio de ceres: 473.000 metros
// Radio de marte: 3.300.000 metros
// Radio de jupiter: 69.911.000 metros
// Radio de saturno: 58.232.000 metros
// Radio de neptuno: 24.622.000 metros
// Radio de urano: 25.362.000 metros
// Radio de pluton: 1.188.300 metros
// UA: 149.597.870.700 metros

/**
 * Forja estelar.
 *
 * Cuando le pasamos una semilla, genera un sistema estelar.
 */
export class StellarForge {
  // Unidad Astronómica
  static AU = 149.597
  static ORBIT_DISTANCE = 50.00

  /**
   * Constructor
   *
   * @param {number} seed Semilla utilizada para generar la estrella.
   * @returns {Body} Estrella generada con todas sus órbitas
   */
  static create(seed) {
    const random = new Random(new RandomProvider(seed))
    const star = new Body({
      seed,
      radius: random.between(0.5, 1.5)
    })
    const numOrbits = random.intBetween(5, 9)
    for (let orbitIndex = 0; orbitIndex < numOrbits; orbitIndex++) {
      const orbit = new Orbit({
        body: star,
        semiMajorAxis: random.between(
          StellarForge.ORBIT_DISTANCE * (orbitIndex - 0.5),
          StellarForge.ORBIT_DISTANCE * (orbitIndex + 0.5)
        ),
        eccentricity: 0,
      })

      const orbitType = random.between(0, 1) > 0.5 ? 'body': 'zone'
      orbit.orbitObjects.push(
        new OrbitContent({
          orbit: orbit,
          type: orbitType,
          content: (orbitType == 'body') ?
            new Body({
              seed: random.seed,
              // Devuelve un planeta entre el tamaño de mercurio
              // y el tamaño de jupiter.
              radius: random.between(0.1, 0.6),
            })
            : 
            new Zone({
              seed: random.seed,
            }),
          trueAnomaly: random.angle()
        })
      )
      star.orbits.push(orbit)
    }
    return star
  }
}
