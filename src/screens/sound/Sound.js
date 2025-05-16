/**
 * sound screens
 */

import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  BackHandler,
  I18nManager,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';
import Constants from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import {I18n} from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import { Color } from '../../colors/Colors';
import { moderateScale } from 'react-native-size-matters';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from '@d11/react-native-fast-image';
import SoundService from '../../soundService/SoundService';

const i18n = new I18n()

const translationGetters = {
  //lazy requires (metro bundler does not support symlinks)
  jp: () => require('../../languages/japanese.json'),
};

const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

const setI18nConfig = () => {
  //fallback if no available language fits
  const fallback = { languageTag: 'jp', isRTL: false };

  const { languageTag, isRTL } =
    RNLocalize.findBestLanguageTag(Object.keys(translationGetters)) ||
    fallback;

  // clear translation cache
  translate.cache.clear();
  //update layout direction
  I18nManager.forceRTL(isRTL);
  //set i18n-js config
  i18n.translations = { [languageTag]: translationGetters[languageTag]() };
  i18n.locale = languageTag;
};

var widthScreen = Dimensions.get('window').width; //full width
var heightScreen = Dimensions.get('window').height; //full height

export default class Sound extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig(); //set initial config
    this.state = {
      bgVolume: '50',
      seVolume: '50',
      bgVolumeSto: '50',
      seVolumeSto: '50',
      minDistance: 0,
      maxDistance: 100,
      changeValue1: false,
      changeValue2: false,
    };
  }

  componentDidMount() {
    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      // Actions.pop();
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
    this.getVolume();
  }

  UNSAFE_componentWillMount() { }

  componentWillUnmount() {
    // unregister hardware back button listener
    BackHandler.removeEventListener('hardwareBackPress');
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
  }

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };

  async getVolume() {
    try {
      const key1 = await AsyncStorage.getItem('backgroundMusic');
      const key2 = await AsyncStorage.getItem('soundEffect');

      if (key1 !== null) {
        // We have data!!
        this.setState({ bgVolumeSto: key1 });
      }
      if (key2 !== null) {
        this.setState({ seVolumeSto: key2 });
      }
    } catch (error) {
      console.log('Error retrieving data' + error);
    }
  }

  async saveVolume(BGM, SoundEffect) {
    if (this.state.changeValue1 === true && BGM !== null) {
      try {
        await AsyncStorage.setItem('backgroundMusic', BGM);
      } catch (error) {
        console.log('Error saving data' + error);
      }
    }
    if (this.state.changeValue2 === true && SoundEffect !== null) {
      try {
        await AsyncStorage.setItem('soundEffect', SoundEffect);
      } catch (error) {
        console.log('Error saving data' + error);
      }
    }
  }

  onClickRightButton = () => {
    // alert('BBBB')
  };

  onClickBackButton = () => {
    this.props.navigation.pop()
  };

  render() {
    return (
      <View style={styles.parent}>
        <Toolbar
          leftIcon="back"
          nameRightButton="none"
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          title={Constants.SCREEN_SOUND.TITLE}
        />
        <View style={styles.content}>
          <FastImage
            style={styles.icon_image_bg}
            source={require('../../resources/images/g-2-1.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
          <View style={styles.viewSound}>
            <FastImage
              style={styles.icon_volume_lower}
              source={require('../../resources/images/4_3_6.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Slider
              style={styles.slider}
              step={1}
              minimumValue={this.state.minDistance}
              maximumValue={this.state.maxDistance}
              value={parseFloat(this.state.bgVolumeSto)}
              onValueChange={key1 => {
                this.setState({ bgVolume: key1, changeValue1: true });
              }}
              onSlidingStart={volume => {
                DeviceEventEmitter.emit(Constants.EVENT_CHANGE_SOUND, {
                  stop: true,
                  restart: false,
                });
              }}
              minimumTrackTintColor="black"
              thumbTintColor={Color.thumbTintColor}
              onSlidingComplete={bgVolume => {
                this.saveVolume(
                  JSON.stringify(
                    bgVolume !== null ? bgVolume : this.state.bgVolume,
                  ),
                  null,
                );
                this.getVolume(); // get data from storage, lấy giá trị so sánh với giá trị hiện tại của slider
                if (bgVolume !== this.state.bgVolumeSto) {
                  DeviceEventEmitter.emit(Constants.EVENT_CHANGE_SOUND, {
                    stop: false,
                    restart: true,
                  });
                }
              }}
            />
            <FastImage
              style={styles.icon_volume_up}
              source={require('../../resources/images/4_3_7.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
          <FastImage
            style={styles.icon_image_ef}
            source={require('../../resources/images/g-2-2.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
          <View style={styles.viewSound}>
            <FastImage
              style={styles.icon_volume_lower}
              source={require('../../resources/images/4_3_6.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Slider
              style={styles.slider}
              step={1}
              minimumValue={this.state.minDistance}
              maximumValue={this.state.maxDistance}
              value={parseFloat(this.state.seVolumeSto)}
              onValueChange={key2 => {
                this.setState({ seVolume: key2, changeValue2: true });
              }}
              minimumTrackTintColor="black"
              thumbTintColor={Color.thumbTintColor}
              onSlidingComplete={async seVolume => {
                this.saveVolume(
                  null,
                  JSON.stringify(
                    seVolume !== null ? seVolume : this.state.seVolume,
                  ),
                );
                this.getVolume(); // get data from storage, lấy giá trị so sánh với giá trị hiện tại của slider
                if (seVolume !== this.state.seVolumeSto) {
                  await SoundService.loadSoundSel('sel.mp3');
                }
              }}
            />
            <FastImage
              style={styles.icon_volume_up}
              source={require('../../resources/images/4_3_7.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewSetting}
          onPress={() => {
            this.props.navigation.pop()
          }}>
          {/* <Text style={styles.textSetting}>{translate('setting')}</Text> */}
          <FastImage
            style={styles.textSetting}
            source={require('../../resources/images/g-2-3.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    flexDirection: 'column',
  },
  toolbar: {
    flex: 2,
  },
  content: {
    flex: 8,
    flexDirection: 'column',
    backgroundColor: Color.backgroundSetting,
    paddingStart: moderateScale(25),
    paddingEnd: moderateScale(25),
  },
  icon_image_bg: {
    width: moderateScale(80),
    height: moderateScale(30),
    resizeMode: 'contain',
    marginBottom: moderateScale(25),
    marginTop: moderateScale(25),
  },
  icon_image_ef: {
    width: moderateScale(110),
    height: moderateScale(30),
    resizeMode: 'contain',
    marginBottom: moderateScale(25),
    marginTop: moderateScale(25),
  },
  viewSound: {
    flexDirection: 'row',
    marginBottom: moderateScale(15),
  },
  icon_volume_lower: {
    width: moderateScale(30),
    height: moderateScale(30),
    resizeMode: 'contain',
  },
  icon_volume_up: {
    width: moderateScale(30),
    height: moderateScale(30),
    resizeMode: 'contain',
    end: 0,
  },
  slider: {
    flex: 1,
    height: moderateScale(30),
  },
  viewSetting: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    bottom: heightScreen * 0.05,
    alignSelf: 'center',
    borderRadius: moderateScale(5),
  },
  textSetting: {
    resizeMode: 'contain',
    width: widthScreen * 0.7,
    height: moderateScale(60),
  },
});
