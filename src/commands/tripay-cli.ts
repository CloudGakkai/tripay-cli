import { GluegunCommand } from 'gluegun'
import help from './help'

const command: GluegunCommand = {
  description: '💳 Tripay CLI',
  run: async (toolbox) => {
    const {
      parameters: { first },
      print: { error },
    } = toolbox

    if (first !== undefined) {
      error(`tripay ${first} is not a command`)
    } else {
      return help.run(toolbox)
    }
  },
}

module.exports = command
