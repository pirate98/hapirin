/**
 * BeetSoft Co., Ltd
 * Policy Screen
 *
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  BackHandler,
  I18nManager,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import Constants from '../../constants/Constants';
import {moderateScale} from 'react-native-size-matters';
import Toolbar from '../toolbar/Toolbar';
import {Color} from '../../colors/Colors';
import CheckBox from 'react-native-check-box';
// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better
import SoundService from '../../soundService/SoundService';
import FastImage from '@d11/react-native-fast-image';

var heightScreen = Dimensions.get('window').height; //full height

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
    RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    fallback;

  // clear translation cache
  translate.cache.clear();
  //update layout direction
  I18nManager.forceRTL(isRTL);
  //set i18n-js config
  i18n.translations = {[languageTag]: translationGetters[languageTag]()};
  i18n.locale = languageTag;
};

export default class Privacy extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig();
    this.state = {
      checkPolicy: false,
    };
  }

  async componentDidMount() {
    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate(Constants.SCREEN_START.KEY)
      return true;
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);

    // audioBtn = await SoundService.loadSoundSel('sel.mp3');
  }

  componentWillUnmount() {
    // unregister hardware back button listener
    BackHandler.removeEventListener('hardwareBackPress');
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
  }

  onClickBackButton = () => {
    this.props.navigation.navigate(Constants.SCREEN_START.KEY)
  };

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };

  render() {
    return (
      <View style={styles.parent}>
        <Toolbar
          leftIcon="back"
          nameRightButton=""
          onClickBackButton={() => this.onClickBackButton()}
          title={Constants.SCREEN_PRIVACY.TITLE}
        />
        <View style={styles.content}>
          <FastImage
            style={styles.note}
            source={require('../../resources/images/c-4-03.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
          <FastImage
            style={styles.textnoty}
            source={require('../../resources/images/c-4-04.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
          <TouchableOpacity
            style={styles.viewLinkPdf}
            onPress={async () => {
              await SoundService.loadSoundSel('sel.mp3');
              this.props.navigation.navigate(Constants.SCREEN_PDF_VIEW.KEY)
            }}>
            <FastImage
              style={styles.textpoli}
              source={require('../../resources/images/c-4-05.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
          <CheckBox
            style={styles.checkbox}
            rightTextStyle={styles.textCheckbox}
            onClick={async () => {
              await SoundService.loadSoundSel('sel.mp3');
              this.setState({
                checkPolicy: !this.state.checkPolicy,
              });
            }}
            isChecked={this.state.checkPolicy}
            rightText={translate('privacy_agree')}
            checkedImage={
              <FastImage
                source={require('../../resources/images/2_10_08_0309.png')}
                style={styles.iconCheck}
                resizeMode={FastImage.resizeMode.contain}
              />
            }
            unCheckedImage={
              <FastImage
                source={require('../../resources/images/2_10_09_0309.png')}
                style={styles.iconCheck}
                resizeMode={FastImage.resizeMode.contain}
              />
            }
          />
          <TouchableOpacity
            style={styles.buttonCharing}
            onPress={async () => {
              await SoundService.loadSoundSel('sel.mp3');
              if (this.state.checkPolicy) {
                this.props.navigation.navigate(Constants.SCREEN_REGISTER_INFO.KEY)
              } else {
                Alert.alert(
                  translate('warning_dialog'),
                  translate('check_radio_privacy_policy'),
                  [
                    {
                      text: translate('dialog_button_yes'),
                    },
                  ],
                );
              }
            }}>
            <Text style={styles.textCharing}>{translate('privacy_next')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    height:
      Platform.OS === 'ios'
        ? heightScreen
        : heightScreen - StatusBar.currentHeight,
    flexDirection: 'column',
    backgroundColor: Color.backgroundSetting,
  },

  content: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.backgroundSetting,
  },
  note: {
    top: '5%',
    width: '80%',
    height: '40%',
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  textnoty: {
    width: '80%',
    height: '20%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  textpoli: {
    width: '100%',
    height: '45%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  radioGroup: {
    width: '60%',
    height: '20%',
    alignSelf: 'center',
  },
  checkbox: {
    alignItems: 'center',
    width: moderateScale(180),
    fontFamily: 'HuiFont',
  },
  textCheckbox: {
    fontFamily: 'HuiFont',
    color: Color.colorTextCommon,
    fontSize: moderateScale(18),
    fontWeight: 'normal',
  },
  iconCheck: {
    width: moderateScale(25),
    height: moderateScale(25),
  },

  textCharing: {
    color: 'white',
    fontSize: moderateScale(25),
    fontWeight: 'normal',
    fontFamily: 'HuiFont',
  },
  buttonCharing: {
    width: moderateScale(200),
    height: moderateScale(50),
    margin: moderateScale(30),
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',
    borderColor: Color.white,
    borderWidth: 2,
    backgroundColor: '#785230',
  },
  viewLinkPdf: {
    width: '100%',
    height: '10%',
    resizeMode: 'contain',
  },
});
