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
  TouchableOpacity,
  BackHandler,
  I18nManager,
  Dimensions,
  AsyncStorage,
  ActivityIndicator,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Constants, {BASE_URL, API_GET_HisRd} from '../../constants/Constants';
import Navigation from '../navigation/Navigation';
import {moderateScale} from 'react-native-size-matters';
import Toolbar from '../toolbar/Toolbar';
import {Color} from '../../colors/Colors';
// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better
import HapirinCustomCalendar from '../../commons/components/HapirinCustomCalendar';
import moment from 'moment';
import {getUserInfo} from '../../databases/StorageServices';
import FastImage from 'react-native-fast-image';

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

export default class Calendar extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig();
    this.state = {
      ID: 0,
      date: new Date(),
      previousMonth: new Date().getMonth(),
      nextMonth: new Date().getMonth(),
      time: '',
      selectedStartDate: null,
      dayCharing: [],
      isLoading: true,
      dateInstall: '',
    };
  }

  onDateChange(date) {
    Navigation.gotoCharinHistory({date, ID: this.state.ID});
  }

  componentDidMount() {
    this.getDateInstallApp();

    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.pop();
      return true;
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
    this.renDateMonth(
      this.state.date.getFullYear(),
      this.state.date.getMonth() + 1,
    );
    setTimeout(() => {
      getUserInfo()
        .then(userInfo => {
          this.setState({
            ID: userInfo[0].ID,
          });
          this.getHisRd(userInfo[0].ID);
        })
        .catch(error => {
          console.error(error);
        });
    }, 300);
  }

  async getDateInstallApp() {
    try {
      const key1 = await AsyncStorage.getItem('dateInstall');

      if (key1 !== null) {
        // We have data!!
        this.setState({dateInstall: key1}, () => {
          console.log('dateInstall => ', this.state.dateInstall);
        });
      }
    } catch (error) {
      console.log('Error retrieving data' + error);
    }
  }

  UNSAFE_componentWillMount() {}

  componentWillUnmount() {
    // unregister hardware back button listener
    BackHandler.removeEventListener('hardwareBackPress');
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
  }

  onClickBackButton = () => {
    Actions.pop();
  };

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };

  getHisRd(name) {
    fetch(BASE_URL + API_GET_HisRd, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='
        .concat(name)
        .concat('&JobDate=')
        .concat(this.state.dateInstall),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        for (let data of responseJson) {
          this.state.dayCharing.push(data.JobDate.slice(0, 8));
        }
        this.setState({
          isLoading: false,
        });
      })
      .catch(error => {
        this.setState({
          isLoading: false,
        });
      });
  }

  renDateMonth(year, month) {
    var yearText = '年';
    var monthText = '月';
    if (month === 12) {
      this.setState({
        nextMonth: 1 + monthText,
      });
    } else {
      this.setState({
        nextMonth: month + 1 + monthText,
      });
    }
    if (month === 1) {
      this.setState({
        previousMonth: 12 + monthText,
      });
    } else {
      this.setState({
        previousMonth: month - 1 + monthText,
      });
    }
    this.setState({
      time: year
        .toString()
        .concat(yearText)
        .concat(month)
        .concat(monthText),
    });
  }

  renNextDay(date) {
    date.setDate(32);
  }

  renPreviousDay(date) {
    date.setDate(-1);
  }

  renNextState() {
    this.renNextDay(this.state.date);
    this.renDateMonth(
      this.state.date.getFullYear(),
      this.state.date.getMonth() + 1,
    );
  }

  renPreviousState() {
    this.renPreviousDay(this.state.date);
    this.renDateMonth(
      this.state.date.getFullYear(),
      this.state.date.getMonth() + 1,
    );
  }

  renderActivityIndicator() {
    if (this.state.isLoading) {
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
  }

  render() {
    // if (!this.state.isLoading) {
    return (
      <View style={styles.parent}>
        <Toolbar
          leftIcon="home"
          nameRightButton="none"
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          title={Constants.SCREEN_CALENDAR.TITLE}
        />
        <View style={styles.content}>
          <View style={styles.note}>
            <Text style={styles.textbutton}>{this.state.previousMonth}</Text>
            <TouchableOpacity
              onPress={() => this.renPreviousState()}
              style={styles.touchableopacitystyle}>
              <FastImage
                style={styles.imagebuttonstyle}
                source={require('../../resources/images/f-1-1.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
            <Text style={styles.textdatetime}>{this.state.time}</Text>
            <TouchableOpacity
              onPress={() => this.renNextState()}
              style={styles.touchableopacitystyle}>
              <FastImage
                style={styles.imagebuttonstyle}
                source={require('../../resources/images/f-1-2.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
            <Text style={styles.textbutton}>{this.state.nextMonth}</Text>
          </View>
          <View style={styles.calendar}>
            <HapirinCustomCalendar
              showDayHeading={true}
              dayCharing={this.state.dayCharing}
              dayHeadings={['日', '月', '火', '水', '木', '金', '土']}
              onDateSelect={this.onDateChange.bind(this)}
              startDate={moment(new Date(this.state.date).toISOString())
                .startOf('month')
                .format('YYYY-MM-DD')}
              selectedDate={moment(new Date().toISOString()).format(
                'YYYY-MM-DD',
              )}
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
              sunDayStyle={{backgroundColor: '#FEE4D9', color: 'black'}}
              satDayStyle={{backgroundColor: '#E3F0E0', color: 'black'}}
              selectedDayStyle={{backgroundColor: '#FEF1BD', color: 'black'}}
            />
          </View>
        </View>
        {this.renderActivityIndicator()}
      </View>
    );
    // }else return null
  }
}

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 8,
    flexDirection: 'column',
    backgroundColor: Color.backgroundSetting,
  },
  note: {
    justifyContent: 'center',
    flexDirection: 'row',
    // width: '100%',
    height: '8%',
    alignContent: 'center',
    alignItems: 'center',
  },
  textbutton: {
    flex: 3,
    color: 'black',
    fontSize: moderateScale(13),
    fontFamily: 'HuiFont',
    paddingStart: moderateScale(10),
    textAlign: 'center',
  },
  textdatetime: {
    width: '50%',
    color: 'black',
    fontSize: moderateScale(18),
    fontFamily: 'HuiFont',
    flex: 7,
    textAlign: 'center',
  },
  touchableopacitystyle: {
    flex: 1,
    width: '5%',
    alignItems: 'center',
  },
  imagebuttonstyle: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  styleImageBlank: {
    width: '100%',
    height: '100%',
  },
  calendar: {
    height: moderateScale(500),
    flexDirection: 'column',
  },
  viewIndicator: {
    backgroundColor: Color.background_transparent,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  activityIndicatorStyle: {
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
    color: Constants.BACKGROUND_COLOR_TOOLBAR,
  },
});
