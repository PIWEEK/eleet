import { AIGenerator } from '../../engine/AIGenerator'

function wordWrap(text, maxWidth = 50) {
  const lines = []
  let line = ''
  let offset = 0
  while (offset < text.length) {
    const prevOffset = offset
    const nextOffset = text.indexOf(' ', offset)
    if (nextOffset === -1) {
      line += text.slice(prevOffset)
      break
    }
    offset = nextOffset + 1
    line += text.slice(prevOffset, nextOffset) + ' '
    if (line.length >= maxWidth) {
      lines.push(line)
      line = ''
    }
  }
  lines.push(line)
  return lines.join('\n')
}

export class Zone {
  /**
   * Semilla de la zona.
   *
   * @type {number}
   */
  #seed = 0

  /**
   * @type (string)
   */
  #description = ''

  #isRequested = false

  /**
   * Constructor
   *
   * @param {number} seed
   */
  constructor(seed) {
    this.#seed = seed
  }

  get description() {
    if (!this.#isRequested) {
      this.#isRequested = true
      AIGenerator.generatePlanetDescription(
        'Aethereia',
        'con muchos oceanos y grandes zonas de tierra',
        'caluroso y fuertes vientos',
        'agrícola').then(
          (description) => {
            this.#description = wordWrap(description)
          }
        )
    }
    return this.#description
  }
}
