import { SimulationScale } from '../SimulationScale'
import { BodyComponent } from './BodyComponent'
import { vec3 } from 'gl-matrix'
import { BodyType } from '../../BodyType'

export class ShipComponent extends BodyComponent {
  /**
   * Scale where this ship is moving.
   *
   * @type {SimulationScale}
   */
  scale = SimulationScale.STELLAR

  /**
   * @type {boolean}
   */
  canEnter = false

  /**
   * @type {boolean}
   */
  canExit = false

  /**
   * @type {boolean}
   */
  autoPilot = false

  /**
   * @type {number}
   */
  autoPilotStart = 0

  fsd = false

  pitch = 0
  yaw = 0
  roll = 0

  exitVector = vec3.create()
  enterVector = vec3.create()

  /**
   * Constructor
   *
   * @param {string} id
   */
  constructor(
    id,
    options = {
      linearAcceleration: vec3.fromValues(0.0001, 0.0001, 0.0001),
      angularAcceleration: vec3.fromValues(0.0001, 0.0001, 0.0001),
    }
  ) {
    super(id, BodyType.SHIP, options)
  }
}
