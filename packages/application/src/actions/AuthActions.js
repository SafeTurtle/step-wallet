import {
  STORE_D_TOKEN,
  STORE_NOTIFICATION_DATA
} from './types'

export const storeDToken = (token) => {
  return {
    type: STORE_D_TOKEN,
    payload: token
  }
}
export const storeNotificationData = (data) => {
  return {
    type: STORE_NOTIFICATION_DATA,
    payload: data
  }
}