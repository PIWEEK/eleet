import { Component } from '@taoro/component'

export const UITextAnchor = {
  NONE: 0,
  LEFT_TOP: 1,
  RIGHT_TOP: 2,
  LEFT_BOTTOM: 3,
  RIGHT_BOTTOM: 4,
  TOP: 5,
  BOTTOM: 6,
  LEFT: 7,
  RIGHT: 8,
  CENTER: 9,
}

export class UITextComponent extends Component {
  #text = ''
  #x = 0
  #y = 0
  #font = '16px monospace'
  #textAlign = 'left'
  #textBaseline = 'top'
  #fillStyle = 'white'

  constructor(id, options) {
    super(id)
    this.#text = options?.text
    this.#x = options?.x ?? 0
    this.#y = options?.y ?? 0
    this.#font = options?.font ?? '16px monospace'
    this.#textAlign = options?.textAlign ?? 'left'
    this.#textBaseline = options?.textBaseline ?? 'top'
    this.#fillStyle = options?.fillStyle ?? 'white'
    this.lineHeight = 20
    this.anchor = options?.anchor ?? UITextAnchor.NONE
  }

  get text() { return this.#text}
  get x() { return this.#x}
  get y() { return this.#y}
  get font() { return this.#font}
  get textAlign() { return this.#textAlign }
  get textBaseline() { return this.#textBaseline }
  get fillStyle() { return this.#fillStyle }
  set text(newText) {this.#text = newText }
}
