export class Updatable {
  #needsUpdate = false

  constructor(needsUpdate = true) {
    if (typeof needsUpdate !== 'boolean') {
      throw new TypeError('Invalid initial value')
    }
    this.#needsUpdate = needsUpdate
  }

  shouldUpdate() {
    this.#needsUpdate = true
    return this
  }

  updated() {
    this.#needsUpdate = false
    return this
  }

  get needsUpdate() {
    return this.#needsUpdate
  }
}

export default Updatable
