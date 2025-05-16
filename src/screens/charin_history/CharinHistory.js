import React, { useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  I18nManager,
  FlatList,
  ActivityIndicator,
  AppState,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize';

import Constants, {
  API_LIST_CHARIN_HISTORY,
  BASE_URL,
} from '../../constants/Constants';
import Toolbar from '../toolbar/Toolbar';
import {Color} from '../../colors/Colors';
import FastImage from '@d11/react-native-fast-image';

// Localization setup
const translationGetters = {
  jp: () => require('../../languages/japanese.json'),
};

const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

const setI18nConfig = () => {
  const fallback = {languageTag: 'jp', isRTL: false};
  const {languageTag, isRTL} =
    RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    fallback;

  translate.cache.clear();
  I18nManager.forceRTL(isRTL);
  i18n.translations = {[languageTag]: translationGetters[languageTag]()};
  i18n.locale = languageTag;
};

const LIST_IMG_NM = [
  require('../../resources/images/1_1_9.png'),
  require('../../resources/images/1_1_10.png'),
  require('../../resources/images/1_1_11.png'),
];

const POSITION_CHARIN_HISTORY = 5;

const CharinHistory = ({navigation, route}) => {
  const { ID, date} = route.params;
  const navigation = useNavigation();
  const [locale, setLocale] = useState(RNLocalize.getLocales()[0]?.languageTag);

  const [time, setTime] = useState('');
  const [charinDate, setCharinDate] = useState(new Date(date));
  const [listCharin, setListCharin] = useState([]);
  const [idItem, setIdItem] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setI18nConfig();
    updateDateString(charinDate.getDate(), charinDate.getMonth() + 1);
    fetchListCharin(charinDate);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
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
  }, [locale]);

  const updateDateString = (day, month) => {
    const timeText = `${month}月${day}日`;
    setTime(timeText);
  };

  const formatDate = (d) => {
    const dateObj = new Date(d);
    const year = dateObj.getFullYear();
    const month = `${dateObj.getMonth() + 1}`.padStart(2, '0');
    const day = `${dateObj.getDate()}`.padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const fetchListCharin = async (dateObj) => {
    const formattedDate = formatDate(dateObj);
    try {
      const response = await fetch(`${BASE_URL}${API_LIST_CHARIN_HISTORY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `Name=${ID}&FromD=${formattedDate}000000&ToD=${formattedDate}999999`,
      });
      const data = await response.json();
      setListCharin(data);
    } catch (error) {
      console.error('Fetch Error: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getImagePath = (item) => LIST_IMG_NM[item.SelJob];

  const onPreviousDay = () => {
    const newDate = new Date(charinDate);
    newDate.setDate(newDate.getDate() - 1);
    setCharinDate(newDate);
    updateDateString(newDate.getDate(), newDate.getMonth() + 1);
    fetchListCharin(newDate);
  };

  const onNextDay = () => {
    const newDate = new Date(charinDate);
    newDate.setDate(newDate.getDate() + 1);
    setCharinDate(newDate);
    updateDateString(newDate.getDate(), newDate.getMonth() + 1);
    fetchListCharin(newDate);
  };

  const renderList = () => {
    if (listCharin.length > 0) {
      return (
        <FlatList
          data={listCharin}
          keyExtractor={(item) => item.ID}
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={styles.listItem}
              activeOpacity={1}
              onPress={() => setIdItem(index)}>
              <View style={styles.viewItem}>
                <FastImage
                  style={styles.itemImage}
                  source={getImagePath(item)}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.contentItem} numberOfLines={1}>
                  {item.AddWd}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      );
    } else {
      return (
        <View style={styles.parentblanklist}>
          <FastImage
            style={styles.styleImageBlank}
            source={require('../../resources/images/3_3_1.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      );
    }
  }
  return (
    <View style={styles.parent}>
      <Toolbar
        leftIcon="back"
        nameRightButton="none"
        style={styles.toolbar}
        onClickBackButton={() => navigation.goBack()}
        title={Constants.SCREEN_CHARIN_HISTORY.TITLE}
      />
      <View style={styles.content}>
        <View style={styles.note}>
          <TouchableOpacity
            style={styles.touchableopacitystyle}
            onPress={onPreviousDay}>
            <Text style={styles.textbutton}>前の日</Text>
            <FastImage
              style={styles.imagebuttonstyle}
              source={require('../../resources/images/f-1-1.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
          <Text style={styles.textdatetime}>{time}</Text>
          <TouchableOpacity
            style={styles.touchableopacitystyle}
            onPress={onNextDay}>
            <FastImage
              style={styles.imagebuttonstyle}
              source={require('../../resources/images/f-1-2.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={styles.textbutton}>次の日</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.stylecontentlist}>{renderList()}</View>
      </View>
      {isLoading && (
        <View style={styles.renderActivityIndicator}>
          <ActivityIndicator
            size="large"
            color={Color.cl_loading}
            style={styles.activityIndicatorStyle}
          />
        </View>
      )}
    </View>
  );
};

export default CharinHistory;
