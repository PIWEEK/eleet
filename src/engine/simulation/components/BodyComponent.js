import Component from '@taoro/component'
import { vec3 } from 'gl-matrix'

export class BodyComponent extends Component {
  velocity = vec3.create()
  angularVelocity = vec3.create()
  angularAcceleration = vec3.fromValues(
    0.0001,
    0.0001,
    0.0001,
  )
  linearAcceleration = vec3.fromValues(
    0.0001,
    0.0001,
    0.0001
  )
  linearVelocity = vec3.fromValues(
    0,
    0,
    0,
  )
}
