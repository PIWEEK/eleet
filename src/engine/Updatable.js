export class Updatable {
  #needsUpdate = false

  constructor(needsUpdate = true) {
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
