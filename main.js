import './style.css'
import { Game } from '@taoro/game'
import { InputDevice, InputKind } from '@taoro/input'
import { CustomRenderer } from './src/engine/CustomRenderer'
import { Player } from './src/game/entities/Player'
import { StarSystem } from './src/game/entities/StarSystem'
import { StellarForge } from './src/game/models/StellarForge'

class ConfigParams {
  #url = null

  constructor(location) {
    this.#url = new URL(location)
  }

  get seed() {
    const seed = this.#url.searchParams.get('seed')
    if (seed) {
      return parseInt(seed)
    }
    return 0
  }

  get date() {
    const date = this.#url.searchParams.get('date')
    if (date) {
      return Date.parse(date)
    }
    const currentDate = new Date()
    return new Date(
      currentDate.getFullYear() + 100,
      currentDate.getMonth(),
      currentDate.getDate()
    )
  }
}

async function start() {

  const params = new ConfigParams(location)
  const star = StellarForge.create(params.seed)

  const canvas = document.querySelector('canvas')
  const game = new Game(canvas)
  const customRenderer = new CustomRenderer(canvas)
  game.pipeline.push(() => customRenderer.update())
  game.input.setBindings(0, (state) => {
    if (state.index === 0) {
      return [
        [
          'pitch-up',
          [
            [InputDevice.KEYBOARD, ['KeyW']],
            [InputDevice.KEYBOARD, ['ArrowUp']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 1, -1]],
          ],
        ],
        [
          'pitch-down',
          [
            [InputDevice.KEYBOARD, ['KeyS']],
            [InputDevice.KEYBOARD, ['ArrowDown']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 1, 1]],
          ],
        ],
        [
          'roll-left',
          [
            [InputDevice.KEYBOARD, ['ArrowLeft']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 3, -1]],
          ],
        ],
        [
          'roll-right',
          [
            [InputDevice.KEYBOARD, ['ArrowRight']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 3, 1]],
          ],
        ],
        [
          'throttle-up',
          [
            [InputDevice.KEYBOARD, ['KeyA']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 0, -1]],
          ],
        ],
        [
          'throttle-down',
          [
            [InputDevice.KEYBOARD, ['KeyD']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 0, 1]],
          ],
        ],
        [
          'fire',
          [
            [InputDevice.KEYBOARD, ['Space']],
            [InputDevice.GAMEPAD, [0, InputKind.BUTTON, 0]],
          ],
        ],
      ]
    }
  })

  game.scheduler.add(StarSystem(game, star))
  game.scheduler.add(Player(game))
  game.start()

  console.log('Hello, World!')

}

/**
 * Esto podría hacer muchas más cosas: por ejemplo, cargar
 * el script del juego y luego llamar a start() cuando esté
 * listo.
 *
 * También se podría utilizar esto como una oportunidad para
 * darle opciones al jugador de qué es lo que debería ocurrir
 * al arrancar el juego: con/sin sonido, con/sin música, etc.
 */
const userGesture = document.querySelector('#user-gesture')
userGesture.onclick = () => {
  // userGesture.remove()
  userGesture.style.display = 'none'
  start()
}
