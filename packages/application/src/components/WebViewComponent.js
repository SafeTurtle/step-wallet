import React, { Component } from 'react'
import { ScrollView, StyleSheet, Dimensions } from 'react-native'
import { WebView } from 'react-native-webview'
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default class WebViewComponent extends React.Component {
  render() {
    const { name, uri } = this.props.navigation.state.params
    return (
      <React.Fragment>
        <ScrollView style={styles.container}>
          <WebView source={{ uri: uri }} style={styles.container}/>
        </ScrollView>
      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 115,
    width: width,
    height: height,
    backgroundColor: '#fff'
  },
  image: {
    width:400,
    height:550,
    borderWidth: 1,
  },
})

