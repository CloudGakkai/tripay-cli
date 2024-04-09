import { p, heading } from '../tools/pretty'
import { map, pipe, values } from 'ramda'
import { GENERATORS } from '../constants/generator'

// Types
import type { GluegunToolbox } from 'gluegun'

const generateCommandNotAvailable = async (toolbox: GluegunToolbox) => {
  const {
    print: {
      info,
      table,
      colors: { bold, yellow },
    },
  } = toolbox
  info(
    `✨ Type ${bold('tripay generate')} ${yellow(
      '________'
    )} to run one of these generators:\n`
  )

  const data = pipe(
    values,
    map((item) => [yellow(item.name), item.description])
  )(GENERATORS)

  table(data)
}

export default {
  description: 'Generate new signature or payment request',
  alias: ['g'],
  run: async (toolbox: GluegunToolbox) => {
    const { print, parameters } = toolbox
    const { warning } = print

    if (parameters.first) {
      const generator = parameters.first.toLowerCase()

      // Check if generate command is available
      const commandAvailable = GENERATORS.find(
        (command) => command.name === generator
      )
      if (!commandAvailable) {
        return await generateCommandNotAvailable(toolbox)
      }

      // Run generator based on command
      switch (parameters.first) {
        case 'signature':
          return await toolbox.generateSignature()

        case 'payment':
          return await toolbox.generatePaymentRequest()

        default:
          return await generateCommandNotAvailable(toolbox)
      }
    } else {
      warning('⚠️  No generators detected.')
      p()
      heading(
        'Generator allow you to quickly make signature or payment request:'
      )
      p('* signature')
      p('* payment')
    }
  },
}
