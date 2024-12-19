import { BodyComponent } from './BodyComponent';

export class OrbitBodyComponent extends BodyComponent {
  /**
   * @type {number}
   */
  #seed = 0

  /**
   * @type {string}
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

  constructor(id, type, options) {
    super(id, type, options)
    this.#orbit = options.orbit
    this.#seed = options.seed ?? 0
    this.#trueAnomaly = options?.trueAnomaly ?? 0
  }

  get seed() {
    return this.#seed
  }

  get orbit() {
    return this.#orbit
  }

  get trueAnomaly() {
    return this.#trueAnomaly
  }
}
