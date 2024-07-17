import WebGL from '@taoro/webgl'

export class MeshGeometry {
  #vertices = null
  #triangles = null
  #edges = null

  #vertexBuffer = null
  #triangleBuffer = null
  #edgeBuffer = null

  #triangleVertexArrayObject = null
  #edgeVertexArrayObject = null

  constructor(options) {
    this.#vertices = new Float32Array(options.vertices)
    this.#triangles = new Uint16Array(options.triangles)
    this.#edges = new Uint16Array(options.edges)
  }

  get vertices() {
    return this.#vertices
  }

  get triangles() {
    return this.#triangles
  }

  get edges() {
    return this.#edges
  }

  get hasVertexArrayObject() {
    return !!this.#triangleVertexArrayObject || !!this.#edgeVertexArrayObject
  }

  createVertexArrayObject(gl) {
    this.#vertexBuffer = WebGL.buffer.createArrayBufferFrom(gl, this.#vertices)
    this.#triangleBuffer = WebGL.buffer.createElementArrayBufferFrom(
      gl,
      this.#triangles
    )
    this.#edgeBuffer = WebGL.buffer.createElementArrayBufferFrom(
      gl,
      this.#edges
    )
    this.#triangleVertexArrayObject = WebGL.vao.createVertexArray(gl, {
      attributes: [
        { index: 0, size: 3, type: gl.FLOAT, buffer: this.#vertexBuffer },
      ],
      indexBuffer: this.#triangleBuffer,
    })
    this.#edgeVertexArrayObject = WebGL.vao.createVertexArray(gl, {
      attributes: [
        { index: 0, size: 3, type: gl.FLOAT, buffer: this.#vertexBuffer },
      ],
      indexBuffer: this.#edgeBuffer,
    })
  }

  get triangleVertexArrayObject() {
    return this.#triangleVertexArrayObject
  }

  get edgeVertexArrayObject() {
    return this.#edgeVertexArrayObject
  }
}

export default MeshGeometry
