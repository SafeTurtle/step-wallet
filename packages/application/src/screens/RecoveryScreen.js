import Wallet from '../plugins/wallet'
import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Button, Input } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Madoka } from 'react-native-textinput-effects'
import LoaderScreen from './LoaderScreen'

class RecoveryScreen extends React.Component {
	static navigationOptions = {
		title: 'Recovery',
  }

	constructor(props){
    super(props)
    this.state = {
      pass: "",
      appStatus: 0
    }
  }

	onChangePass = (_pass) => {
    this.setState({ pass: _pass })
  }

  recoveryWallet = async () => {
    Wallet.recoveryWallet(this.props.navigation.state.params.user, "0x", this.state.pass).then(async (data) => {
      await this.props.navigation.navigate('WalletScreen', {}, NavigationActions.navigate({ routeName: 'SetupScreens' }))
      this.setState({ appStatus: 0 })
    })
    this.setState({ appStatus: 1 })
  }

  render() {
    if (this.state.appStatus === 1) {
      return <LoaderScreen />
    } else {
      return(
        <View style={{ padding: 20, marginTop: 20 }}>
          <Madoka
            value={this.state.pass}
            style={styles.madokaTextInputPass}
            label={'Password for recovery'}
            borderColor={'#11bdff'}
            inputPadding={20}
            labelHeight={25}
            labelStyle={styles.madokaLabel}
            inputStyle={styles.madokaInput}
            onChangeText={this.onChangePass}
          />
          <Button
            title="SEND"
            titleStyle={{
              marginLeft: 5,
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
            icon={
              <Icon
                size={18}
                name='key'
                color='#fff'
                iconStyle={styles.madokaButtonIcon}
              />
            }
            onPress={this.recoveryWallet}
          />
        </View>
      )
    }
  }
}

export default RecoveryScreen

const styles = StyleSheet.create({
  container: {
    color: "#000",
    backgroundColor: '#fff'
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
    marginTop: 150,
    height:100
  },
  madokaButtonIcon: {
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5
  }
})
