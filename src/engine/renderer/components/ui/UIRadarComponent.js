import { UIComponent } from './UIComponent'

export const UIRadarView = {
  FRONT: 0,
  REAR: 1,
  ELITE: 2
}

export class UIRadarComponent extends UIComponent {
  #view = UIRadarView.ELITE

  constructor(id, options) {
    super(id, options)
    this.#view = options?.view
  }

  get view() {
    return this.#view
  }
}
