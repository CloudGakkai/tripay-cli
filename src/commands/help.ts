import { p, command, heading, tripayHeading } from '../tools/pretty'

// Types
import type { GluegunToolbox } from 'gluegun'

export default {
  dashed: true,
  alias: ['h'],
  description: 'Displays Tripay CLI help',
  run: async (toolbox: GluegunToolbox) => {
    const { meta } = toolbox

    p()

    tripayHeading()
    heading(`Welcome to Unofficial Tripay CLI ${meta.version()}`)
    p()
    p("Tripay CLI is a command line interface for Tripay's API")
    p()
    heading('Commands')
    command('config          ', 'Config Tripay API', ['tripay config'])
    p()
    command('generate (g)    ', 'Generate signature or payment request', [
      'tripay generate signature',
      'tripay generate payment',
    ])
    p()
    heading('Options')
    command('-s, --sandbox   ', 'Use sandbox environment', [
      'tripay g signature --sandbox',
      'tripay g payment --sandbox',
    ])
    p()
    tripayHeading()
  },
}
