import React, { Component } from 'react'
import { StyleSheet, AppState } from 'react-native'
import Constants from 'expo-constants'
import { NavigationActions } from 'react-navigation'

class AppStateScreen extends Component {
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
      console.log('App has come to the foreground!');
    } else if(nextAppState.match(/inactive|background/)) {
      console.log('App has come to the inactive!');
      await this.props.navigation.navigate('AuthScreen', {}, NavigationActions.navigate({ routeName: 'AppStateScreen' }))
    }
    this.setState({ appState: nextAppState })
  }

  render() {
    return <React.Fragment/>
  }
}

export default AppStateScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight,
    padding: 8,
    backgroundColor: '#fff',
  }
})