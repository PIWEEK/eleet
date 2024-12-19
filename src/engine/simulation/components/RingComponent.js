import { BodyType } from '../../BodyType'
import { BodyComponent } from './BodyComponent'

export class RingComponent extends BodyComponent {
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

  constructor(id, options = {}) {
    super(id, BodyType.RING, options)
  }

  get seed() {
    return this.#seed
  }

  get innerRadius() {
    return this.#innerRadius
  }

  get outerRadius() {
    return this.#outerRadius
  }
}
