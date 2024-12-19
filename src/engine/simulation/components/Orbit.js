/**
 * @typedef {Object} OrbitOptions
 * @property {number} semiMajorAxis
 * @property {number} eccentricity
 * @property {number} inclination
 */

/**
 * Órbita
 */
export class Orbit {
  /**
   * Cuerpo que genera esta órbita. Necesitamos
   * saber qué cuerpo es para poder tener en cuenta
   * la rotación y la posición del cuerpo a la
   * hora de transformar esta órbita.
   *
   * @type {Body}
   */
  #body = null

  /**
   * Semi eje mayor.
   *
   * @type {number}
   */
  #semiMajorAxis = 0

  /**
   * Semi eje menor
   *
   * @type {number}
   */
  #semiMinorAxis = 0

  /**
   * Excentricidad de la órbita, este valor debe estar
   * entre 0 (circular) y 1 (elíptica). Como referencia
   * la órbita de la Tierra tiene una excentricidad
   * de 0.017
   *
   * @type {number}
   */
  #eccentricity = 0.01

  /**
   * Inclinación sobre el plano de la eclíptica.
   *
   * Medido en radianes.
   *
   * @type {number}
   */
  #inclination = 0

  /**
   * Distancia desde el centro hasta el foco.
   *
   * @type {number}
   */
  #distanceToFoci = 0

  /**
   * Indica en qué foco de la órbita se encuentra
   * el cuerpo de origen.
   *
   * @type {number}
   */
  #bodyFoci = 0

  /**
   * Hijos de esta órbita.
   *
   * @type {Array<Body>}
   */
  #orbitObjects = new Array()

  /**
   * Constructor
   *
   * @param {OrbitOptions} options
   */
  constructor(options) {
    this.#body = options?.body || null
    const eccentricity = this.#eccentricity = options?.eccentricity || 0
    const semiMajorAxis = this.#semiMajorAxis = options?.semiMajorAxis || 1
    const semiMinorAxis = this.#semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity)
    this.#distanceToFoci = Math.sqrt(semiMajorAxis * semiMajorAxis - semiMinorAxis * semiMinorAxis)
  }

  /**
   * Origen de la órbita, normalmente esto será un cuerpo.
   *
   * @type {Body}
   */
  get origin() {
    return this.#body
  }

  /**
   * Semi eje mayor.
   *
   * @type {number}
   */
  get semiMajorAxis() { return this.#semiMajorAxis }

  /**
   * Semi eje menor.
   *
   * @type {number}
   */
  get semiMinorAxis() { return this.#semiMinorAxis }

  /**
   * Excentricidad de la órbita.
   *
   * @type {number}
   */
  get eccentricity() {
    return this.#eccentricity
  }

  /**
   * Distancia hasta el foco.
   *
   * @type {number}
   */
  get distanceToFoci() {
    return this.#distanceToFoci
  }

  /**
   * Foco en el que se encuentra el origen.
   *
   * 0 es el foco de la izquierda y 1 es el foco de
   * la derecha.
   *
   * @type {number}
   */
  get originFoci() {
    return this.#bodyFoci
  }

  /**
   * Cuerpos sujetos a esta órbita.
   *
   * @type {Array<OrbitContent>}
   */
  get orbitObjects() {
    return this.#orbitObjects
  }
}

export default Orbit
