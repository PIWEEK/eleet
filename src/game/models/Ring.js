export class Ring {
  /**
   * Semilla del anillo.
   *
   * @type {number}
   */
  #seed = 0

  /**
   * Radio interior del anillo.
   *
   * @type {number}
   */
  #innerRadius = 0

  /**
   * Radio exterior del anillo.
   *
   * @type {number}
   */
  #outerRadius = 0

  /**
   * Constructor.
   *
   * @param {number} seed Semilla que se utilizará para calcular el resto de cosas.
   * @param {Orbit|null} orbit Órbita a la que pertenece el cuerpo.
   */
  constructor(options) {
    if (options?.innerRadius && !Number.isFinite(options.innerRadius)) {
      throw new TypeError('Whatever')
    }

    if (options?.outerRadius && !Number.isFinite(options.outerRadius)) {
      throw new TypeError('Whatever')
    }

    this.#seed = options?.seed
    this.#innerRadius = options?.innerRadius
    this.#outerRadius = options?.outerRadius
  }

  get innerRadius() {
    return this.#innerRadius
  }

  get outerRadius() {
    return this.#outerRadius
  }

  /**
   * @type {number}
   */
  get seed() {
    return this.#seed
  }
}

export default Ring
