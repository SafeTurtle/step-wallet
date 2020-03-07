import React, { Component } from 'react'
import { ScrollView, StyleSheet, Dimensions } from 'react-native'
import { Header } from 'react-native-elements'
import { WebView } from 'react-native-webview'
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;
class DetailScreen extends React.Component {
  render() {
    const { name, uri } = this.props.navigation.state.params
    return (
      <React.Fragment>
        <Header
          placement="left"
          statusBarProps={{ barStyle: 'light-content' }}
          barStyle="light-content"
          centerComponent={{ text: name, style: { color: '#000', fontSize: 35, fontWeight: 'bold' } }}
          rightComponent={{ icon: 'close', color: '#000', paddingRight: 20, size: 35, onPress:() => this.props.navigation.goBack()}}
          containerStyle={styles.headerContainer}
        />
        <ScrollView style={styles.container}>
          <WebView source={{ uri: uri }} style={styles.container}/>
        </ScrollView>
      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingRight: 25,
    flex: 0.15
  },
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

export default DetailScreen

