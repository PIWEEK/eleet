import defaultProgram from './default'
import orbitProgram from './ellipse'
import ringProgram from './ring'
import dustProgram from './dust'
import meshProgram from './mesh'
import imposterProgram from './imposter'
import uiProgram from './ui'

export const shaders = {
  default: defaultProgram,
  orbit: orbitProgram,
  ring: ringProgram,
  dust: dustProgram,
  mesh: meshProgram,
  imposter: imposterProgram,
  ui: uiProgram,
}

export default shaders
