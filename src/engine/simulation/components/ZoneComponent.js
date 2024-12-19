import { BodyComponent } from './BodyComponent'
import { BodyType } from '../../BodyType'

export class ZoneComponent extends BodyComponent {
  constructor(id, options) {
    super(id, BodyType.ZONE, options)
  }
}
