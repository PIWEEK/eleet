import { BodyType } from '../../BodyType'
import { BodyComponent } from './BodyComponent'

export class StarComponent extends BodyComponent {
  #seed = 0

  #radius = 1 // [1 ... 2]

  constructor(id, options = {}) {
    super(id, BodyType.STAR, options)
    this.#seed = options?.seed
    this.#radius = options?.radius
  }

  get seed() {
    return this.#seed
  }

  get radius() {
    return this.#radius
  }
}
