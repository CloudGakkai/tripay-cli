import {
  p,
  tripayHeading,
  direction,
  startSpinner,
  stopSpinner,
  clearSpinners,
} from '../tools/pretty'

// Types
import type { GluegunToolbox } from 'gluegun'

export default {
  run: async (toolbox: GluegunToolbox) => {
    const { print, prompt, saveConfig } = toolbox

    // Form
    const configForm = [
      {
        type: 'input',
        name: 'merchant_code',
        message: 'Enter your merchant code',
      },
      {
        type: 'input',
        name: 'api_key',
        message: 'Enter your api key',
      },
      {
        type: 'password',
        name: 'private_key',
        message: 'Enter your private key',
      },
      {
        type: 'select',
        name: 'environment',
        message: 'Select environment',
        choices: ['Production', 'Sandbox'],
      },
    ]

    p('\n')
    tripayHeading()
    const { merchant_code, api_key, private_key, environment } =
      await prompt.ask(configForm)

    if (merchant_code === '') {
      print.error('█ Canceling...')
      print.error('Reason: Merchant Code cannot be empty.')
      return false
    }
    if (api_key === '') {
      print.error('█ Canceling...')
      print.error('Reason: API Key cannot be empty.')
      return false
    }
    if (private_key === '') {
      print.error('█ Canceling...')
      print.error('Reason: Private Key cannot be empty.')
      return false
    }

    startSpinner(' Saving configuration...')

    try {
      await saveConfig(
        {
          merchant_code,
          api_key,
          private_key,
        },
        environment === 'Sandbox'
      )

      stopSpinner(' Saving configuration...', '✅')
      p()
      direction(' 🚀  Ready to Use:')
      direction(' - Run tripay generate signature')
      p()
      tripayHeading()
      clearSpinners()
      process.exit(0)
    } catch (e) {
      clearSpinners()
      print.error('█ Canceling...')
      print.error(`Reason: ${e?.message}`)
      process.exit(0)
    }
  },
}
