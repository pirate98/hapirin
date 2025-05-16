import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  I18nManager,
  Dimensions,
  Platform,
  StatusBar,
  AppState,
  KeyboardAvoidingView
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';
import Constants from '../../constants/Constants';
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize';
import {Color} from '../../colors/Colors';
import {moderateScale} from 'react-native-size-matters';
import ChooseHabitCharing from './ChooseHabitCharing';
import CreateHabitOnlyToday from './CreateHabitOnlyToday';

const translationGetters = {
  jp: () => require('../../languages/japanese.json'),
};

const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

const setI18nConfig = () => {
  const fallback = { languageTag: 'jp', isRTL: false };
  const {languageTag, isRTL} =
    RNLocalize.findBestLanguageTag(Object.keys(translationGetters)) || fallback;

  translate.cache.clear();
  I18nManager.forceRTL(isRTL);
  i18n.translations = { [languageTag]: translationGetters[languageTag]() };
  i18n.locale = languageTag;
};

const { height: heightScreen } = Dimensions.get('window');

const Charing = ({ navigation }) => {
  const [mode, setMode] = useState(0);
  const [locale, setLocale] = useState(RNLocalize.getLocales()[0]?.languageTag)

  const handleLocalizationChange = useCallback(() => {
    setI18nConfig();
  }, []);

  useEffect(() => {
    setI18nConfig();
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
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      subscription.remove()
      backHandler.remove();
    };
  }, [handleLocalizationChange, navigation, locale]);

  const renderSwitchView = () => {
    return mode === 0 ? <ChooseHabitCharing /> : <CreateHabitOnlyToday />;
  };

  const getButtonStyle = (buttonMode, currentMode) => ({
    backgroundColor: buttonMode === currentMode
      ? Color.colorButtonCharingFocus
      : Color.colorButtonNone,
  });

  return (
    <KeyboardAvoidingView>
      <View style={styles.parent}>
        <Toolbar
          leftIcon="home"
          nameRightButton="none"
          style={styles.toolbar}
          onClickBackButton={() => navigation.goBack()}
          onClickRightButton={() => {}}
          title={Constants.SCREEN_CHARING.TITLE}
        />
        <View style={styles.content}>
          <View style={styles.viewButton}>
            <TouchableOpacity
              style={[styles.itemButton1, getButtonStyle(0, mode)]}
              onPress={() => setMode(0)}
            >
              <Text style={styles.textButton}>
                {translate('charing_learning')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.itemButton2, getButtonStyle(1, mode)]}
              onPress={() => setMode(1)}
            >
              <Text style={styles.textButton}>
                {translate('charing_only_today')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.viewContent}>
            {renderSwitchView()}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    height:
      Platform.OS === 'ios'
        ? heightScreen
        : heightScreen - (StatusBar.currentHeight ?? 0),
    flexDirection: 'column',
    backgroundColor: Color.backgroundCharing,
  },
  toolbar: {
    flex: 2,
  },
  content: {
    flex: 8,
    flexDirection: 'column',
  },
  viewButton: {
    width: '100%',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  viewContent: {
    flex: 9,
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: moderateScale(25),
  },
  itemButton1: {
    width: '35%',
    marginVertical: moderateScale(15),
    height: moderateScale(45),
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    justifyContent: 'center',
  },
  itemButton2: {
    width: '35%',
    marginVertical: moderateScale(15),
    height: moderateScale(45),
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
  },
  textButton: {
    color: Color.white,
    fontSize: moderateScale(22),
    fontFamily: 'HuiFont',
    alignSelf: 'center',
    textAlign: 'center',
  },
});

export default Charing;
