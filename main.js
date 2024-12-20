import './style.css'
import { InputDevice, InputKind } from '@taoro/input'
import { RandomProvider } from '@taoro/math-random-wasm'
// import { Audio3D } from '@taoro/audio-3d'
import { Eleet } from './src/Eleet'
import { Player } from './src/game/entities/Player'
import { Star } from './src/game/entities/Star'

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
  await RandomProvider.load('wasm/random.wasm')

  const canvas = document.querySelector('canvas')
  const game = new Eleet(canvas)

  await game.resources.load('audio/music/background.wav?taoro:as=audiobuffer')

  await game.resources.load('images/cross.png')
  await game.resources.load('images/engine.png')
  await game.resources.load('images/front.png')
  await game.resources.load('images/rear.png')
  await game.resources.load('images/weapons.png')
  await game.resources.load('images/ship-info.png')

  await game.resources.load('textures/bodies/2k_ceres_fictional.jpg')
  await game.resources.load('textures/bodies/2k_earth_daymap.jpg')
  await game.resources.load('textures/bodies/2k_eris_fictional.jpg')
  await game.resources.load('textures/bodies/2k_haumea_fictional.jpg')
  await game.resources.load('textures/bodies/2k_jupiter.jpg')
  await game.resources.load('textures/bodies/2k_makemake_fictional.jpg')
  await game.resources.load('textures/bodies/2k_mars.jpg')
  await game.resources.load('textures/bodies/2k_mercury.jpg')
  await game.resources.load('textures/bodies/2k_moon.jpg')
  await game.resources.load('textures/bodies/2k_neptune.jpg')
  await game.resources.load('textures/bodies/2k_saturn.jpg')
  await game.resources.load('textures/bodies/2k_uranus.jpg')
  await game.resources.load('textures/bodies/2k_venus_atmosphere.jpg')
  await game.resources.load('textures/bodies/2k_venus_surface.jpg')

  await game.resources.load('models/asteroide-peque.blend.json')
  await game.resources.load('models/asteroide-mediano.blend.json')
  await game.resources.load('models/asteroide-grande.blend.json')
  await game.resources.load('models/station-big.blend.json')
  await game.resources.load('models/estacion-pirata.blend.json')
  await game.resources.load('models/basic-ship.blend.json')
  await game.resources.load('models/nave-basica.blend.json')
  await game.resources.load('models/nave-comercio.blend.json')
  await game.resources.load('models/nave-mercenaria.blend.json')

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
          'yaw-left',
          [
            [InputDevice.KEYBOARD, ['KeyQ']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 2, -1]],
          ],
        ],
        [
          'yaw-right',
          [
            [InputDevice.KEYBOARD, ['KeyE']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 2, 1]],
          ],
        ],
        [
          'roll-left',
          [
            [InputDevice.KEYBOARD, ['ArrowLeft']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 0, -1]],
          ],
        ],
        [
          'roll-right',
          [
            [InputDevice.KEYBOARD, ['ArrowRight']],
            [InputDevice.GAMEPAD, [0, InputKind.AXIS, 0, 1]],
          ],
        ],
        [
          'throttle-up',
          [
            [InputDevice.KEYBOARD, ['KeyA']],
            [InputDevice.GAMEPAD, [0, InputKind.BUTTON, 4]],
          ],
        ],
        [
          'throttle-down',
          [
            [InputDevice.KEYBOARD, ['KeyD']],
            [InputDevice.GAMEPAD, [0, InputKind.BUTTON, 5]],
          ],
        ],
        [
          'target',
          [
            [InputDevice.KEYBOARD, ['KeyT']],
            [InputDevice.GAMEPAD, [0, InputKind.BUTTON, 0]],
          ],
        ],
        [
          'primary-fire',
          [
            [InputDevice.KEYBOARD, ['KeyZ']],
            [InputDevice.GAMEPAD, [0, InputKind.BUTTON, 7]],
          ],
        ],
        [
          'secondary-fire',
          [
            [InputDevice.KEYBOARD, ['KeyX']],
            [InputDevice.GAMEPAD, [0, InputKind.BUTTON, 6]],
          ],
        ],
        [
          'fsd',
          [
            [InputDevice.KEYBOARD, ['KeyF']],
            [InputDevice.GAMEPAD, [0, InputKind.BUTTON, 1]],
          ],
        ],
      ]
    }
  })

  game.scheduler.add(Star(game, params))
  game.scheduler.add(Player(game))
  game.start()
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
