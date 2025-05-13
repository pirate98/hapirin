import { Platform, Dimensions } from 'react-native';

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';
const widthScreen = Dimensions.get('window').width;
const heightScreen = Dimensions.get('window').height;

const platforms = { isAndroid, isIOS, widthScreen, heightScreen };

export default platforms;
