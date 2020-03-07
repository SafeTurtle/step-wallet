
import * as LocalAuthentication from 'expo-local-authentication'

scanFingerPrint = async () => {
  try {
    const results = await LocalAuthentication.authenticateAsync()
    if (results.success) {
      return true
    } else {
      return false
    }
  } catch (err) {
    console.log(err)
  }
}

const LocalAuth = {
  ...LocalAuthentication,
  scanFingerPrint
}

export default LocalAuth
