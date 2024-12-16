import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-wasm'
import WebGL from '@taoro/webgl'

/**
 * @typedef {Object} StarfieldGeometryOptions
 * @property {number} [seed=0]
 * @property {number} [size=1000]
 */

/**
 * FIXME: Esto también podría renderizarlo utilizando
 * sólo shaders.
 */
export class StarfieldGeometry {
  #vertices = null
  #buffer = null
  #vao = null

  /**
   * Constructor
   *
   * @param {StarfieldGeometryOptions} options
   */
  constructor(options) {
    const seed = options?.seed || 0
    const size = options?.size || 1000
    const random = new Random(new RandomProvider(seed))
    const vertices = new Array()
    for (let i = 0; i < size; i++) {
      const x = (random.value() - 0.5) * 1000
      const y = (random.value() - 0.5) * 1000
      const z = (random.value() - 0.5) * 1000
      const l = Math.hypot(x, y, z)
      const w = 1 + random.value() * 3
      vertices.push(1000 * x / l, 1000 * y / l, 1000 * z / l, w)
    }
    this.#vertices = new Float32Array(vertices)
  }

  get hasVertexArrayObject() {
    return !!this.#vao
  }

  createVertexArrayObject(gl) {
    this.#buffer = WebGL.buffer.createArrayBufferFrom(
      gl,
      this.#vertices
    )

    this.#vao = WebGL.vao.createVertexArray(gl, {
      attributes: [
        { index: 0, size: 4, type: gl.FLOAT, buffer: this.#buffer },
      ],
    })
  }

  get vertices() {
    return this.#vertices
  }

  get buffer() {
    return this.#buffer
  }

  get vao() {
    return this.#vao
  }
}
