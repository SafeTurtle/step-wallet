import { Linking } from 'expo'
import * as WebBrowser from 'expo-web-browser';
import firebase from './plugins/firebase'
const auth = firebase.auth()

const captchaUrl = `https://my-contract-wallet-development.firebaseapp.com/index.html?appurl=${Linking.makeUrl('')}`

const onPhoneComplete = async (_phone) => {
  let token = null
  const listener = ({url}) => {
    WebBrowser.dismissBrowser()
    const tokenEncoded = Linking.parse(url).queryParams['token']
    if (tokenEncoded){
      token = decodeURIComponent(tokenEncoded)
    }
  }
  Linking.addEventListener('url', listener)
  await WebBrowser.openBrowserAsync(captchaUrl)
  Linking.removeEventListener('url', listener)
  if (token) {
    const captchaVerifier = {
      type: 'recaptcha',
      verify: () => Promise.resolve(token)
    }
    try {
      const confirmationResult = await auth.signInWithPhoneNumber(_phone, captchaVerifier)
      return confirmationResult
    } catch (error) {
      console.warn(error)
    }
  }
}

const onSignIn = async (_confirmationResult, _code) => {
  try {
    const prevUser = await firebase.auth().currentUser
    if (!prevUser) return
    await confirmationResult.confirm(_code)
    const credential = firebase.auth.PhoneAuthProvider.credential(_confirmationResult.verificationId, _code)
    await auth.signInWithCredential(credential)
    await firebase.auth().currentUser.delete()
    await prevUser.linkWithCredential(credential)
    await auth.signInWithCredential(credential)
    return true
  } catch (error) {
    console.warn(error)
  }
}

