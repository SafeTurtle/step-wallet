import React, { Component } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Button, Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'

import LoaderScreen from './LoaderScreen'

class TopScreen extends Component {
  constructor(props){
    super(props)
    this.state = {
      appStatus: "SignIn"
    }
  }

  onSignInAppWithPhone = async () => {
    await this.props.navigation.navigate('SmsLoginScreen', { nextScreen: 'SettingPassScreen' }, NavigationActions.navigate({ routeName: 'TopScreen' }))
  }
  onSignInRecoveryWithPhone = async () => {
    await this.props.navigation.navigate('SmsLoginScreen', { nextScreen: 'RecoveryScreen' }, NavigationActions.navigate({ routeName: 'TopScreen' }))
  }

  render() {
    if (this.state.appStatus === "Loading") {
      return <LoaderScreen />
    } else if (this.state.appStatus === "SignIn"){
      return (
        <View style={styles.container}>
          <Text
            h2
            style={styles.textAppTitle}
          >Step Wallet
          </Text>
          <Image
            source={require('../../assets/images/paper_airplane1.png')}
            style={styles.imagePaperAirplane}
          />
          <Button
            large
            title="Sign in with Phone"
            titleStyle={styles.signInWithPhoneButtonTitle}
            icon={
              <Icon
                name="phone"
                size={26}
                color="white"
              />
            }
            iconContainerStyle={styles.signInWithPhoneButtonIcon}
            buttonStyle={styles.signInWithPhoneButton}
            onPress={this.onSignInAppWithPhone}
          />
          <Button
            large
            title="Sign in with Recovery"
            titleStyle={styles.signInWithRecoveryButtonTitle}
            icon={
              <Icon
                name="key"
                size={26}
                color="white"
              />
            }
            buttonStyle={styles.signInWithRecoveryButton}
            onPress={this.onSignInRecoveryWithPhone}
          />
        </View>
      )
    }
  }
}

export default TopScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textAppTitle: {
    color: "#404040",
    fontWeight: 'bold'
  },
  imagePaperAirplane: {
    width: 230,
    height: 230,
    marginTop: 80,
    marginBottom: 90
  },
  signInWithPhoneButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color:"#fff",
    marginLeft: 24
  },
  signInWithRecoveryButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color:"#fff",
    marginLeft: 15
  },
  signInWithPhoneButtonIcon: {
    padding: 10
  },
  signInWithPhoneButton: {
    margin: 10,
    padding: 10,
    paddingRight: 28,
    paddingLeft: 20,
    borderRadius: 5,
    backgroundColor:'#DD5144'
  },
  signInWithRecoveryButton: {
    margin: 10,
    padding: 10,
    paddingLeft: 14,
    borderRadius: 5,
    backgroundColor:'#1DA1F2'
  }
})
