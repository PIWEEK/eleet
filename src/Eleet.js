import { Game } from '@taoro/game'
import { Audio3D } from '@taoro/audio-3d'
import { Renderer } from './engine/renderer/Renderer'
import { Collider } from './engine/collider/Collider'
import { Simulation } from './engine/simulation/Simulation'
import { TransformComponent } from './engine/components/TransformComponent'

export class Eleet extends Game {
  #renderer = null
  #collider = null
  #simulation = null
  #spatialAudio = null

  /**
   *
   * @param {HTMLCanvasElement} canvas
   * @param {*} options
   */
  constructor(canvas, options) {
    super(canvas, options)
    this.#renderer = new Renderer(canvas, this.resources)
    this.#collider = new Collider()
    this.#simulation = new Simulation()
    this.#spatialAudio = new Audio3D(this.audio, {
      transform: TransformComponent
    })
    game.pipeline.after('input', 'simulation', () => this.#simulation.update())
    game.pipeline.after('simulation', 'collider', () => this.#collider.update())
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

  get spatialAudio() {
    return this.#spatialAudio
  }
}

export default Eleet
