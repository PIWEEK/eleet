import { Component } from '@taoro/component'

export class MeshComponent extends Component {
  #geometry = null
  #indexBuffer = null
  #vertexBuffer = null
  #edgeBuffer = null

  constructor(id, geometry) {
    super(id)
    this.#geometry = geometry
  }

  get geometry() {
    return this.#geometry
  }

  get indexBuffer() {
    return this.#indexBuffer
  }

  get vertexBuffer() {
    return this.#vertexBuffer
  }

  get edgeBuffer() {
    return this.#edgeBuffer
  }

}
