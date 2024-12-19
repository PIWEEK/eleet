import { OrbitBodyComponent } from './OrbitBodyComponent'
import { BodyType } from '../../BodyType'

export class ZoneComponent extends OrbitBodyComponent {
  constructor(id, options) {
    super(id, BodyType.ZONE, options)
  }
}
