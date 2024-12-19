import { OrbitBodyComponent } from './OrbitBodyComponent'
import { BodyType } from '../../BodyType'

export class PlanetComponent extends OrbitBodyComponent {
  radius = 0.1 // [0.1 ... 0.6]

  constructor(id, options = {}) {
    super(id, BodyType.PLANET, options)
    this.radius = options.radius
  }
}

export default PlanetComponent
