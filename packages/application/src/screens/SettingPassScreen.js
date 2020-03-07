import Wallet from '../plugins/wallet'
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Madoka } from 'react-native-textinput-effects'
import LoaderScreen from './LoaderScreen'

class SettingPassScreen extends React.Component {
	static navigationOptions = {
		title: 'SettingPass',
  }

	constructor(props){
    super(props)
    this.state = {
      pass: "",
      appStatus: 0
    }
  }

	loadData = async() => {
		this.setState({
			wallet: await Wallet.getWalletAddress(),
			balance: await Wallet.getWalletBalance()
		})
  }

	onChangePass = (_pass) => {
    this.setState({ pass: _pass })
  }

  setRecoveryHash = async () => {
    Wallet.setRecoveryHash(this.state.pass).then(async () => {
      await this.props.navigation.navigate('AppIntroScreen', {}, NavigationActions.navigate({ routeName: 'SettingPassScreen' }))
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
            onPress={this.setRecoveryHash}
          />
        </View>
      )
    }
  }
}

export default SettingPassScreen

const styles = StyleSheet.create({
  container: {
    color: "#000",
    backgroundColor: '#fff',
	},
  button: {
    marginTop: 250,
    margin: 15,
    fontSize: 10,
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
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5
  }
})
