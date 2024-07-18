import { Component } from '@taoro/component'

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