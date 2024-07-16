import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-lcg'
import { Body } from './Body'
import { Orbit } from './Orbit'
import { OrbitBody } from './OrbitBody'

// Radio del sol: 696.340.000 metros
// Radio de mercurio: 2.440.000 metros
// Radio de venus: 6.051.000 metros
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

// Unidad Astronómica
const AU = 149.597

/**
 * Forja estelar.
 *
 * Cuando le pasamos una semilla, genera un sistema estelar.
 */
export class StellarForge {
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
    for (let orbitIndex = 1; orbitIndex <= numOrbits; orbitIndex++) {
      const orbit = new Orbit({
        body: star,
        semiMajorAxis: random.between(
          AU * (orbitIndex - 0.5),
          AU * (orbitIndex + 0.5)
        ),
        eccentricity: 0,
      })
      orbit.orbitBodies.push(
        new OrbitBody({
          orbit: orbit,
          body: new Body({
            seed: random.seed,
            // Devuelve un planeta entre el tamaño de mercurio
            // y el tamaño de jupiter.
            radius: random.between(0.1, 0.6),
          }),
          trueAnomaly: random.angle(),
        })
      )
      star.orbits.push(orbit)
    }
    return star
  }
}
