import React, { Component } from 'react'
import { Platform, AppState } from 'react-native'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import AuthScreen from './AuthScreen'
import TopLoginScreen from './TopLoginScreen'
import SmsLoginScreen from './SmsLoginScreen'
import SettingPassScreen from './SettingPassScreen'
import RecoveryScreen from './RecoveryScreen'
import AppIntroScreen from './AppIntroScreen'
import WalletScreen from './WalletScreen'
import ScannerScreen from './ScannerScreen'
import DetailScreen from './DetailScreen'

const _navigationOptions = {
	headerStyle: {
		marginTop: Platform.OS === 'android' && options.headerShown !== false ? 56 : 0,
	},
	headerBackTitle: null,
	headerShown: false,
	header:null,
}

const SetupScreens = createSwitchNavigator({
	AuthScreen: {
		screen: AuthScreen,
		navigationOptions: _navigationOptions
	},
	TopLoginScreen: {
		screen: TopLoginScreen,
		navigationOptions: _navigationOptions
	},
	SmsLoginScreen: {
		screen: SmsLoginScreen,
		navigationOptions: _navigationOptions
	},
	RecoveryScreen: {
		screen: RecoveryScreen,
		navigationOptions: _navigationOptions
	},
  SettingPassScreen: {
		screen: SettingPassScreen,
		navigationOptions: _navigationOptions
	},
	AppIntroScreen: {
		screen: AppIntroScreen,
		navigationOptions: _navigationOptions
	},
	initialRouteName: 'AuthScreen',
})

const AppNavigator = createStackNavigator({
	SetupScreens: {
		screen: SetupScreens,
		navigationOptions: _navigationOptions
  },
	WalletScreen: {
		screen: WalletScreen,
		navigationOptions: _navigationOptions
	},
  ScannerScreen: {
		screen: ScannerScreen,
		navigationOptions: _navigationOptions
	},
	DetailScreen: {
		screen: DetailScreen,
		navigationOptions: _navigationOptions
	},
	initialRouteName: 'SetupScreens',
})

const App = createAppContainer(AppNavigator)

class NavigationScreen extends React.Component {
	constructor(props){
    super(props)
    this.state = {
			appState: AppState.currentState,
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = async (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    } else if(nextAppState.match(/inactive|background/)) {
			console.log('App has come to the inactive!')
      await this.props.navigation.navigate('AuthScreen')
    }
    this.setState({ appState: nextAppState })
	}

	render() {
		return <App/>
	}
}

export default NavigationScreen