import { api, sandboxApi } from '../tools/api'

// Types
import type { GluegunToolbox } from 'gluegun'
import type { PaymentPayload } from '../types'

export default (toolbox: GluegunToolbox) => {
  const { parameters, loadConfig } = toolbox
  const options = parameters.options
  const isSandbox = options.sandbox || options.s

  toolbox.paymentChannels = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const config = await loadConfig(isSandbox)

        const { ok, data } = isSandbox
          ? await sandboxApi.get('merchant/payment-channel', undefined, {
              headers: {
                Authorization: `Bearer ${config.api_key}`,
              },
            })
          : await api.get('merchant/payment-channel', undefined, {
              headers: {
                Authorization: `Bearer ${config.api_key}`,
              },
            })

        if (!ok) {
          reject(data)
        }

        resolve(data)
      } catch (e) {
        reject(e)
      }
    })
  }

  toolbox.createPayment = async (payload: PaymentPayload) => {
    return new Promise(async (resolve, reject) => {
      try {
        const config = await loadConfig(isSandbox)

        const { ok, data } = isSandbox
          ? await sandboxApi.post('transaction/create', payload, {
              headers: {
                Authorization: `Bearer ${config.api_key}`,
              },
            })
          : await api.post('transaction/create', payload, {
              headers: {
                Authorization: `Bearer ${config.api_key}`,
              },
            })

        if (!ok) {
          reject(data)
        }

        resolve(data)
      } catch (e) {
        reject(e)
      }
    })
  }
}
