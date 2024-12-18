export const BodyType = {
  STAR: 0,
  PLANET: 1,
  TEXTURED_PLANET: 2
}

export class Body {
  /**
   * Semilla del cuerpo.
   *
   * @type {number}
   */
  #seed = 0

  /**
   * Tipo de cuerpo.
   *
   * @type {}
   */
  #type = BodyType.STAR

  #subtype = 'textures/bodies/2k_ceres_fictional.jpg'

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
    this.#type = options?.type ?? BodyType.STAR
    this.#seed = options?.seed
    this.#orbitContent = options?.orbit
    this.#radius = options?.radius
  }

  get type() {
    return this.#type
  }

  get subtype() {
    return this.#subtype
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
