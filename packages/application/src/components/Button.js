import { Button, Icon } from 'react-native-elements'

export const Button = (styles, onPress, iconName, iconSize, iconColor) => {
  return <Button
    style={styles}
    onPress={onPress}
    icon={
      <Icon
        name={iconName}
        size={iconSize}
        color={iconColor}
      />
    }
  />
}