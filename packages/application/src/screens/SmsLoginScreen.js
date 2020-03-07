import Wallet from '../plugins/wallet'
import * as React from 'react'
import { StyleSheet, Text, View, ScrollView, TextInput } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Icon, Button } from 'react-native-elements'
import { Madoka } from 'react-native-textinput-effects'
import PhoneInput from 'react-native-phone-input'
import LoaderScreen from './LoaderScreen'
import { Linking } from 'expo'
import * as WebBrowser from 'expo-web-browser'

import firebase from './../plugins/firebase'
const auth = firebase.auth()

const captchaUrl = `https://my-contract-wallet-development.firebaseapp.com/index.html?appurl=${Linking.makeUrl('')}`

const delemiterIndex = [6, 10]

import store from './../store'
export default class SmsLoginScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      phone: '',
      countryFunctions: '',
      confirmationResult: undefined,
      code: '',
      appStatus: "SignIn",
      createErrorStatus: false
    }
  }

  componentDidMount(){
    this.onCountryChange()
    console.log(store)
  }

  reset = () => {
    this.setState({
      phone: '',
      phoneCompleted: false,
      confirmationResult: undefined,
      code: ''
    })
  }

  insertDelimiter(text) {
    let textWithoutDelimiter = text.replace(/-/g, '')
    let result = textWithoutDelimiter
    delemiterIndex.forEach((value, index) => {
      if (textWithoutDelimiter.length >= value) {
        const insertIndex = value + index
        result = `${result.slice(0, insertIndex)}-${result.slice(
          insertIndex,
          insertIndex + result.length
        )}`
        index++
      }
    })
    return result
  }

  replacePhoneNumber(text) {
    return text.replace(/-/g, '').replace(/\s+/g, '')
  }

  onCountryChange(){
    this.setState({
      phone: this.insertDelimiter(
        `+${this.state.countryFunctions.getCountryCode()}\t`
      )
    })
  }

  onPhoneChange = (phone) => {
    this.setState({phone: this.insertDelimiter(phone)})
  }

  onCodeChange = (code) => {
    this.setState({code})
  }

  onPhoneComplete = async () => {
    let token = null
    const listener = ({url}) => {
      WebBrowser.dismissBrowser()
      const tokenEncoded = Linking.parse(url).queryParams['token']
      if (tokenEncoded)
        token = decodeURIComponent(tokenEncoded)
    }
    Linking.addEventListener('url', listener)
    await WebBrowser.openBrowserAsync(captchaUrl)
    Linking.removeEventListener('url', listener)
    if (token) {
      const phone = this.replacePhoneNumber(this.state.phone)
      const captchaVerifier = {
        type: 'recaptcha',
        verify: () => Promise.resolve(token)
      }
      try {
        const confirmationResult = await auth.signInWithPhoneNumber(phone, captchaVerifier)
        this.setState({confirmationResult})
      } catch (error) {
        console.warn(error)
      }
    }
  }

  onSignIn = async () => {
    const {confirmationResult, code} = this.state
    this.setState({ appStatus: "Loading" })
    try {
      const next = this.props.navigation.state.params.nextScreen
      const { user } = await confirmationResult.confirm(code).catch(() => {
        this.setState({ appStatus: "SignIn" })
        return
      })
      if(next === 'SettingPassScreen'){ //[TODO]: pushTokenをRedaxから取得して、Wallet.createWalletの引数として送信する。////////////////////////////////////////////////////////////////////////////////////

        const pushToken = store.getState().auth.pushToken
        console.log(pushToken)
        const prevUser = await firebase.auth().currentUser
        const sendData = {
          pushToken: pushToken,
          ...prevUser.providerData[0]
        }
        console.log(sendData)
        await Wallet.createWallet(sendData)
        .catch((error) => {
          console.log(error)
          this.setState({ createErrorStatus: true })
        })
      }
      if(this.state.createErrorStatus) {
        await this.props.navigation.navigate('TopLoginScreen', {}, NavigationActions.navigate({ routeName: 'SmsLoginScreen' }))
      } else {
        await this.props.navigation.navigate(next, { user: user }, NavigationActions.navigate({ routeName: 'SmsLoginScreen' }))
      }
      this.setState({ appStatus: "SignIn" })
    } catch (error) {
      this.setState({ appStatus: "SignIn" })
      return
    }
    this.reset()
  }

  render() {
    if (this.state.appStatus === "Loading") {
      return <LoaderScreen />
    } else if (this.state.appStatus === "SignIn"){
      if (!this.state.confirmationResult)
        return (
          <View style={styles.container}>
            <Text
              style={styles.text}
            >SMS Login</Text>
            <View style={styles.phoneInput}>
              <PhoneInput
                ref={(ref) => { this.state.countryFunctions = ref; }}
                initialCountry='jp'
                value={this.state.phone}
                keyboardType="phone-pad"
                textProps={{
                  placeholder:"+00 00-0000-0000"
                }}
                style={{
                  padding: 20,
                  //marginTop: 150,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
                flagStyle={{
                  width: 50,
                  height: 30,
                  borderWidth: 1
                }}
                textStyle={{
                  fontSize: 20,
                }}
                onSelectCountry={(country) => { this.onCountryChange(country)}}
                onChangePhoneNumber={this.onPhoneChange}
              />
              </View>
            <Button
              title="SEND"
              titleStyle={{
                fontSize: 20,
                fontWeight: 'bold',
                color:"#fff"
              }}
              buttonStyle={{
                borderRadius: 50,
                backgroundColor:"#11bdff"
              }}
              containerStyle={{
                marginTop: 50,
                marginBottom: 40,
                justifyContent: 'flex-end'
              }}
              onPress={this.onPhoneComplete}
            />
            <Button
              style={styles.contentBack}
              buttonStyle={styles.backButton}
              onPress={() => {
                this.props.navigation.navigate('TopLoginScreen', {}, NavigationActions.navigate({ routeName: 'SmsLoginScreen' }))
              }}
              icon={
                <Icon
                  name="arrow-back"
                  size={50}
                  color="#606060"
                />
              }
            />
          </View>
        )
      else {
        return (
          <View style={{padding: 20, marginTop: 20}}>
            <Madoka
              value={this.state.code}
              style={styles.madokaTextInputPass}
              label={'Code from SMS'}
              borderColor={'#11bdff'}
              inputPadding={20}
              labelHeight={25}
              labelStyle={styles.madokaLabel}
              inputStyle={styles.madokaInput}
              keyboardType="numeric"
              onChangeText={this.onCodeChange}
            />
            <Button
              title="Sign in"
              titleStyle={{
                fontSize: 20,
                fontWeight: 'bold',
                color:"#fff"
              }}
              buttonStyle={{
                borderRadius: 50,
                backgroundColor:"#11bdff"
              }}
              containerStyle={{
                marginTop: 50,
                marginBottom: 40,
                justifyContent: 'flex-end',
              }}
              onPress={this.onSignIn}
            />
          </View>
        )
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,
    color: "#000",
    backgroundColor: '#fff'
  },
  text: {
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 35,
    fontWeight: 'bold',
    color: "#606060",
    marginTop: 50,
  },
  phoneInput: {
    marginTop: 50,
    borderRadius: 20,
    backgroundColor:'#fff',
    borderColor: '#909090',
    borderWidth: 1.5
  },
  button: {
    marginTop: 250,
    margin: 15,
    fontSize: 10
  },
  madokaLabel: {
    color: '#909090'
  },
  madokaInput: {
    color: '#909090'
  },
	madokaTextInputPass: {
    marginTop: 160,
    height:100
  },
  madokaButtonIcon: {
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5
  },
  contentBack: {
		alignItems: 'center',
    justifyContent: 'center',
    marginTop: 180,
  },
  backButton: {
    padding: 5,
    borderRadius: 30,
    backgroundColor:'#fff',
    borderColor: '#909090',
    borderWidth: 2
  }
})