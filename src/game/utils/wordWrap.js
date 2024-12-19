export function wordWrap(text, maxWidth = 50) {
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
