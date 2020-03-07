import React, { Component } from 'react'
import { View, Text, Image } from 'react-native'
import { ListItem, Icon } from 'react-native-elements'

//item.name TO や from + address + value
//item.icon は pendding はオレンジ, successは緑、失敗はFailure、 TO や from + address + value

// export default TransactionHistory = (props, items, styles, onPress) => {
//   return <View style={styles.contentSettings}>
//     {
//       items.map((item, i) => {
//         return (
//           <ListItem
//             style={styles.contentListItemSettings}
//             key={i}
//             title={item.to}
//             titleStyle={styles.modalListItemtitle}
//             bottomDivider
//             onPress={onPress}
//           >
//           </ListItem>
//         )
//       })//            leftIcon={{ name: item.icon, color: "#303030", size: 30, paddingLeft: 5 }}

//     }
//   </View>
// }

//titleをステータスにしても良いかも
export default class TransactionHistoryComponent extends React.Component {
	render() {
    const { items, styles, onPress } = this.props
		return (
			<View style={styles.contentSettings}>
        {
          items.map((item, i) => {
            return (
              <ListItem
                style={styles.contentListItemSettings}
                key={i}
                title={item.from}
                titleStyle={styles.modalListItemtitle}
                subtitle={`${item.from} -> ${item.to}`}
                bottomDivider
                onPress={onPress}
              >
              </ListItem>
            )
          })//leftIcon={{ name: item.icon, color: "#303030", size: 30, paddingLeft: 5 }}
        }
      </View>
    )
	}
}