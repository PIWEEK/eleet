import { Component } from '@taoro/component'

export class GeometryComponent extends Component {
  #geometry = null
  #buffer = null
  #vao = null

  constructor(id, geometry) {
    super(id)
    this.#geometry = geometry
  }

  get geometry() {
    return this.#geometry
  }

  get buffer() {
    return this.#buffer
  }

  set buffer(buffer) {
    if (!(buffer instanceof WebGLBuffer)) {
      throw new TypeError('Invalid Buffer')
    }
    this.#buffer = buffer
  }

  get vao() {
    return this.#vao
  }

  // FIXME: Creo que esto no debería estar en el componente
  // debería estar en el Renderer en un mapa referenciado
  // por este componente.
  set vao(vao) {
    if (!(vao instanceof WebGLVertexArrayObject)) {
      throw new TypeError('Invalid Vertex Array Object')
    }
    this.#vao = vao
  }
}