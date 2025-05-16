/* eslint-disable radix */
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
  Text,
  AsyncStorage,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  StatusBar,
  I18nManager,
  Platform,
  AppState,
  ActivityIndicator,
  NativeModules,
} from 'react-native';

import Constants, {
  BASE_URL,
  API_GET_UcntLd,
  API_GET_HtpRd,
  API_GET_HdateRd,
  API_GET_HDATE_UP,
  isIpX,
  ratio,
  widthScreen,
  heightScreen,
} from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
// call file color
import {Color} from '../../colors/Colors';
//use scale size for screen different
import {scale, moderateScale} from 'react-native-size-matters';
import {getUserInfo} from '../../databases/StorageServices';
import SoundService from '../../soundService/SoundService';
import moment from 'moment';
import NCMBInitialization from '../../../NCMBInitialization';
import scales from '../../styles/scales';
import TextFont from '../../commons/components/TextFont';
import FastImage from '@d11/react-native-fast-image';
const {TaskManager} = NativeModules;
import NotificationHandle from '../../../Notification';

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

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    //        this.hpCnt = 0;
    setI18nConfig(); //set initial config
    this.state = {
      curDate: moment().format('YYYYMMDD'),
      isLoading: true,
      userInfo: '',
      nameUser: '',
      distance1: '',
      distance2: '',
      textGreeting: '',
      // ListUcntLd: [],
      arr_HID: [],
      hpCnt: 0,
      hpNext: moment(moment())
        .add(1, 'days')
        .format('YYYYMMDD'),
      combo: 0,
      nowF: '0',
      nowDate: '',
      fbDay: '000000000',
      hm_ID: [],
      hm_SetTime: [],
      hm_AddWd: [],
      arr_ID: [],
      arr_SetTime: [],
      arr_AddWd: [],
      // arr api UcntLd
      arr_LastDate: [],
      arr_Hcnt: [],
      arr_Ccnt: [],
      arr_tTcnt: [],
      arr_tGcnt: [],
      arr_tScnt: [],
      arr_dTcnt: [],
      arr_dGcnt: [],
      arr_dScnt: [],
      refresh: undefined,
      Hpcnt: 0,
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this.getFbDay();
    getUserInfo()
      .then(userInfo => {
        if (this.state.arr_LastDate.length === 0) {
          this.setState(
            {
              userInfo: userInfo[0],
            },
            () => {
              this.getUcntLd();
              if (this.state.userInfo.Mrs === 'ちゃん') {
                this.setState({
                  nameUser: this.state.userInfo.Name.concat('ちゃん'),
                });
              } else if (this.state.userInfo.Mrs === 'くん') {
                this.setState({
                  nameUser: this.state.userInfo.Name.concat('くん'),
                });
              } else {
                this.setState({
                  nameUser: this.state.userInfo.Name,
                });
              }

              if (Platform.OS === 'ios') {
                TaskManager.installPushNotificationData(
                  {
                    id: `${this.state.userInfo.ID}`,
                  },
                  (error, task) => {
                    if (error) {
                      console.log(`err => ${JSON.stringify(error)}`);
                    } else {
                      console.log(`ss => ${JSON.stringify(task)}`);
                    }
                  },
                );
              } else {
                NCMBInitialization.initConfigNCMB(this.state.userInfo.ID);
              }
            },
          );
        }
      })
      .catch(error => {
        console.log(error);
        // Alert.alert(error);
      });

    this.changeGreetingWithTime();

    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (this.props.navigation.isFocused()) {
        BackHandler.exitApp();
        return false;
      }
      this.props.navigation.pop()
      return true;
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.refresh !== this.state.refresh) {
      this.setState({isLoading: true});
      setTimeout(() => {
        this.getFbDay();
        getUserInfo()
          .then(userInfo => {
            this.setState(
              {
                userInfo: userInfo[0],
              },
              () => {
                this.getUcntLd();
                if (this.state.userInfo.Mrs === 'ちゃん') {
                  this.setState({
                    nameUser: this.state.userInfo.Name.concat('ちゃん'),
                  });
                } else if (this.state.userInfo.Mrs === 'くん') {
                  this.setState({
                    nameUser: this.state.userInfo.Name.concat('くん'),
                  });
                } else {
                  this.setState({
                    nameUser: this.state.userInfo.Name,
                  });
                }
              },
            );
          })
          .catch(error => {
            console.log(error);
            // Alert.alert(error);
          });

        this.changeGreetingWithTime();
      }, 500);
    }
  }

  async getFbDay() {
    try {
      const fbDay = await AsyncStorage.getItem('fbDay');
      if (fbDay != null) {
        this.setState(
          {
            fbDay: fbDay,
          },
          () => {
            this.setState(
              {
                nowDate: this.state.fbDay.slice(0, 8),
                nowF: this.state.fbDay.charAt(8),
              },
              () => {},
            );
          },
        );
      }
    } catch (error) {
      console.log('Error retrieving data' + error);
      // Alert.alert(error);
    }
  }

  UNSAFE_componentWillUnMount() {
    // unregister hardware back button listener
    BackHandler.removeEventListener('hardwareBackPress');
    AppState.removeEventListener('change', this._handleAppStateChange);
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
  }

  _handleAppStateChange = currentAppState => {
    if (currentAppState === 'background') {
      this.setState({
        curDate: moment().format('YYYYMMDD'),
      });
    }
    if (currentAppState === 'active') {
      this.setState({
        curDate: moment().format('YYYYMMDD'),
      });
    }
  };

  //step 1
  getUcntLd() {
    fetch(BASE_URL + API_GET_UcntLd, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='.concat(this.state.userInfo.ID),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        // this.setState({
        //   ListUcntLd: responseJson,
        // }

        if (responseJson.length > 0) {
          this.setState(
            {
              arr_LastDate: [],
              arr_Hcnt: [],
              arr_Ccnt: [],
              arr_tTcnt: [],
              arr_tGcnt: [],
              arr_tScnt: [],
              arr_dTcnt: [],
              arr_dGcnt: [],
              arr_dScnt: [],
            },
            () => {
              for (let data of responseJson) {
                this.setState(prevState => ({
                  arr_LastDate: [...prevState.arr_LastDate, data.LastDate],
                  arr_Hcnt: [...prevState.arr_Hcnt, data.Hcnt],
                  arr_Ccnt: [...prevState.arr_Ccnt, data.Ccnt],
                  arr_tTcnt: [...prevState.arr_tTcnt, data.tTcnt],
                  arr_tGcnt: [...prevState.arr_tGcnt, data.tGcnt],
                  arr_tScnt: [...prevState.arr_tScnt, data.tScnt],
                  arr_dTcnt: [...prevState.arr_dTcnt, data.dTcnt],
                  arr_dGcnt: [...prevState.arr_dGcnt, data.dGcnt],
                  arr_dScnt: [...prevState.arr_dScnt, data.dScnt],
                }));
              }
            },
          );
        }
        this.getHtpRd();
      })
      .catch(error => {
        this.setState({isLoading: false});
        console.log(error);
        // Alert.alert(error);
      });
  }

  //step 2
  getHtpRd() {
    fetch(BASE_URL + API_GET_HtpRd, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='.concat(this.state.userInfo.ID),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        let ListHtpRd = responseJson;
        for (let [index, data] of ListHtpRd.entries()) {
          this.setState({
            arr_ID: [...this.state.arr_ID, data.ID],
            arr_SetTime: [...this.state.arr_SetTime, data.SetTime],
            arr_AddWd: [...this.state.arr_AddWd, data.AddWd],
          });
          // data.SetTime = data.SetTime + this.state.hpNext;
          let newArr_SetTime = [...this.state.arr_SetTime];
          newArr_SetTime[index] = this.state.hpNext.concat(data.SetTime);
          this.setState({
            arr_SetTime: newArr_SetTime,
          });
        }
        if (this.state.arr_ID.length === 0) {
          //step 5 in spec
          this.getCombo();
        } else {
          //step 3 in spec
          this.getHdateRd();
        }
      })
      .catch(error => {
        this.setState({isLoading: false});
        console.log(error);
        // Alert.alert(error);
      });
  }

  //step 3
  getHdateRd() {
    fetch(BASE_URL + API_GET_HdateRd, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'HID='
        .concat(this.state.arr_ID[this.state.hpCnt])
        .concat('&Hdate=')
        .concat(this.state.hpNext),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        this.setState({arr_HID: []}, () => {
          if (responseJson.length > 0) {
            for (let data of responseJson) {
              this.setState({
                arr_HID: [...this.state.arr_HID, data.HID],
              });
            }
          }
        });
        //call step 4
        this.getHdateUp();
      })
      .catch(error => {
        this.setState({isLoading: false});
        console.log(error);
        // Alert.alert(error);
      });
  }

  //step 4 in spec
  getHdateUp() {
    if (this.state.arr_HID.length === 0) {
      this.setState(
        {
          hm_ID: [...this.state.hm_ID, this.state.arr_ID[this.state.hpCnt]],
          hm_SetTime: [
            ...this.state.hm_SetTime,
            this.state.arr_SetTime[this.state.hpCnt],
          ],
          hm_AddWd: [
            ...this.state.hm_AddWd,
            this.state.arr_AddWd[this.state.hpCnt],
          ],
        },
        () => {},
      );
      fetch(BASE_URL + API_GET_HDATE_UP, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body: 'HID='
          .concat(this.state.arr_ID[this.state.hpCnt])
          .concat('&Hdate=')
          .concat(this.state.hpNext),
      })
        .then(response => {
          return response.json();
        })
        .then(() => {
          this.setState({
            hpCnt: this.state.hpCnt + 1,
          });
          if (this.state.arr_ID.length > this.state.hpCnt) {
            //step 3
            this.getHdateRd();
          } else {
            //step 5
            this.getCombo();
          }
        })
        .catch(error => {
          this.setState({isLoading: false});
          console.log(error);
          // Alert.alert(error);
        });
    } else {
      this.setState({
        hpCnt: this.state.hpCnt + 1,
      });
      if (this.state.arr_ID.length > this.state.hpCnt) {
        //step 3
        this.getHdateRd();
      } else {
        //step 5
        this.getCombo();
      }
    }
  }

  //step 5 in spec
  getCombo() {
    //TODO: thực hiện đăng ký push(đã thực hiện đăng ký bằng code native)
    if (Platform.OS === 'ios') {
      try {
        for (let i = 0; i < this.state.hm_ID.length; i++) {
          TaskManager.registerPushNotificationHome(
            {
              id: `${this.state.userInfo.ID}`,
              addWd: `${this.state.hm_AddWd[i]}`,
              time: `${this.state.hm_SetTime[i]}`,
            },
            (error, task) => {
              if (error) {
                console.log(`err => ${JSON.stringify(error)}`);
              } else {
                console.log(`ss => ${JSON.stringify(task)}`);
              }
            },
          );
        }
      } catch (error) {
        console.log('err push => ', error);
      }
    } else {
      for (let i = 0; i < this.state.hm_ID.length; i++) {
        NotificationHandle.registerPushHomeAndroid(
          this.state.userInfo.ID,
          this.state.hm_AddWd[i],
          this.state.hm_SetTime[i],
        ).then(response => {
          if (response === 'error') {
            //schedule push notification get error
            console.log(`err => ${JSON.stringify(response)}`);
          } else {
            // schedule push notification success
            console.log(`ss => ${JSON.stringify(response)}`);
          }
        });
      }
    }

    // sau đó tính combo ngày
    let lastDate = this.state.arr_LastDate[0];
    if (moment().format('YYYYMMDD') === lastDate) {
      this.setState({
        combo: parseInt(this.state.arr_Ccnt[0]),
      });
    } else if (
      moment(moment())
        .add(-1, 'days')
        .format('YYYYMMDD') === lastDate
    ) {
      if (
        Math.min(
          parseInt(this.state.arr_dTcnt[0]),
          parseInt(this.state.arr_dGcnt[0]),
          parseInt(this.state.arr_dScnt[0]),
        ) > 0
      ) {
        this.setState({
          combo: parseInt(this.state.arr_Ccnt[0]),
        });
      } else {
        this.setState({
          combo: 0,
        });
      }
    } else {
      this.setState({
        combo: 0,
      });
    }
    if (this.state.arr_Hcnt.length > 0) {
      this.setState({
        Hpcnt: parseInt(this.state.arr_Hcnt[0]),
      });
    } else {
      this.setState({
        Hpcnt: 0,
      });
    }

    this.setState({
      isLoading: false,
    });
  }

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };

  onClickRightButton = () => {
    // alert('BBBB')
  };

  onClickBackButton = () => {
    // alert('BBBB')
  };

  onCharingPress = () => {
    SoundService.loadSoundSel('sel.mp3');
    this.setState({
      hm_ID: [],
      hm_SetTime: [],
      hm_AddWd: [],
    });
    this.props.navigation.navigate(Constants.SCREEN_CHOOSE_HABIT_CHARING.KEY, {
      onBack: this.handleStatusTags.bind(this),
    });
  };

  handleStatusTags(data) {
    this.setState({ refresh: data.refresh });
  }

  onPressHabitType1 = () => {
    SoundService.loadSoundSel('sel.mp3');
    this.props.navigation.navigate(Constants.SCREEN_LIST_HABIT.KEY, {
      ID: this.state.userInfo.ID,
      position: Constants.MODE_HEALTH,
      onBack1: this.handleStatusTags.bind(this),
    });
  };

  onPressHabitType2 = () => {
    SoundService.loadSoundSel('sel.mp3');
    this.props.navigation.navigate(Constants.SCREEN_LIST_HABIT.KEY, {
      ID: this.state.userInfo.ID,
      position: Constants.MODE_LEARNING,
      onBack1: this.handleStatusTags.bind(this),
    });
  };

  onPressHabitType3 = () => {
    SoundService.loadSoundSel('sel.mp3');
    this.props.navigation.navigate(Constants.SCREEN_LIST_HABIT.KEY, {
      ID: this.state.userInfo.ID,
      position: Constants.MODE_CONTRIBUTION,
      onBack1: this.handleStatusTags.bind(this),
    });
  };

  onListPress = () => {
    SoundService.loadSoundSel('sel.mp3');
    this.props.navigation.navigate(Constants.SCREEN_LIST_HABIT.KEY, {
      ID: this.state.userInfo.ID,
      position: Constants.MODE_ALL,
      onBack1: this.handleStatusTags.bind(this),
    });
  };

  onCalendarPress = () => {
    SoundService.loadSoundSel('sel.mp3');
    this.props.navigation.navigate(Constants.SCREEN_CALENDAR.KEY)
    // alert('go to Calendar');
  };

  onSettingPress = () => {
    SoundService.loadSoundSel('sel.mp3');
    this.props.navigation.navigate(Constants.SCREEN_OTHER.KEY, {
      onBack: this.handleStatusTags.bind(this),
    });
  };

  renderBackground() {
    if (this.state.nowDate === this.state.curDate) {
      switch (this.state.nowF) {
        case '1': {
          return (
            <FastImage
              resizeMode={FastImage.resizeMode.stretch}
              style={styles.background}
              source={
                ratio
                  ? require('../../resources/images/18x9/home_bonus_base.png')
                  : require('../../resources/images/16x9/home_bonus_base.png')
              }
            />
          );
        }
        case '2': {
          return (
            <FastImage
              resizeMode={FastImage.resizeMode.stretch}
              style={styles.background}
              source={
                ratio
                  ? require('../../resources/images/18x9/home_fever_base.png')
                  : require('../../resources/images/16x9/home_fever_base.png')
              }
            />
          );
        }
      }
    } else {
      return (
        <FastImage
          resizeMode={FastImage.resizeMode.stretch}
          style={styles.background}
          source={
            ratio
              ? require('../../resources/images/18x9/home_normal_base.png')
              : require('../../resources/images/16x9/home_normal_base.png')
          }
        />
      );
    }
  }

  changeGreetingWithTime() {
    let currentTime = moment().format('HHmm');
    if (
      parseInt(currentTime) >= parseInt('0400') &&
      parseInt(currentTime) <= parseInt('1000')
    ) {
      this.setState({
        textGreeting: translate('txt_good_morning'),
      });
    }
    if (
      parseInt(currentTime) >= parseInt('1001') &&
      parseInt(currentTime) <= parseInt('1759')
    ) {
      this.setState({
        textGreeting: translate('txt_hello'),
      });
    }
    if (
      parseInt(currentTime) >= parseInt('1800') &&
      parseInt(currentTime) <= parseInt('2400')
    ) {
      this.setState({
        textGreeting: translate('txt_good_evening'),
      });
    }
    if (
      parseInt(currentTime) >= parseInt('0000') &&
      parseInt(currentTime) <= parseInt('0359')
    ) {
      this.setState({
        textGreeting: translate('txt_good_evening'),
      });
    }
  }

  render() {
    const {isLoading} = this.state;
    return (
      <View style={styles.container}>
        {this.renderBackground()}
        <View
          style={
            this.state.nowDate !== this.state.curDate
              ? styles.viewName
              : this.state.nowF === '1'
              ? [
                  styles.viewName2,
                  {
                    top: ratio
                      ? Platform.OS === 'android'
                        ? height * 0.12
                        : isIpX
                        ? height * 0.11
                        : height * 0.09
                      : Platform.OS === 'android'
                      ? height * 0.08
                      : isIpX
                      ? height * 0.1
                      : height * 0.085,
                  },
                ]
              : [
                  styles.viewName2,
                  {
                    top: ratio
                      ? Platform.OS === 'android'
                        ? height * 0.115
                        : isIpX
                        ? height * 0.12
                        : height * 0.1
                      : Platform.OS === 'android'
                      ? height * 0.08
                      : isIpX
                      ? height * 0.085
                      : height * 0.08,
                  },
                ]
          }>
          <Text
            style={
              this.state.nowDate !== this.state.curDate
                ? styles.textName
                : styles.textName2
            }
            numberOfLines={1}
            ellipsizeMode="tail">
            {this.state.nameUser}
          </Text>
        </View>
        <TextFont
          content={this.state.textGreeting}
          style={
            this.state.nowDate !== this.state.curDate
              ? styles.textGreetings2
              : this.state.nowF === '1'
              ? [
                  styles.textGreetings,
                  {
                    top: ratio
                      ? Platform.OS === 'android'
                        ? '20%'
                        : isIpX
                        ? '20%'
                        : '16%'
                      : Platform.OS === 'android'
                      ? '16%'
                      : isIpX
                      ? '16%'
                      : '17%',
                  },
                ]
              : [
                  styles.textGreetings,
                  {
                    top: ratio
                      ? Platform.OS === 'android'
                        ? '19.5%'
                        : isIpX
                        ? '20%'
                        : '16%'
                      : Platform.OS === 'android'
                      ? '16%'
                      : isIpX
                      ? '16%'
                      : '16%',
                  },
                ]
          }
        />
        <TouchableOpacity
          style={styles.buttonCharing}
          onPress={this.onCharingPress}>
          <Text style={styles.textCharing}>{translate('charing')}</Text>
        </TouchableOpacity>

        {/* <View style={styles.viewCombo}> */}
        <View
          style={
            this.state.nowDate !== this.state.curDate
              ? styles.viewCountCombo
              : this.state.nowF === '1'
              ? [
                  styles.viewCountCombo2,
                  {
                    paddingTop: ratio
                      ? moderateScale(height / 9)
                      : moderateScale(height / 15),
                  },
                ]
              : [
                  styles.viewCountCombo2,
                  {
                    paddingTop: ratio
                      ? moderateScale(height / 7.5)
                      : moderateScale(height / 14),
                  },
                ]
          }>
          <Text style={styles.textLife}>{this.state.Hpcnt}</Text>
        </View>

        <View
          style={
            this.state.nowDate !== this.state.curDate
              ? styles.viewDayCountCombo
              : this.state.nowF === '1'
              ? [
                  styles.viewDayCountCombo2,
                  {
                    paddingTop: ratio
                      ? moderateScale(height / 10)
                      : moderateScale(height / 16),
                  },
                ]
              : [
                  styles.viewDayCountCombo2,
                  {
                    paddingTop: ratio
                      ? moderateScale(height / 8)
                      : moderateScale(height / 16),
                  },
                ]
          }>
          <Text style={styles.textDayCombo}>{this.state.combo}</Text>
        </View>
        {/* </View> */}

        {/* list button choose habit */}
        <View style={styles.viewTypeHabit}>
          <TouchableOpacity
            style={styles.buttonTypeHabit}
            onPress={this.onPressHabitType1}>
            <Text
              style={
                this.state.nowDate !== this.state.curDate
                  ? styles.textCountCharingType1
                  : this.state.nowF === '1'
                  ? [
                      styles.textCountCharingType12,
                      {
                        paddingBottom: ratio
                          ? Platform.OS === 'ios'
                            ? width > 800 || height > 800
                              ? moderateScale(16)
                              : scales.vertical(9)
                            : moderateScale(35)
                          : Platform.OS === 'ios'
                          ? width > 800 || height > 800
                            ? moderateScale(16)
                            : scales.vertical(5)
                          : moderateScale(15),
                      },
                    ]
                  : [
                      styles.textCountCharingType12,
                      {
                        paddingBottom:
                          Platform.OS === 'ios'
                            ? width > 800 || height > 800
                              ? 0
                              : scales.vertical(5)
                            : moderateScale(15),
                        paddingTop: ratio ? moderateScale(8) : 0,
                      },
                    ]
              }>
              {this.state.arr_tTcnt.length > 0 ? this.state.arr_tTcnt[0] : 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonTypeHabit}
            onPress={this.onPressHabitType2}>
            <Text
              style={
                this.state.nowDate !== this.state.curDate
                  ? styles.textCountCharingType2
                  : this.state.nowF === '1'
                  ? [
                      styles.textCountCharingType22,
                      {
                        paddingBottom: ratio
                          ? Platform.OS === 'ios'
                            ? width > 800 || height > 800
                              ? moderateScale(16)
                              : scales.vertical(9)
                            : moderateScale(35)
                          : Platform.OS === 'ios'
                          ? width > 800 || height > 800
                            ? moderateScale(16)
                            : scales.vertical(5)
                          : moderateScale(15),
                      },
                    ]
                  : [
                      styles.textCountCharingType22,
                      {
                        paddingBottom:
                          Platform.OS === 'ios'
                            ? width > 800 || height > 800
                              ? 0
                              : scales.vertical(5)
                            : moderateScale(15),
                        paddingTop: ratio ? moderateScale(8) : 0,
                      },
                    ]
              }>
              {this.state.arr_tGcnt.length > 0 ? this.state.arr_tGcnt[0] : 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonTypeHabit}
            onPress={this.onPressHabitType3}>
            <Text
              style={
                this.state.nowDate !== this.state.curDate
                  ? styles.textCountCharingType3
                  : this.state.nowF === '1'
                  ? [
                      styles.textCountCharingType32,
                      {
                        paddingBottom: ratio
                          ? Platform.OS === 'ios'
                            ? width > 800 || height > 800
                              ? moderateScale(16)
                              : scales.vertical(9)
                            : moderateScale(35)
                          : Platform.OS === 'ios'
                          ? width > 800 || height > 800
                            ? moderateScale(16)
                            : scales.vertical(5)
                          : moderateScale(19),
                      },
                    ]
                  : [
                      styles.textCountCharingType32,
                      {
                        paddingBottom:
                          Platform.OS === 'ios'
                            ? width > 800 || height > 800
                              ? 0
                              : scales.vertical(5)
                            : moderateScale(15),
                        paddingTop: ratio ? moderateScale(8) : 0,
                      },
                    ]
              }>
              {this.state.arr_tScnt.length > 0 ? this.state.arr_tScnt[0] : 0}
            </Text>
          </TouchableOpacity>
        </View>

        {/* list button bottom */}
        <View style={styles.viewBottom}>
          <TouchableOpacity
            style={styles.buttonBottom}
            onPress={this.onListPress}
          />
          <TouchableOpacity
            style={styles.buttonBottom}
            onPress={this.onCalendarPress}
          />
          <TouchableOpacity
            style={styles.buttonBottom}
            onPress={this.onSettingPress}
          />
        </View>
        {isLoading && (
          <ActivityIndicator
            style={styles.loading}
            color={Constants.BACKGROUND_COLOR_TOOLBAR}
            size="large"
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: width,
    height: Platform.OS === 'ios' ? height : height - StatusBar.currentHeight,
  },
  buttonCharing: {
    position: 'absolute',
    backgroundColor: Color.red,
    paddingVertical:
      Platform.OS === 'android' ? scales.vertical(12) : scales.vertical(15),
    paddingHorizontal: scales.horizontal(35),
    top: ratio
      ? Platform.OS === 'android'
        ? height * 0.6
        : Platform.OS === 'ios' && (width > 800 || height > 800)
        ? height * 0.64
        : height * 0.6
      : Platform.OS === 'android'
      ? height * 0.58
      : Platform.OS === 'ios' && (width > 800 || height > 800)
      ? height * 0.62
      : height * 0.61,
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',
  },
  textCharing: {
    color: 'white',
    fontSize: moderateScale(25),
    textAlign: 'center',
    fontWeight: 'normal',
    fontFamily: 'HuiFont',
  },
  viewName: {
    flex: 1,
    position: 'absolute',
    top: ratio ? height * 0.19 : height * 0.15,
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',
  },
  viewName2: {
    flex: 1,
    position: 'absolute',
    // top:
    //   Platform.OS === 'android'
    //     ? height * 0.095
    //     : isIpX
    //     ? height * 0.085
    //     : height * 0.095,
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',
  },
  textName: {
    color: Color.white,
    padding: moderateScale(10),
    marginTop:
      Platform.OS === 'ios'
        ? width > 800 || height > 800
          ? moderateScale(25)
          : scales.vertical(15)
        : scales.vertical(10),
    fontSize: moderateScale(30),
    textAlign: 'center',
    fontFamily: 'HuiFont',
  },
  textName2: {
    color: Color.white,
    marginBottom: Platform.OS === 'android' ? moderateScale(15) : null,
    marginTop:
      Platform.OS === 'ios'
        ? width > 800 || height > 800
          ? moderateScale(25)
          : scales.vertical(10)
        : null,
    fontSize: moderateScale(30),
    textAlign: 'center',
    fontFamily: 'HuiFont',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBottom: {
    flex: 1,
    bottom: 0,
    width: width,
    position: 'absolute',
    flexDirection: 'row',
  },
  buttonBottom: {
    width: width / 3,
    height: height * 0.1165,
  },
  viewTypeHabit: {
    flex: 1,
    width: width,
    alignContent: 'center',
    position: 'absolute',
    flexDirection: 'row',
  },
  buttonTypeHabit: {
    width: width / 3.29,
    height: height * 0.107,
    marginStart: width / 49,
    top: height * 0.301,
    borderRadius: 5,
    justifyContent: 'center',
  },
  textCountCharingType1: {
    fontSize: moderateScale(35),
    fontFamily: 'HuiFont',
    paddingBottom:
      Platform.OS === 'ios'
        ? width > 800 || height > 800
          ? moderateScale(5)
          : scales.vertical(15)
        : moderateScale(22),
    color: Color.orange,
    textAlign: 'center',
  },
  textCountCharingType12: {
    fontSize: moderateScale(35),
    fontFamily: 'HuiFont',
    // paddingBottom:
    //   Platform.OS === 'ios'
    //     ? width > 800 || height > 800
    //       ? moderateScale(6)
    //       : scales.verticalScale(9)
    //     : moderateScale(20),
    color: Color.orange,
    textAlign: 'center',
  },
  textCountCharingType2: {
    fontSize: moderateScale(35),
    paddingBottom:
      Platform.OS === 'ios'
        ? width > 800 || height > 800
          ? moderateScale(5)
          : scales.vertical(15)
        : moderateScale(22),
    fontFamily: 'HuiFont',
    color: Color.green,
    textAlign: 'center',
  },
  textCountCharingType22: {
    fontSize: moderateScale(35),
    // paddingBottom:
    //   Platform.OS === 'ios'
    //     ? width > 800 || height > 800
    //       ? moderateScale(6)
    //       : scales.verticalScale(9)
    //     : moderateScale(20),
    fontFamily: 'HuiFont',
    color: Color.green,
    textAlign: 'center',
  },
  textCountCharingType3: {
    fontSize: moderateScale(35),
    paddingBottom:
      Platform.OS === 'ios'
        ? width > 800 || height > 800
          ? moderateScale(5)
          : scales.vertical(15)
        : moderateScale(22),
    fontFamily: 'HuiFont',
    color: Color.violet,
    textAlign: 'center',
  },
  textCountCharingType32: {
    fontSize: moderateScale(35),
    // paddingBottom:
    //   Platform.OS === 'ios'
    //     ? width > 800 || height > 800
    //       ? moderateScale(6)
    //       : scales.verticalScale(9)
    //     : moderateScale(20),
    fontFamily: 'HuiFont',
    color: Color.violet,
    textAlign: 'center',
  },
  viewCountCombo: {
    position: 'absolute',
    alignSelf: 'flex-start',
    paddingTop: ratio ? moderateScale(height / 14) : 0,
    width: width / 3.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewCountCombo2: {
    position: 'absolute',
    alignSelf: 'flex-start',
    paddingStart: scales.horizontal(35),
    // paddingTop: moderateScale(height / 12),
  },
  viewDayCountCombo: {
    position: 'absolute',
    alignSelf: 'flex-end',
    paddingTop: ratio ? moderateScale(height / 17) : 0,
    paddingBottom: ratio ? 0 : moderateScale(height / 70),
    width: width / 3.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDayCountCombo2: {
    position: 'absolute',
    alignSelf: 'flex-end',
    paddingEnd: scales.horizontal(45),
    // paddingTop: moderateScale(height / 12),
  },
  textLife: {
    color: Color.brown,
    fontFamily: 'HuiFont',
    fontSize: moderateScale(35),
    textAlign: 'center',
  },
  textDayCombo: {
    color: Color.sapphire,
    fontFamily: 'HuiFont',
    fontSize: moderateScale(35),
    textAlign: 'center',
  },
  loading: {
    height: Platform.OS === 'ios' ? height : height - StatusBar.currentHeight,
    width: '100%',
    position: 'absolute',
    backgroundColor: Color.backgroundTransparent,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  textGreetings: {
    position: 'absolute',
    // top: Platform.OS === 'android' ? '15%' : isIpX ? '16%' : '16%',
    fontSize: moderateScale(28),
    color: Color.white,
    alignSelf: 'center',
    width: '100%',
    height: moderateScale(35),
    textAlign: 'center',
  },
  textGreetings2: {
    position: 'absolute',
    top: ratio ? '29%' : '24.5%',
    fontSize: moderateScale(28),
    color: Color.white,
    alignSelf: 'center',
    width: '100%',
    height: moderateScale(35),
    textAlign: 'center',
  },
});
