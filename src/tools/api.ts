import { http } from 'gluegun'

export const api = http.create({
  baseURL: 'https://tripay.co.id/api/',
  validateStatus: function (status) {
    return status < 999
  },
})

export const sandboxApi = http.create({
  baseURL: 'https://tripay.co.id/api-sandbox/',
  validateStatus: function (status) {
    return status < 999
  },
})
