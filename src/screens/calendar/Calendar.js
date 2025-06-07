import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  I18nManager,
  ActivityIndicator,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Constants, {BASE_URL, API_GET_HisRd} from '../../constants/Constants';
import {moderateScale} from 'react-native-size-matters';
import Toolbar from '../toolbar/Toolbar';
import {Color} from '../../colors/Colors';
// multi languages
import * as RNLocalize from 'react-native-localize';
import {I18n} from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better
import HapirinCustomCalendar from '../../commons/components/HapirinCustomCalendar';
import moment from 'moment';
import {getUserInfo} from '../../databases/StorageServices';
import FastImage from '@d11/react-native-fast-image';

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
  const fallback = {languageTag: 'jp', isRTL: false};
  const {languageTag, isRTL} =
    RNLocalize.findBestLanguageTag(Object.keys(translationGetters)) || fallback;

  translate.cache.clear;
  I18nManager.forceRTL(isRTL);
  i18n.translations = { [languageTag]: translationGetters[languageTag]() };
  i18n.locale = languageTag;
};

const Calendar = () => {
  const navigation = useNavigation();

  const [ID, setID] = useState(0);
  const [date, setDate] = useState(new Date());
  const [previousMonth, setPreviousMonth] = useState(new Date().getMonth().toString());
  const [nextMonth, setNextMonth] = useState(new Date().getMonth().toString());
  const [time, setTime] = useState('');
  const [dayCharing, setDayCharing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateInstall, setDateInstall] = useState('');
  const [locale, setLocale] = useState(RNLocalize.getLocales()[0]?.languageTag);
  
  useEffect(() => {
    setI18nConfig();
    getDateInstallApp();
    const now = new Date();
    renDateMonth(now.getFullYear(), now.getMonth() + 1);
    getUserInfo().then(userInfo => {
      const userId = userInfo[0]?.ID;
      setID(userId);
      getHisRd(userId);
    });

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
    }
  }, [locale]);

  const getDateInstallApp = async () => {
    try {
      const key1 = await AsyncStorage.getItem('dateInstall');
      if (key1 !== null) {
        setDateInstall(key1);
      }
    } catch (error) {
      console.log('Error retrieving data' + error);
    }
  };

  const getHisRd = (name) => {
    fetch(BASE_URL + API_GET_HisRd, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: `Name=${name}&JobDate=${dateInstall}`,
    })
      .then(response => response.json())
      .then(responseJson => {
        const updatedDays = responseJson.map((data) =>
          data.JobDate.slice(0, 8),
        );
        setDayCharing(updatedDays);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const renDateMonth = (year, month) => {
    const yearText = '年';
    const monthText = '月';

    setNextMonth(month === 12 ? 1 + monthText : month + 1 + monthText);
    setPreviousMonth(month === 1 ? 12 + monthText : month - 1 + monthText);
    setTime(`${year}${yearText}${month}${monthText}`);
  };

  const renNextState = () => {
    const next = new Date(date);
    next.setDate(32);
    setDate(next);
    renDateMonth(next.getFullYear(), next.getMonth() + 1);
  };

  const renPreviousState = () => {
    const prev = new Date(date);
    prev.setDate(-1);
    setDate(prev);
    renDateMonth(prev.getFullYear(), prev.getMonth() + 1);
  };

  const onDateChange = (selectedDate) => {
    navigation.navigate(Constants.SCREEN_CHARIN_HISTORY.KEY, { date: selectedDate, ID });
  };

  const renderActivityIndicator = () => {
    if (isLoading) {
      return (
        <View style={styles.viewIndicator}>
          <ActivityIndicator
            size="large"
            color={Constants.BACKGROUND_COLOR_TOOLBAR}
            style={styles.activityIndicatorStyle}
          />
        </View>
      );
    }
    return null;
  };

  const onClickRightButton = () => { }

  return (
    <View style={styles.parent}>
      <Toolbar
        leftIcon="home"
        nameRightButton="none"
        onClickBackButton={() => navigation.goBack()}
        title={Constants.SCREEN_CALENDAR.TITLE}
        onClickRightButton={onClickRightButton}
      />
      <View style={styles.content}>
        <View style={styles.note}>
          <Text style={styles.textbutton}>{previousMonth}</Text>
          <TouchableOpacity onPress={renPreviousState} style={styles.touchableopacitystyle}>
            <FastImage
              style={styles.imagebuttonstyle}
              source={require('../../resources/images/f-1-1.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
          <Text style={styles.textdatetime}>{time}</Text>
          <TouchableOpacity onPress={renNextState} style={styles.touchableopacitystyle}>
            <FastImage
              style={styles.imagebuttonstyle}
              source={require('../../resources/images/f-1-2.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
          <Text style={styles.textbutton}>{nextMonth}</Text>
        </View>
        <View style={styles.calendar}>
          <HapirinCustomCalendar
            showDayHeading
            dayCharing={dayCharing}
            dayHeadings={['日', '月', '火', '水', '木', '金', '土']}
            onDateSelect={onDateChange}
            startDate={moment(date).startOf('month').format('YYYY-MM-DD')}
            selectedDate={moment(new Date()).format('YYYY-MM-DD')}
            numberOfDaysToShow={42}
            enabledDaysOfTheWeek={['日', '月', '火', '水', '木', '金', '土']}
            isoWeek={false}
            disablePreviousDays={false}
            disableToday={false}
            dayStyle={{
              textAlign: 'center',
              lineHeight: moderateScale(73),
              height: moderateScale(73),
            }}
            headingStyle={{
              backgroundColor: '#FCE36C',
              lineHeight: moderateScale(30),
              height: moderateScale(30),
              color: 'black',
              fontFamily: 'HuiFont',
            }}
            sunDayheadingStyle={{
              backgroundColor: '#FEBDBC',
              lineHeight: moderateScale(30),
              height: moderateScale(30),
              color: 'black',
              fontFamily: 'HuiFont',
            }}
            satDayheadingStyle={{
              backgroundColor: '#ADE2D6',
              lineHeight: moderateScale(30),
              height: moderateScale(30),
              color: 'black',
              fontFamily: 'HuiFont',
            }}
            activeDayStyle={{
              backgroundColor: '#FEF1BD',
              color: 'black',
              fontFamily: 'HuiFont',
            }}
            sunDayStyle={{ backgroundColor: '#FEE4D9', color: 'black' }}
            satDayStyle={{ backgroundColor: '#E3F0E0', color: 'black' }}
            selectedDayStyle={{ backgroundColor: '#FEF1BD', color: 'black' }}
          />
        </View>
      </View>
      {renderActivityIndicator()}
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 8,
    backgroundColor: Color.backgroundSetting,
  },
  note: {
    justifyContent: 'center',
    flexDirection: 'row',
    height: '8%',
    alignItems: 'center',
  },
  textbutton: {
    flex: 3,
    color: 'black',
    fontSize: moderateScale(13),
    fontFamily: 'HuiFont',
    textAlign: 'center',
  },
  textdatetime: {
    color: 'black',
    fontSize: moderateScale(18),
    fontFamily: 'HuiFont',
    flex: 7,
    textAlign: 'center',
  },
  touchableopacitystyle: {
    flex: 1,
    alignItems: 'center',
  },
  imagebuttonstyle: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  calendar: {
    height: moderateScale(500),
    flexDirection: 'column',
  },
  viewIndicator: {
    backgroundColor: Color.background_transparent,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  activityIndicatorStyle: {
    alignSelf: 'center',
    top: '50%',
  },
});
