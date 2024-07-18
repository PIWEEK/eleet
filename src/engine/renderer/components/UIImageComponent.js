import Component from '@taoro/component'

export const UIImageAnchor = {
  LEFT_TOP: 0,
  RIGHT_TOP: 1,
  LEFT_BOTTOM: 2,
  RIGHT_BOTTOM: 3,
  TOP: 4,
  BOTTOM: 5,
  LEFT: 6,
  RIGHT: 7,
  CENTER: 8,
}

export class UIImageComponent extends Component {
  #image = null

  constructor(id, options) {
    super(id)
    this.#image = options?.image ?? null
    this.anchor = options?.anchor ?? UIImageAnchor.CENTER
    this.dx = options?.dx ?? 0
    this.dy = options?.dy ?? 0
  }

  get image() {
    return this.#image
  }
}
