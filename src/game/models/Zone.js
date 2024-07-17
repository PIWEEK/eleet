export class Zone {
  /**
   * Semilla de la zona.
   *
   * @type {number}
   */
  #seed = 0

  /**
   * Constructor
   *
   * @param {number} seed
   */
  constructor(seed) {
    this.#seed = seed
  }
}
