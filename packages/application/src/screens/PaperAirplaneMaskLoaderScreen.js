import React from 'react';
import { StyleSheet, View, Button } from 'react-native'
import Loader from '../components/MaskLoader'
import NavigationScreen from './NavigationScreen'

export default class PaperAirplaneMaskLoaderScreen extends React.Component {

  constructor() {
    super();
    this.state = {
      appReady: false,
      rootKey: Math.random(),
    }
    this._image = require('../../assets/images/paper_airplane2.png')
  }

  componentDidMount() {
    this.resetAnimation()
  }

  resetAnimation() {
    this.setState({
      appReady: false,
      rootKey: Math.random()
    })

    setTimeout(() => {
      this.setState({
        appReady: true,
      });
    }, 1000)
  }

  render() {
    return (
      <View key={this.state.rootKey} style={styles.root}>
        <Loader
          isLoaded={this.state.appReady}
          imageSource={this._image}
          backgroundStyle={styles.loadingBackgroundStyle}
        >
          <NavigationScreen/>
        </Loader>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingBackgroundStyle: {
    backgroundColor: '#00acee',
  },
})