export class Body {
  /**
   * Semilla del cuerpo.
   *
   * @type {number}
   */
  #seed = 0

  /**
   * Tamaño del cuerpo.
   *
   * @type {number}
   */
  #radius = 0

  /**
   * Indica la órbita a la que está sujeto este cuerpo.
   *
   * Si es null quiere decir que no pertenece a ninguna órbita.
   *
   * @type {OrbitContent|null}
   */
  #orbitContent = null

  /**
   * Sub-órbitas que tiene este cuerpo.
   *
   * @type {Array<Orbit>}
   */
  #orbits = new Array()

  /**
   * Constructor.
   *
   * @param {number} seed Semilla que se utilizará para calcular el resto de cosas.
   * @param {Orbit|null} orbit Órbita a la que pertenece el cuerpo.
   */
  constructor(options) {
    this.#seed = options?.seed
    this.#orbitContent = options?.orbit
    this.#radius = options?.radius
  }

  /**
   * @type {number}
   */
  get radius() {
    return this.#radius
  }

  /**
   * @type {number}
   */
  get seed() {
    return this.#seed
  }

  /**
   * @type {OrbitContent|null}
   */
  get orbitContent() {
    return this.#orbitContent
  }

  /**
   * @type {Array<Orbit>}
   */
  get orbits() {
    return this.#orbits
  }
}

export default Body
