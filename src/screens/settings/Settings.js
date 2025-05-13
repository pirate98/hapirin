/**
 * Setting Screen
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  I18nManager,
  Alert,
  Platform,
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';
import Constants from '../../constants/Constants';
import Navigation from '../navigation/Navigation';
import email from 'react-native-email';
// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
// call file color
import {Color} from '../../colors/Colors';
//use scale size for screen different
import {moderateScale} from 'react-native-size-matters';
//rate app
import Rate, {AndroidMarket} from 'react-native-rate';
import SoundService from '../../soundService/SoundService';
import scales from '../../styles/scales';
import FastImage from 'react-native-fast-image';
import {Actions} from 'react-native-router-flux';

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

var widthScreen = Dimensions.get('window').width; //full width
var heightScreen = Dimensions.get('window').height; //full height
var IMAGES_PER_ROW = 3;

export default class Settings extends Component {
  constructor(props) {
    super(props);
    setI18nConfig(); //set initial config
    this.state = {
      rated: false,
      bgVolume: '50',
      seVolume: '50',
    };
  }

  async componentDidMount() {
    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      // Actions.pop();
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);

    //    audioBtn = await SoundService.loadSoundSel('sel.mp3');
  }

  componentWillUnmount() {
    // unregister hardware back button listener
    BackHandler.removeEventListener('hardwareBackPress');
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
  }

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };

  onClickRightButton = () => {
    // alert('BBBB')
  };

  onClickBackButton = () => {
    this.props.navigation.state.params.onBack({
      refresh: new Date().getTime(),
    });
    Actions.pop();
  };

  onEditUserInfoPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    Navigation.gotoEditUser();
  };

  onTutorialPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    // alert('tutorial');
    Navigation.gotoIntroduceInfo({screen: 'setting'});
  };

  onWebviewPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    Navigation.gotoWebview();
  };

  onSharePress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    Navigation.gotoShareInfo();
  };

  onRatePress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    const options = {
      //sample link to app in store
      AppleAppID: '1474769813',
      GooglePackageName: 'com.cdicdi.proCDI',
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: false,
      openAppStoreIfInAppFails: true,
      fallbackPlatformURL: 'http://hapirin.com',
    };
    Rate.rate(options, success => {
      if (success) {
        // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
        this.setState({rated: true});
      }
    });
  };

  onNotificationPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    Navigation.gotoNotificationInfo();
  };

  onTermServicesPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    Navigation.gotoTermsOfService();
  };

  onPrivacyPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    Navigation.gotoPrivacyPolicy();
  };

  onSendMailPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    const to = ['toi@hapiboo.jp']; // string or array of email addresses
    email(to, {
      // Optional additional arguments
      subject: 'hapiboo♪アプリ問い合わせ',
      body:
        '【お問い合わせの内容】' +
        '<br>' +
        '①バグor ②その他' +
        '<br>' +
        '※どちらかをお選びください' +
        '<br>' +
        '<br>' +
        '①バグの場合大変お手数ですが、下記をお知らせください。' +
        '<br>' +
        '１）不具合の現象' +
        '<br>' +
        '２）お使いの端末の機種名' +
        '<br>' +
        '３）iOSまたはAndroidのバージョン' +
        '<br>' +
        '<br>' +
        '②その他（自由にご記入ください）' +
        '<br>' +
        '<br>' +
        '※回答をさせていただきますので、' +
        '<br>' +
        '「@hapiboo.jp」からのメールを受信できるよう設定をお願いします。',
    }).catch(error => {
      if (error) {
        Alert.alert('', translate('can_not_open_app_send_mail'));
      }
    });
  };

  onCompanyProfilePress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    Navigation.gotoCompanyProfile();
  };

  onVersionPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    Navigation.gotoVersions();
  };

  onSoundPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    Navigation.gotoSound();
  };

  render() {
    return (
      <View style={styles.container}>
        <Toolbar
          leftIcon="home"
          nameRightButton="none"
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          onClickRightButton={() => this.onClickRightButton()}
          title={Constants.SCREEN_OTHER.TITLE}
        />
        <View style={styles.content}>
          <View style={styles.viewRow1}>
            <TouchableOpacity
              style={styles.itemRow}
              onPress={this.onEditUserInfoPress}>
              <FastImage
                style={styles.itemImage}
                resizeMode={FastImage.resizeMode.stretch}
                source={require('../../resources/images/20181029/opg/sonohoka_01.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.itemRow}
              onPress={this.onTutorialPress}>
              <FastImage
                style={styles.itemImage}
                resizeMode={FastImage.resizeMode.stretch}
                source={require('../../resources/images/20181029/opg/sonohoka_02.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.itemRow}
              onPress={this.onWebviewPress}>
              <FastImage
                style={styles.itemImage}
                resizeMode={FastImage.resizeMode.stretch}
                source={require('../../resources/images/20181029/opg/sonohoka_03.png')}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.viewRow2}>
            <TouchableOpacity
              style={styles.itemRow}
              onPress={this.onSharePress}>
              <FastImage
                style={styles.itemImage}
                resizeMode={FastImage.resizeMode.stretch}
                source={require('../../resources/images/20181029/opg/sonohoka_04.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemRow} onPress={this.onRatePress}>
              <FastImage
                style={styles.itemImage}
                resizeMode={FastImage.resizeMode.stretch}
                source={require('../../resources/images/20181029/opg/sonohoka_05.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.itemRow}
              onPress={this.onNotificationPress}>
              <FastImage
                style={styles.itemImage}
                resizeMode={FastImage.resizeMode.stretch}
                source={require('../../resources/images/20181029/opg/sonohoka_06.png')}
              />
            </TouchableOpacity>
          </View>
          {/* <ScrollView
            style={styles.viewList}
            showsVerticalScrollIndicator={false}> */}
          <FastImage
            style={styles.itemHorizontalBar}
            resizeMode={FastImage.resizeMode.contain}
            source={require('../../resources/images/20181029/opg/sonohoka_07.png')}
          />
          <TouchableOpacity onPress={this.onTermServicesPress}>
            <FastImage
              style={styles.itemImageInfo1}
              resizeMode={FastImage.resizeMode.contain}
              source={require('../../resources/images/20181029/opg/sonohoka_08.png')}
            />
          </TouchableOpacity>
          <FastImage
            style={styles.itemHorizontalBar}
            resizeMode={FastImage.resizeMode.contain}
            source={require('../../resources/images/20181029/opg/sonohoka_07.png')}
          />
          <TouchableOpacity onPress={this.onPrivacyPress}>
            <FastImage
              style={styles.itemImageInfo2}
              resizeMode={FastImage.resizeMode.contain}
              source={require('../../resources/images/20181029/opg/sonohoka_09.png')}
            />
          </TouchableOpacity>
          <FastImage
            style={styles.itemHorizontalBar}
            resizeMode={FastImage.resizeMode.contain}
            source={require('../../resources/images/20181029/opg/sonohoka_07.png')}
          />
          <TouchableOpacity onPress={this.onSendMailPress}>
            <FastImage
              style={styles.itemImageInfo3}
              resizeMode={FastImage.resizeMode.contain}
              source={require('../../resources/images/20181029/opg/sonohoka_10.png')}
            />
          </TouchableOpacity>
          <FastImage
            style={styles.itemHorizontalBar}
            resizeMode={FastImage.resizeMode.contain}
            source={require('../../resources/images/20181029/opg/sonohoka_07.png')}
          />
          <TouchableOpacity onPress={this.onCompanyProfilePress}>
            <FastImage
              style={styles.itemImageInfo4}
              resizeMode={FastImage.resizeMode.contain}
              source={require('../../resources/images/20181029/opg/sonohoka_11.png')}
            />
          </TouchableOpacity>
          <FastImage
            style={styles.itemHorizontalBar}
            resizeMode={FastImage.resizeMode.contain}
            source={require('../../resources/images/20181029/opg/sonohoka_07.png')}
          />
          <TouchableOpacity onPress={this.onVersionPress}>
            <FastImage
              style={styles.itemImageInfo5}
              resizeMode={FastImage.resizeMode.contain}
              source={require('../../resources/images/20181029/opg/sonohoka_12.png')}
            />
          </TouchableOpacity>
          <FastImage
            style={styles.itemHorizontalBar}
            resizeMode={FastImage.resizeMode.contain}
            source={require('../../resources/images/20181029/opg/sonohoka_07.png')}
          />
          <TouchableOpacity onPress={this.onSoundPress}>
            <FastImage
              style={styles.itemImageInfo6}
              resizeMode={FastImage.resizeMode.contain}
              source={require('../../resources/images/20181029/opg/sonohoka_13.png')}
            />
          </TouchableOpacity>
          <FastImage
            style={styles.itemHorizontalBar}
            resizeMode={FastImage.resizeMode.contain}
            source={require('../../resources/images/20181029/opg/sonohoka_07.png')}
          />
          {/* </ScrollView> */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
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
  },
  viewRow1: {
    flexDirection: 'row',
    paddingTop:
      Platform.OS === 'ios' ? scales.vertical(20) : scales.vertical(15),
  },
  viewRow2: {
    flexDirection: 'row',
    marginBottom:
      Platform.OS === 'android'
        ? 0
        : Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800)
        ? 0
        : scales.vertical(15),
  },
  itemRow: {
    width: widthScreen / IMAGES_PER_ROW,
    height:
      Platform.OS === 'android'
        ? heightScreen * 0.18
        : Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800)
        ? heightScreen * 0.19
        : heightScreen * 0.18,
    alignItems: 'center',
  },
  itemImage: {
    width: widthScreen / 3.6,
    height:
      Platform.OS === 'android'
        ? widthScreen / 3.4
        : Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800)
        ? widthScreen / 2.8
        : widthScreen / 3.4,
    position: 'absolute',
    flexDirection: 'row',
  },
  viewList: {
    alignSelf: 'center',
  },
  itemHorizontalBar: {
    width: widthScreen - 30,
    height: moderateScale(1),
    alignSelf: 'center',
  },
  itemImageInfo1: {
    width: moderateScale(130),
    height: scales.vertical(45),
    marginTop: Platform.OS === 'android' ? moderateScale(3) : moderateScale(7),
    marginBottom:
      Platform.OS === 'android' ? moderateScale(3) : moderateScale(7),
    marginStart: moderateScale(20),
    resizeMode: 'contain',
  },
  itemImageInfo2: {
    marginTop: Platform.OS === 'android' ? moderateScale(2) : moderateScale(6),
    marginBottom:
      Platform.OS === 'android' ? moderateScale(2) : moderateScale(6),
    marginStart: moderateScale(20),
    width: moderateScale(180),
    height: scales.vertical(45),
    resizeMode: 'contain',
  },
  itemImageInfo3: {
    marginTop: Platform.OS === 'android' ? moderateScale(2) : moderateScale(6),
    marginBottom:
      Platform.OS === 'android' ? moderateScale(2) : moderateScale(6),
    marginStart: moderateScale(20),
    width: moderateScale(140),
    height: scales.vertical(45),
    resizeMode: 'contain',
  },
  itemImageInfo4: {
    marginTop: Platform.OS === 'android' ? moderateScale(2) : moderateScale(6),
    marginBottom:
      Platform.OS === 'android' ? moderateScale(2) : moderateScale(6),
    marginStart: moderateScale(20),
    width: moderateScale(120),
    height: scales.vertical(45),
    resizeMode: 'contain',
  },
  itemImageInfo5: {
    marginTop:
      Platform.OS === 'android'
        ? moderateScale(2)
        : Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800)
        ? moderateScale(6)
        : moderateScale(1),
    marginBottom:
      Platform.OS === 'android'
        ? moderateScale(2)
        : Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800)
        ? moderateScale(6)
        : moderateScale(1),
    width: moderateScale(300),
    height:
      Platform.OS === 'android'
        ? scales.vertical(48)
        : Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800)
        ? scales.vertical(48)
        : scales.vertical(58),
    resizeMode: 'contain',
  },
  itemImageInfo6: {
    marginTop: Platform.OS === 'android' ? moderateScale(2) : moderateScale(6),
    marginBottom:
      Platform.OS === 'android' ? moderateScale(2) : moderateScale(6),
    marginStart: moderateScale(20),
    width: moderateScale(110),
    height: scales.vertical(45),
    resizeMode: 'contain',
  },
});
