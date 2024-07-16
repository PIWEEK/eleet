import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-lcg'

export class StarfieldGeometry {
  #vertices = null

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

  get vertices() {
    return this.#vertices
  }
}
