import { AIGenerator } from '../../engine/AIGenerator'

export class Zone {
  /**
   * Semilla de la zona.
   *
   * @type {number}
   */
  #seed = 0

  /**
   * @type (string)
   */
  #description = undefined

  /**
   * Constructor
   *
   * @param {number} seed
   */
  constructor(seed) {
    this.#seed = seed
  }

  get description() {
    if (this.#description === undefined) {
      this.#description = "(...)"
      AIGenerator.generatePlanetDescription(
        "Aethereia",
        "con muchos oceanos y grandes zonas de tierra",
        "caluroso y fuertes vientos",
        "agrícola").then(
          (description) => {
            this.#description = description
          }
        )
    }
    return this.#description
  }
}
