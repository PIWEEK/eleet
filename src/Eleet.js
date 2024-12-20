import { Game } from '@taoro/game'
import { Audio3D } from '@taoro/audio-3d'
import { Random } from '@taoro/math-random'
import { RandomProvider } from '@taoro/math-random-wasm'
import { Renderer } from './engine/renderer/Renderer'
import { TransformComponent } from './engine/components/TransformComponent'
import { Simulation } from './engine/simulation/Simulation'
export class Eleet extends Game {
  #renderer = null
  #collider = null
  #simulation = null
  #spatialAudio = null
  #random = null

  /**
   *
   * @param {HTMLCanvasElement} canvas
   * @param {*} options
   */
  constructor(canvas, options) {
    super(canvas, options)
    this.#renderer = new Renderer(canvas, this.resources)
    this.#simulation = new Simulation(this)
    this.#spatialAudio = new Audio3D(this.audio, {
      transform: TransformComponent
    })
    this.#random = new Random(new RandomProvider())
    game.pipeline.after('input', 'simulation', () => this.#simulation.update())
    game.pipeline.after('scheduler', 'renderer', () => this.#renderer.update())
  }

  /**
   * @type {Renderer}
   */
  get renderer() {
    return this.#renderer
  }

  /**
   * @type {Collider}
   */
  get collider() {
    return this.#collider
  }

  /**
   * @type {Simulation}
   */
  get simulation() {
    return this.#simulation
  }

  /**
   * @type {Audio3D}
   */
  get spatialAudio() {
    return this.#spatialAudio
  }

  /**
   * @type {Random}
   */
  get random() {
    return this.#random
  }
}

export default Eleet
