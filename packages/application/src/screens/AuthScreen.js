import Wallet from '../plugins/wallet'
import React from 'react'
import { View, StyleSheet, Image, AppState, AsyncStorage } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Button, Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import Constants from 'expo-constants'
import LocalAuth from '../plugins/localAuth'

class AuthScreen extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      authenticated: false,
      appState: AppState.currentState
    }
  }

  componentDidMount = async () => {
    AppState.addEventListener('change', this.handleAppStateChange)
    const wallet = await Wallet.getWalletAddress()
    const cosignerPrivateKey = await Wallet.getCosignerPrivateKey()
    if(wallet && cosignerPrivateKey) {
      await this.localAuthentication()
    } else {
      await this.props.navigation.navigate('TopLoginScreen', {}, NavigationActions.navigate({ routeName: 'AuthScreen' }))
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = async (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      if(this.props.navigation.state.params.inactive) {
        this.localAuthentication()
        this.props.navigation.state.params = undefined
      } else {
        this.setState({ authenticated: true })
      }
    } else if (nextAppState.match(/inactive|background/)) {
      const outTime = Math.floor(new Date().getTime()/1000).toString()
      await AsyncStorage.setItem('BackgroundStartTime', outTime)
      this.setState({ authenticated: false })
    }
    this.setState({ appState: nextAppState })
  }

  localAuthentication = async () => {
    const outTime = Number(await AsyncStorage.getItem('BackgroundStartTime'))
    await AsyncStorage.setItem('BackgroundStartTime', '0')

    const inTime = Math.floor(new Date().getTime()/1000)
    const backgroundTime = inTime - outTime

    let result = true

    if(backgroundTime >= 60) {
      result = await LocalAuth.scanFingerPrint()
    }
    if (result) {
      await this.props.navigation.navigate('WalletScreen', {}, NavigationActions.navigate({ routeName: 'AuthScreen' }))
    } else {
      this.setState({ authenticated: true })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <React.Fragment>
          {this.state.authenticated && (
            <Text
              h2
              style={styles.textAppTitle}
            >
              Step Wallet
            </Text>
          )}
          <Image
            source={require('../../assets/images/paper_airplane1.png')}
            style={
              !this.state.authenticated && (styles.authenticatedFalseimagePaperAirplane) ||
              this.state.authenticated && (styles.authenticatedTrueimagePaperAirplane)
            }
          />
          {this.state.authenticated && (
            <Button
              large
              title="Authentication"
              titleStyle={styles.signInButtonTitle}
              icon={
                <Icon
                  name="sign-in"
                  size={30}
                  color="white"
                />
              }
              iconContainerStyle={styles.signInButtonIcon}
              buttonStyle={styles.signInButton}
              onPress={this.localAuthentication}
            />
          )}
        </React.Fragment>
      </View>
    )
  }
}

export default AuthScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight,
    padding: 8,
    backgroundColor: '#fff',
  },
  textAppTitle: {
    color: "#404040",
    fontWeight: 'bold'
  },
  authenticatedFalseimagePaperAirplane: {
    width: 200,
    height: 200,
    marginTop: 80,
    marginBottom: 90
  },
  authenticatedTrueimagePaperAirplane: {
    width: 230,
    height: 230,
    marginTop: 80,
    marginBottom: 90
  },
  signInButtonTitle: {
    marginLeft: 15
  },
  signInButtonIcon: {
    padding: 10
  },
  signInButton: {
    margin: 10,
    padding: 10,
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 5,
    backgroundColor:'#1DA1F2'
  }
})