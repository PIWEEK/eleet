import { Body } from './Body'
import { Orbit } from './Orbit'
import { Zone } from './Zone'

export class OrbitContent {
  /**
   * @type {(Body | Zone)}
   */
  #content = null

  /**
   * @type {Orbit}
   */
  #orbit = null

  /**
   * La `true anomaly` representa la posición del cuerpo en el plano de la
   * órbita en un momento concreto. En nuestro caso serviría para marcar
   * el punto inicial del objeto asociado a la órbita.
   *
   * @type {number}
   */
  #trueAnomaly = 0

  /**
   * Constructor
   *
   * @param {OrbitBodyOptions} options
   */
  constructor(options) {
    this.#orbit = options?.orbit
    this.#content = options?.content
    this.#trueAnomaly = options?.trueAnomaly
  }

  get content() {
    return this.#content
  }

  get orbit() {
    return this.#orbit
  }

  get trueAnomaly() {
    return this.#trueAnomaly
  }

  get x() {
    return Math.cos(this.#trueAnomaly) * this.#orbit.semiMajorAxis
  }

  get y() {
    return 0
  }

  get z() {
    return Math.sin(this.#trueAnomaly) * this.#orbit.semiMinorAxis
  }
}

export default OrbitContent
