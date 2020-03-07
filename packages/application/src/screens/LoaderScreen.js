import React from 'react'
import { StyleSheet } from 'react-native'
import AnimatedLoader from "react-native-animated-loader"

export default class LoaderScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = { visible: true }
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        visible: !this.state.visible
      })
    }, 300000)
  }

  render() {
    const { visible } = this.state
    return (
      <AnimatedLoader
        visible={visible}
        overlayColor="rgba(255,255,255,0.75)"
        source={require("../../assets/animations/loadig_dot_blue.json")} //lf30_editor_p581s3 {width: 300, height: 300}
        animationStyle={styles.lottie}
        speed={1}
      />
    )
  }
}

const styles = StyleSheet.create({
  lottie: {
    width: 200,
    height: 200
  }
})