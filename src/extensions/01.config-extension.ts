// Types
import type { GluegunToolbox } from 'gluegun'
import type { TripayConfig } from '../types'

export default (toolbox: GluegunToolbox) => {
  const { filesystem } = toolbox

  const TRIPAY_CONFIG = `${filesystem.homedir()}/.tripay`

  toolbox.saveConfig = async (config: TripayConfig, sandbox?: boolean) => {
    await filesystem.writeAsync(
      `${TRIPAY_CONFIG}/${sandbox ? 'sandbox' : 'prod'}`,
      JSON.stringify(config, null, 2)
    )
  }

  toolbox.loadConfig = async (
    sandbox?: boolean
  ): Promise<TripayConfig | false> => {
    if (
      !filesystem.exists(`${TRIPAY_CONFIG}/${sandbox ? 'sandbox' : 'prod'}`)
    ) {
      return false
    }

    const loadFile = await filesystem.readAsync(
      `${TRIPAY_CONFIG}/${sandbox ? 'sandbox' : 'prod'}`,
      'json'
    )

    return loadFile
  }
}
