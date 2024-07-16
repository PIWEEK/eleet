export class OrbitBody {
  /**
   * @type {Body}
   */
  #body = null

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
    this.#body = options?.body
    this.#trueAnomaly = options?.trueAnomaly
  }

  get body() {
    return this.#body
  }

  get orbit() {
    return this.#orbit
  }

  get trueAnomaly() {
    return this.#trueAnomaly
  }
}

export default OrbitBody
