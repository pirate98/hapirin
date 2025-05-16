import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  I18nManager,
  Alert,
  Platform,
  AppState,
} from 'react-native';
import Toolbar from '../toolbar/Toolbar';
import Constants from '../../constants/Constants';
import email from 'react-native-email';
import * as RNLocalize from 'react-native-localize';
import {I18n} from 'i18n-js';
import memoize from 'lodash.memoize';
import Rate, { AndroidMarket } from 'react-native-rate';
import SoundService from '../../soundService/SoundService';
import FastImage from '@d11/react-native-fast-image';
import { useNavigation, useRoute } from '@react-navigation/native';

const i18n = new I18n()

const translationGetters = {
  jp: () => require('../../languages/japanese.json'),
};

const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

const setI18nConfig = () => {
  const fallback = { languageTag: 'jp', isRTL: false };
  const { languageTag, isRTL } =
    RNLocalize.findBestLanguageTag(Object.keys(translationGetters)) || fallback;

  translate.cache.clear();
  I18nManager.forceRTL(isRTL);
  i18n.translations = { [languageTag]: translationGetters[languageTag]() };
  i18n.locale = languageTag;
};

const widthScreen = Dimensions.get('window').width;
const heightScreen = Dimensions.get('window').height;
const IMAGES_PER_ROW = 3;

const imageMap = {
  'sonohoka_01.png': require('../../resources/images/20181029/opg/sonohoka_01.png'),
  'sonohoka_02.png': require('../../resources/images/20181029/opg/sonohoka_02.png'),
  'sonohoka_03.png': require('../../resources/images/20181029/opg/sonohoka_03.png'),
  'sonohoka_04.png': require('../../resources/images/20181029/opg/sonohoka_04.png'),
  'sonohoka_05.png': require('../../resources/images/20181029/opg/sonohoka_05.png'),
  'sonohoka_06.png': require('../../resources/images/20181029/opg/sonohoka_06.png'),
  'sonohoka_07.png': require('../../resources/images/20181029/opg/sonohoka_07.png'),
  'sonohoka_08.png': require('../../resources/images/20181029/opg/sonohoka_08.png'),
  'sonohoka_09.png': require('../../resources/images/20181029/opg/sonohoka_09.png'),
  'sonohoka_10.png': require('../../resources/images/20181029/opg/sonohoka_10.png'),
  'sonohoka_11.png': require('../../resources/images/20181029/opg/sonohoka_11.png'),
  'sonohoka_12.png': require('../../resources/images/20181029/opg/sonohoka_12.png'),
  'sonohoka_13.png': require('../../resources/images/20181029/opg/sonohoka_13.png'),
};


const Settings = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [locale, setLocale] = useState(RNLocalize.getLocales()[0]?.languageTag);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    setI18nConfig();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        const currentLocale = RNLocalize.getLocales()[0]?.languageTag;
        if (currentLocale && currentLocale !== locale) {
          setLocale(currentLocale);
          setI18nConfig();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      backHandler.remove();
      subscription.remove();
    };
  }, []);

  const handleLocalizationChange = () => {
    setI18nConfig();
  };

  const playSelectSound = async () => {
    await SoundService.loadSoundSel('sel.mp3');
  };

  const onClickBackButton = () => {
    route.params?.onBack?.({ refresh: new Date().getTime() });
    navigation.goBack();
  };

  const handleRatePress = async () => {
    await playSelectSound();
    const options = {
      AppleAppID: '1474769813',
      GooglePackageName: 'com.cdicdi.proCDI',
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: false,
      openAppStoreIfInAppFails: true,
      fallbackPlatformURL: 'http://hapirin.com',
    };
    Rate.rate(options, success => {
      if (success) setRated(true);
    });
  };

  const handleSendMail = async () => {
    await playSelectSound();
    const to = ['toi@hapiboo.jp'];
    email(to, {
      subject: 'hapiboo♪アプリ問い合わせ',
      body: `【お問い合わせの内容】
①バグor ②その他
※どちらかをお選びください

①バグの場合大変お手数ですが、下記をお知らせください。
１）不具合の現象
２）お使いの端末の機種名
３）iOSまたはAndroidのバージョン

②その他（自由にご記入ください）

※回答をさせていただきますので、
「@hapiboo.jp」からのメールを受信できるよう設定をお願いします。`,
    }).catch(() => {
      Alert.alert('', translate('can_not_open_app_send_mail'));
    });
  };

  const renderOptionButton = (onPress, imageSource, style) => (
    <TouchableOpacity onPress={onPress}>
      <FastImage
        style={style}
        resizeMode={FastImage.resizeMode.contain}
        source={imageSource}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Toolbar
        leftIcon="home"
        nameRightButton="none"
        style={styles.toolbar}
        onClickBackButton={onClickBackButton}
        onClickRightButton={() => { }}
        title={Constants.SCREEN_OTHER.TITLE}
      />
      <View style={styles.content}>
        <View style={styles.viewRow1}>
          {[
            [this.props.navigation.navigate(Constants.SCREEN_EDIT_USER.KEY), 'sonohoka_01.png'],
            [() => this.props.navigation.navigate(Constants.SCREEN_INTRODUCE.KEY, { screen: 'setting' }), 'sonohoka_02.png'],
            [this.props.navigation.navigate(Constants.SCREEN_WEBVIEW.KEY), 'sonohoka_03.png'],
          ].map(([handler, img], index) => (
            <TouchableOpacity key={index} style={styles.itemRow} onPress={async () => { await playSelectSound(); handler(); }}>
              <FastImage
                style={styles.itemImage}
                resizeMode={FastImage.resizeMode.stretch}
                source={imageMap[img]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.viewRow2}>
          {[
            [this.props.navigation.navigate(Constants.SCREEN_SHARE_INFOR.KEY), 'sonohoka_04.png'],
            [handleRatePress, 'sonohoka_05.png'],
            [this.props.navigation.navigate(Constants.SCREEN_NOTIFICATION_INFO.KEY), 'sonohoka_06.png'],
          ].map(([handler, img], index) => (
            <TouchableOpacity key={index} style={styles.itemRow} onPress={async () => { await playSelectSound(); handler(); }}>
              <FastImage
                style={styles.itemImage}
                resizeMode={FastImage.resizeMode.stretch}
                source={imageMap[img]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {[
          [this.props.navigation.navigate(Constants.SCREEN_TERMS_OF_SERVICE.KEY), styles.itemImageInfo1, 'sonohoka_08.png'],
          [this.props.navigation.navigate(Constants.SCREEN_PRIVACY_POLICY.KEY), styles.itemImageInfo2, 'sonohoka_09.png'],
          [handleSendMail, styles.itemImageInfo3, 'sonohoka_10.png'],
          [this.props.navigation.navigate(Constants.SCREEN_COMPANY_PROFILE.KEY), styles.itemImageInfo4, 'sonohoka_11.png'],
          [this.props.navigation.navigate(Constants.SCREEN_VERSION.KEY), styles.itemImageInfo5, 'sonohoka_12.png'],
          [this.props.navigation.navigate(Constants.SCREEN_SOUND.KEY), styles.itemImageInfo6, 'sonohoka_13.png'],
        ].map(([handler, style, img], index) => (
          <React.Fragment key={index}>
            <FastImage
              style={styles.itemHorizontalBar}
              resizeMode={FastImage.resizeMode.contain}
              source={imageMap[img]}
            />
            {renderOptionButton(async () => { await playSelectSound(); handler(); }, imageMap[img], style)}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

export default Settings;
