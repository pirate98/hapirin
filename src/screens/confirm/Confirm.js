/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  BackHandler,
  I18nManager,
} from 'react-native';

// multi languages
import * as RNLocalize from 'react-native-localize';
import {I18n} from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better
import SoundService from '../../soundService/SoundService';
import FastImage from '@d11/react-native-fast-image';
import Constants from '../../constants/Constants';

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
  const fallback = {languageTag: 'jp', isRTL: false};

  const {languageTag, isRTL} =
    RNLocalize.findBestLanguageTag(Object.keys(translationGetters)) ||
    fallback;

  // clear translation cache
  translate.cache.clear();
  //update layout direction
  I18nManager.forceRTL(isRTL);
  //set i18n-js config
  i18n.translations = {[languageTag]: translationGetters[languageTag]()};
  i18n.locale = languageTag;
};

export default class Confirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      password: '',
      nickname: '',
      endname: 0,
      gender: '',
      age: 0,
    };
    this.backHandler = null;
    setI18nConfig(); //set initial config
  }

  async componentDidMount() {
    // register hardware back button listener
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Actions.pop();
      return true;
    });
    
  }

  componentWillUnmount() {
    // unregister hardware back button listener
    this.backHandler.remove()
    
  }

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };
  onClickRightButton = () => {
    // alert('BBBB')
  };

  onClickBackButton = () => {
    // Actions.pop();
  };

  render() {
    return (
      <View style={styles.parent}>
        <View style={styles.content}>
          <FastImage
            style={styles.image}
            source={require('../../resources/images/2_11_2.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
          <FastImage
            style={styles.image}
            source={require('../../resources/images/2_11_3.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
          <View
            style={{
              width: '100%',
              height: '20%',
            }}
          />
          <TouchableOpacity
            style={styles.imageHome}
            onPress={async () => {
              await SoundService.loadSoundSel('sel.mp3');
              this.props.navigation.navigate(Constants.SCREEN_HOME.KEY)
            }}>
            <FastImage
              style={styles.touch}
              source={require('../../resources/images/c-4-1.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FDF7E3',
    justifyContent: 'center',
  },
  toolbar: {
    flex: 2,
  },

  content: {
    flex: 8,
    flexDirection: 'column',
    alignItems: 'center',
  },

  image: {
    width: '70%',
    height: '30%',
    resizeMode: 'contain',
  },
  imageHome: {
    width: '60%',
    height: '20%',
  },
  touch: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
