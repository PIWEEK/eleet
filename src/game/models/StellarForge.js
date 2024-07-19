import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-lcg'
import { Body, BodyType } from './Body'
import { Ring } from './Ring'
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
  /**
   * Órbitas
   *
   * @type {Array<Orbit>}
   */
  #orbits = []

  /**
   * Cuerpos
   *
   * @type {Array<Body>}
   */
  #bodies = []

  // Unidad Astronómica
  static AU = 149.597
  static ORBIT_DISTANCE = 50.00

  /**
   * Creates a new orbit object.
   *
   * @param {Random} random
   * @param {Orbit} orbit
   * @param {string} type
   * @returns {Body|Ring|Zone}
   */
  #createOrbitObject(random, orbit, type) {
    switch (type) {
      case 'body':
        return new Body({
          type: BodyType.PLANET,
          seed: random.seed,
          // Devuelve un planeta entre el tamaño de mercurio
          // y el tamaño de jupiter.
          radius: random.between(0.1, 0.6),
        })

      case 'ring':
        return new Ring({
          seed: random.seed,
          innerRadius: random.between(orbit.semiMajorAxis - 50, orbit.semiMajorAxis - 25),
          outerRadius: random.between(orbit.semiMajorAxis + 25, orbit.semiMajorAxis + 50)
        })

      case 'zone':
        return new Zone({
          seed: random.seed
        })
    }
  }

  #createBodyOrbits(random, body, maxDepth = 0, depth = 0) {
    const numOrbits = random.intBetween(5, 9)
    for (let orbitIndex = 0; orbitIndex < numOrbits; orbitIndex++) {
      const orbit = new Orbit({
        body: body,
        semiMajorAxis: random.between(
          StellarForge.ORBIT_DISTANCE * (orbitIndex - 0.5),
          StellarForge.ORBIT_DISTANCE * (orbitIndex + 0.5)
        ),
        eccentricity: 0,
      })

      this.#orbits.push(orbit)

      const numOrbitObjects = random.between(3, 4)
      for (
        let orbitObjectIndex = 0;
        orbitObjectIndex < numOrbitObjects;
        orbitObjectIndex++
      ) {
        const trueAnomaly = random.angle()
        const type = random.pickOneWeighted(['body', 'zone'], [5, 5])
        const content = this.#createOrbitObject(random, orbit, type)
        if (content instanceof Body && depth < maxDepth) {
          this.#createBodyOrbits(random, content, maxDepth, depth + 1)
          if (content.radius > 0.5) {
            // DUDA: Ring es un body?
            const orbitContent = new OrbitContent({
              type: 'ring',
              orbit: orbit,
              content: new Ring({
                seed: random.seed,
                innerRadius: random.between(content.radius + 0.1, content.radius + 0.2),
                outerRadius: random.between(content.radius + 0.4, content.radius + 0.5),
              }),
              trueAnomaly: trueAnomaly,
            })
            // orbit.orbitObjects.push(orbitContent)
            this.#bodies.push(orbitContent)
          }
        }
        const orbitContent = new OrbitContent({
          type: type,
          orbit: orbit,
          content: content,
          trueAnomaly: trueAnomaly,
        })
        // orbit.orbitObjects.push(orbitContent)        )
        this.#bodies.push(orbit)
      }
      body.orbits.push(orbit)
    }
    return body
  }

  /**
   * Constructor
   *
   * @param {number} seed Semilla utilizada para generar la estrella.
   * @returns {Body} Estrella generada con todas sus órbitas
   */
  constructor(seed) {
    const random = new Random(new RandomProvider(seed))
    const star = new Body({
      seed,
      radius: random.between(0.5, 1.5)
    })
    this.#createBodyOrbits(random, star)
  }

  /**
   * @type {Array<Orbit>}
   */
  get orbits() {
    return this.#orbits
  }

  /**
   * @type {Array<Body>}
   */
  get bodies() {
    return this.#bodies
  }
}
