import { StyleSheet } from 'react-native'
import { moderateScale } from 'react-native-size-matters'

export default StyleSheet.create({
  toolbar: {
    flex: 7,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  toolbar_title: {
    fontSize: moderateScale(22),
    color: 'white',
    fontFamily: 'HuiFont',
  },
  text_nomarl: {
    fontSize: 25,
    color: '#BB7E45',
    fontFamily: 'HuiFont',
  },
});