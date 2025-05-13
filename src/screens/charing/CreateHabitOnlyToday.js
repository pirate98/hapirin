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
  TextInput,
  TouchableOpacity,
  BackHandler,
  I18nManager,
  Dimensions,
  Alert,
  StatusBar,
  AsyncStorage,
  AppState,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';
import {Actions} from 'react-native-router-flux';
import Constants, {
  BASE_URL,
  API_CHARING_HABIT_TODAY,
  API_CHARING_HABIT_LAST_DATE,
  API_CHARING_HABIT_UCNTRD,
  API_CHARING_HABIT_UCNTZUP,
  API_CHARING_HABIT_UCNTUP,
  regexEmoji,
  regexVietnameseChar,
  ratio,
} from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {Color} from '../../colors/Colors';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';
import Navigation from '../navigation/Navigation';
import moment from 'moment';
import SoundService from '../../soundService/SoundService';
import scales from '../../styles/scales';
import FastImage from '@d11/react-native-fast-image';
import TouchableDebounce from '../../commons/components/TouchableDebounce';

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

const widthScreen = Dimensions.get('window').width; //full width
const heightScreen = Dimensions.get('window').height; //full height
const isIpX =
  Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800);

export default class CreatHabitOnlyToday extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig(); //set initial config

    this.audioCombo1 = undefined;
    this.audioCombo2 = undefined;
    this.pressMode = false;

    const {IdUser} = this.props;
    this.state = {
      todayAct: '', // title habit
      modeHabit: 0, //today_Sel
      decision: false,
      charingMode: false,
      textRandom: '',
      IdUser: IdUser,
      comboImage1: false,
      comboImage2: false,
      comboImage3: false,
      //data from api UcntRd
      dTcnt: 0,
      dGcnt: 0,
      dScnt: 0,
      Fcnt: 0,
      Ccnt: 0,
      DelFg: 0,
      Gcnt: 0,
      Hcnt: 0,
      ID: 0,
      LastDate: '',
      Name: 0,
      Scnt: 0,
      Tcnt: 0,
      tGcnt: 0,
      tScnt: 0,
      tTcnt: 0,
      isLoading: false,
      isSuccess: false,
      sTcnt: 0,
      sGcnt: 0,
      sScnt: 0,
      DspCnt: 0,
      curDate: moment().format('YYYYMMDD'),
    };
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      // Actions.pop();
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);

    this.audioCombo1 = await SoundService.loadSoundCombo('combox1.mp3');
    this.audioCombo2 = await SoundService.loadSoundCombo('combo_x2.mp3');
    // audioCharin = await SoundService.loadSoundSel('charin.mp3');
  }

  componentWillUnmount() {
    // unregister hardware back button listener
    BackHandler.removeEventListener('hardwareBackPress');
    AppState.removeEventListener('change', this._handleAppStateChange);
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
  }

  _handleAppStateChange = currentAppState => {
    if (currentAppState == 'background') {
      this.setState({
        curDate: moment().format('YYYYMMDD'),
      });
    }
    if (currentAppState == 'active') {
      this.setState({
        curDate: moment().format('YYYYMMDD'),
      });
    }
  };

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };

  onClickBackButton = () => {
    Actions.pop();
  };

  // random text with mode when click mode
  randomText() {
    switch (this.state.modeHabit) {
      case Constants.MODE_HEALTH: {
        this.setState({
          textRandom: Constants.arr_Health[0],
        });
        Constants.arr_Health.sort(() => 0.5 - Math.random());
        var pair = '';
        if (Constants.arr_Health.length >= 1) {
          pair = Constants.arr_Health.pop();
          Constants.arr_Health.push(pair);
        }
        this.setState({
          textRandom: pair,
        });
        //call api hisup
        this.getDataApiHisUp();
        break;
      }
      case Constants.MODE_LEARNING: {
        this.setState({
          textRandom: Constants.arr_Study[0],
        });
        Constants.arr_Study.sort(() => 0.5 - Math.random());
        var pair = '';
        if (Constants.arr_Study.length >= 1) {
          pair = Constants.arr_Study.pop();
          Constants.arr_Study.push(pair);
        }
        this.setState({
          textRandom: pair,
        });
        //call api hisup
        this.getDataApiHisUp();
        break;
      }
      case Constants.MODE_CONTRIBUTION: {
        this.setState({
          textRandom: Constants.arr_Volunteer[0],
        });
        Constants.arr_Volunteer.sort(() => 0.5 - Math.random());
        var pair = '';
        if (Constants.arr_Volunteer.length >= 1) {
          pair = Constants.arr_Volunteer.pop();
          Constants.arr_Volunteer.push(pair);
        }
        this.setState({
          textRandom: pair,
        });
        //call api hisup
        this.getDataApiHisUp();
        break;
      }
    }
  }

  onSelect(value) {
    this.setState({modeHabit: value});
  }

  onSelectedIndex() {
    if (this.state.modeHabit != 0) {
      return this.state.modeHabit;
    } else {
      return 0;
    }
  }

  // thay đổi style của view allmode khi nhấn vào mode
  changeStyleViewAllMode() {
    if (this.state.charingMode === true) {
      /*true*/
      return {marginTop: moderateScale(10)};
    } else {
      return {marginTop: moderateScale(61.5)};
    }
  }

  //thay đổi style của view mode khi nhấn vào mode
  changeStyleMode() {
    switch (this.state.modeHabit) {
      case Constants.MODE_HEALTH: {
        if (this.state.charingMode === false) {
          return {marginTop: moderateScale(27)};
        } else {
          return {marginTop: moderateScale(26.5)};
        }
      }
      case Constants.MODE_LEARNING: {
        if (this.state.charingMode === false) {
          return {
            marginStart: moderateScale(19),
            marginTop: moderateScale(25.5),
          };
        } else {
          return {
            marginStart: moderateScale(19),
            marginTop: moderateScale(1),
          };
        }
      }
      case Constants.MODE_CONTRIBUTION: {
        if (this.state.charingMode === false) {
          return {
            marginStart: widthScreen / 47,
            marginTop: moderateScale(26.5),
          };
        } else {
          return {
            marginStart: widthScreen / 46,
            marginTop: moderateScale(26.5),
          };
        }
      }
    }
  }

  //thay đổi style của view touchable khi nhấn vào mode
  changeStylePress() {
    switch (this.state.modeHabit) {
      case Constants.MODE_HEALTH: {
        if (this.state.charingMode === false) {
          return {
            marginTop: isIpX ? moderateScale(62) : moderateScale(58.5),
            width: widthScreen / 4.2,
            borderRadius: 25,
          };
        } else {
          return {
            marginTop: isIpX ? moderateScale(30) : moderateScale(22.5),
            height: heightScreen / 8,
            width: widthScreen / 5,
            borderRadius: 60,
          };
        }
      }
      case Constants.MODE_LEARNING: {
        if (this.state.charingMode === false) {
          return {
            width: widthScreen / 4.2,
            marginStart: isIpX ? moderateScale(29.5) : moderateScale(21.5),
            marginTop: !isIpX ? moderateScale(8) : 0,
            borderRadius: 25,
          };
        } else {
          return {
            width: widthScreen / 4.8,
            height: heightScreen / 12,
            marginStart: isIpX ? moderateScale(29.5) : moderateScale(21.5),
            marginTop: !isIpX ? moderateScale(4.5) : 0,
            borderRadius: 60,
          };
        }
      }
      case Constants.MODE_CONTRIBUTION: {
        if (this.state.charingMode === false) {
          return {
            width: widthScreen / 4.2,
            height: heightScreen / 7.5,
            marginStart: isIpX ? moderateScale(95) : moderateScale(77),
            marginTop: isIpX ? moderateScale(46) : moderateScale(46),
            borderRadius: 25,
          };
        } else {
          return {
            width: widthScreen / 4.2,
            height: heightScreen / 9,
            marginStart: isIpX ? moderateScale(95) : moderateScale(77),
            marginTop: isIpX ? moderateScale(30) : moderateScale(23),
            marginBottom: moderateScale(5),
            borderRadius: 60,
          };
        }
      }
    }
  }

  //thay đổi background khi bắt đầu thực hiện charing
  changeBackground() {
    if (this.state.charingMode === true) {
      return (
        <View style={styles.parent}>
          <FastImage
            resizeMode={FastImage.resizeMode.stretch}
            style={styles.viewBackground}
            source={require('../../resources/images/1_7_1.png')}
          />
        </View>
      );
    }
  }

  //thay đổi style của view chưa view mode và view all mode
  changeViewAll() {
    switch (this.state.modeHabit) {
      case Constants.MODE_HEALTH: {
        if (this.state.charingMode === false) {
          /*false*/
          return {height: '80%'};
        } else {
          return {height: '90%'};
        }
      }
      case Constants.MODE_LEARNING: {
        if (this.state.charingMode === false) {
          /*false*/
          return {height: '75%'};
        } else {
          return {height: '90%'};
        }
      }
      case Constants.MODE_CONTRIBUTION: {
        if (this.state.charingMode === false) {
          /*false*/
          return {height: '70%'};
        } else {
          return {height: '90%'};
        }
      }
    }
  }

  // ẩn/hiện view tap khi nhấn vào mode
  showHideTapView() {
    switch (this.state.modeHabit) {
      case Constants.MODE_HEALTH: {
        if (this.state.charingMode === false) {
          /*false*/
          return (
            <FastImage
              style={styles.imageTap1}
              source={require('../../resources/images/1_10_6.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          );
        }
        break;
      }
      case Constants.MODE_LEARNING: {
        if (this.state.charingMode === false) {
          /*false*/
          return (
            <FastImage
              style={styles.imageTap2}
              source={require('../../resources/images/1_10_6.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          );
        }
        break;
      }
      case Constants.MODE_CONTRIBUTION: {
        if (this.state.charingMode === false) {
          /*false*/
          return (
            <FastImage
              style={styles.imageTap3}
              source={require('../../resources/images/1_10_6.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          );
        }
        break;
      }
    }
  }

  // b1
  /* khi click vào mode của item
   * random text
   * call api https://cdicom.xsrv.jp/cdi/php/HisUp.php
   * sau khi cos res trar về nếu res ='insert' gọi tiếp api
   * https://cdicom.xsrv.jp/cdi/php/UcntDd.php
   */
  async clickMode() {
    setTimeout(async () => {
      await SoundService.loadSoundSel('charin.mp3');
    }, 300);
    if (this.state.charingMode === false) {
      this.setState({
        charingMode: true,
        isLoading: true,
        isSuccess: true,
      });
      this.randomText();
    } else {
      this.setState({
        isLoading: true,
        isSuccess: true,
      });
      this.randomText();
    }
  }

  getDataApiHisUp = async () => {
    var ic_JobDate = moment().format('YYYYMMDDHHmmss');
    fetch(BASE_URL + API_CHARING_HABIT_TODAY, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='
        .concat(this.state.IdUser)
        .concat('&JobDate=')
        .concat(ic_JobDate)
        .concat('&SelJob=')
        .concat(this.state.modeHabit)
        .concat('&AddWd=')
        .concat(this.state.todayAct)
        .concat('&PraiseWd=')
        .concat('')
        .concat('&SelSend=')
        .concat('1')
        .concat('&SetTime=')
        .concat('0000')
        .concat('&InpMsg=')
        .concat('')
        .concat('&HID=')
        .concat('0')
        .concat('&TodayFg=')
        .concat('1'),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson === 'insert') {
          /*
           * call api https://cdicom.xsrv.jp/cdi/php/UcntDd.php
           */
          this.getApiCharingLastDate();
        } else {
        }
      })
      .catch(error => {
        this.setState({isLoading: false});
        console.log('Error =>>> ' + error);
      });
  };

  /*
   * b2
   *  call api https://cdicom.xsrv.jp/cdi/php/UcntDd.php
   * khi res trả về json có giá trị thì lưu các trường từ res và các biến toàn cục
   * dTcnt = 0
   * dGcnt = 0
   * dScnt = 0
   * Fcnt = 0
   */
  async getApiCharingLastDate() {
    const yesterday = moment()
      .subtract(1, 'day')
      .toDate();
    const FDate = moment(yesterday).format('YYYYMMDD');
    fetch(BASE_URL + API_CHARING_HABIT_LAST_DATE, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='
        .concat(this.state.IdUser)
        .concat('&LastDate=')
        .concat(FDate), //ngày hôm qua
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson.length > 0) {
          this.setState({
            dTcnt: parseInt(responseJson[responseJson.length - 1].dTcnt),
            dGcnt: parseInt(responseJson[responseJson.length - 1].dGcnt),
            dScnt: parseInt(responseJson[responseJson.length - 1].dScnt),
            Fcnt: parseInt(responseJson[responseJson.length - 1].Ccnt),
          });
        }
        // sau khi gán giá trị vào các biến toàn cục
        // check điều kiện rồi thực hiện gọi function getDataCountHabitCharing()
        if (
          this.state.dTcnt >= 1 &&
          this.state.dGcnt >= 1 &&
          this.state.dScnt >= 1
        ) {
          // step2.1
          this.getDataCountHabitCharing();
        } else {
          //call api ucntZup
          // step 2.2
          this.getApiUcntZup();
        }
      })
      .catch(error => {
        console.log('Error =>>> ' + error);
      });
  }

  //call api ucntZup
  // b2.2
  async getApiUcntZup() {
    const yesterday = moment()
      .subtract(1, 'day')
      .toDate();
    const FDate = moment(yesterday).format('YYYYMMDD');
    fetch(BASE_URL + API_CHARING_HABIT_UCNTZUP, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='
        .concat(this.state.IdUser)
        .concat('&LastDate=')
        .concat(FDate) // ngày hôm qua
        .concat('&Ccnt=')
        .concat('0'),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson === 'update') {
          //this is func1 in spec
          this.getDataCountHabitCharing();
        }
      })
      .catch(error => {
        console.log('Error =>>> ' + error);
      });
  }

  /*
   * b2.1
   * gọi api https://cdicom.xsrv.jp/cdi/php/UcntRd.php
   * gán giá trị vào các biện toàn cục
   * sau đó check điều kiện của last date để thay đổi giá trị các biến
   * this func call func1 in spec
   */
  async getDataCountHabitCharing() {
    fetch(BASE_URL + API_CHARING_HABIT_UCNTRD, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='.concat(this.state.IdUser),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson.length > 0) {
          this.setState({
            dTcnt: parseInt(responseJson[responseJson.length - 1].dTcnt),
            dGcnt: parseInt(responseJson[responseJson.length - 1].dGcnt),
            dScnt: parseInt(responseJson[responseJson.length - 1].dScnt),
            Ccnt: parseInt(responseJson[responseJson.length - 1].Ccnt),
            DelFg: parseInt(responseJson[responseJson.length - 1].DelFg),

            Hcnt: parseInt(responseJson[responseJson.length - 1].Hcnt),
            ID: parseInt(responseJson[responseJson.length - 1].ID),
            LastDate: responseJson[responseJson.length - 1].LastDate,
            Name: parseInt(responseJson[responseJson.length - 1].Name),

            tGcnt: parseInt(responseJson[responseJson.length - 1].tGcnt),
            tScnt: parseInt(responseJson[responseJson.length - 1].tScnt),
            tTcnt: parseInt(responseJson[responseJson.length - 1].tTcnt),

            Tcnt: parseInt(responseJson[responseJson.length - 1].Tcnt),
            Gcnt: parseInt(responseJson[responseJson.length - 1].Gcnt),
            Scnt: parseInt(responseJson[responseJson.length - 1].Scnt),

            sTcnt: parseInt(responseJson[responseJson.length - 1].Tcnt),
            sGcnt: parseInt(responseJson[responseJson.length - 1].Gcnt),
            sScnt: parseInt(responseJson[responseJson.length - 1].Scnt),
          });
        }

        //sau đó check last date
        if (this.state.LastDate === '') {
          this.setState({
            LastDate: this.state.curDate,
            Tcnt: 1,
            Gcnt: 1,
            Scnt: 1,
            Ccnt: this.state.Fcnt,
          });
          switch (this.state.modeHabit) {
            case Constants.MODE_HEALTH: {
              this.setState({
                tTcnt: 1,
                dTcnt: 1,
              });
              break;
            }
            case Constants.MODE_LEARNING: {
              this.setState({
                tGcnt: 1,
                dGcnt: 1,
              });
              break;
            }
            case Constants.MODE_CONTRIBUTION: {
              this.setState({
                tScnt: 1,
                dScnt: 1,
              });
              break;
            }
          }
        } else {
          if (this.state.LastDate === this.state.curDate) {
            switch (this.state.modeHabit) {
              case Constants.MODE_HEALTH: {
                this.setState({
                  tTcnt: this.state.tTcnt + 1,
                  dTcnt: this.state.dTcnt + 1,
                });
                break;
              }
              case Constants.MODE_LEARNING: {
                this.setState({
                  tGcnt: this.state.tGcnt + 1,
                  dGcnt: this.state.dGcnt + 1,
                });
                break;
              }
              case Constants.MODE_CONTRIBUTION: {
                this.setState({
                  tScnt: this.state.tScnt + 1,
                  dScnt: this.state.dScnt + 1,
                });
                break;
              }
            }
            if (
              this.state.tTcnt >= this.state.Tcnt &&
              this.state.tGcnt >= this.state.Gcnt &&
              this.state.tScnt >= this.state.Scnt
            ) {
              this.setState({
                Hcnt: this.state.Hcnt + 1,
                Ccnt: this.state.Fcnt + 1,
                Tcnt: this.state.Tcnt + 1,
                Gcnt: this.state.Gcnt + 1,
                Scnt: this.state.Scnt + 1,
              });
            }
          } else {
            this.setState({
              LastDate: this.state.curDate,
              Tcnt: this.state.tTcnt + 1,
              Gcnt: this.state.tGcnt + 1,
              Scnt: this.state.tScnt + 1,
              Ccnt: this.state.Fcnt,
              dTcnt: 0,
              dGcnt: 0,
              dScnt: 0,
            });
            switch (this.state.modeHabit) {
              case Constants.MODE_HEALTH: {
                this.setState({
                  tTcnt: this.state.tTcnt + 1,
                  dTcnt: 1,
                });
                break;
              }
              case Constants.MODE_LEARNING: {
                this.setState({
                  tGcnt: this.state.tGcnt + 1,
                  dGcnt: 1,
                });
                break;
              }
              case Constants.MODE_CONTRIBUTION: {
                this.setState({
                  tScnt: this.state.tScnt + 1,
                  dScnt: 1,
                });
                break;
              }
            }
            if (
              this.state.tTcnt >= this.state.Tcnt &&
              this.state.tGcnt >= this.state.Gcnt &&
              this.state.tScnt >= this.state.Scnt
            ) {
              this.setState({
                Hcnt: this.state.Hcnt + 1,
                Ccnt: this.state.Fcnt + 1,
                Tcnt: this.state.Tcnt + 1,
                Gcnt: this.state.Gcnt + 1,
                Scnt: this.state.Scnt + 1,
              });
            }
          }
        }

        //call countComboHabit
        this.countComboHabit(true);
      })
      .catch(error => {
        console.log('Error =>>> ' + error);
      });
  }

  //funcC in logic spec
  // b3
  countComboHabit(callback, modeSound) {
    fetch(BASE_URL + API_CHARING_HABIT_UCNTUP, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='
        .concat(this.state.IdUser)
        .concat('&LastDate=')
        .concat(this.state.curDate)
        .concat('&Tcnt=')
        .concat(this.state.Tcnt)
        .concat('&Gcnt=')
        .concat(this.state.Gcnt)
        .concat('&Scnt=')
        .concat(this.state.Scnt)
        .concat('&tTcnt=')
        .concat(this.state.tTcnt)
        .concat('&tGcnt=')
        .concat(this.state.tGcnt)
        .concat('&tScnt=')
        .concat(this.state.tScnt)
        .concat('&dTcnt=')
        .concat(this.state.dTcnt)
        .concat('&dGcnt=')
        .concat(this.state.dGcnt)
        .concat('&dScnt=')
        .concat(this.state.dScnt)
        .concat('&Hcnt=')
        .concat(this.state.Hcnt)
        .concat('&Ccnt=')
        .concat(this.state.Ccnt)
        .concat('&DelFg=')
        .concat('0'),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson !== '') {
          if (callback) {
            var CombCnt = this.state.Ccnt;
            //call calculateComboHabit
            // funcB in spec
            this.calculateComboHabit(CombCnt);
          } else {
            if (modeSound === 1) {
              //funcD in spec
              this.playSoundEffectAndChangeBackgroundCombo(1);
            } else {
              //funcD in spec
              this.playSoundEffectAndChangeBackgroundCombo(2);
            }
          }
        }
      })
      .catch(error => {
        console.log('Error =>>> ' + error);
      });
  }

  // sau khi gọi thành công api ở countComboHabit thì tiếp tục gọi tiếp calculateComboHabit
  // tinhs toán combo habit
  // funcB in spec
  // b4
  calculateComboHabit(CombCnt) {
    if (
      this.state.tTcnt >= this.state.sTcnt &&
      this.state.tGcnt >= this.state.sGcnt &&
      this.state.tScnt >= this.state.sScnt
    ) {
      var wOk = 0;
      var wInt = CombCnt;
      for (let i = 0; i < 8; i++) {
        wInt = CombCnt + i;
        wInt = parseInt(wInt / (30 + i));
        wInt = wInt * (30 + i);
        //check nếu tạo được combo thì show ảnh thông báo và chơi nhạc 3s
        if (CombCnt !== 0 && CombCnt !== wInt && !(wOk === 1 && wInt !== 0)) {
          this.playSoundEffectAndChangeBackgroundCombo(3);
        }
        if (CombCnt === wInt) {
          if (i === 7) {
            CombCnt = 7;
            this.setState({
              Ccnt: 7,
              Hcnt: this.state.Hcnt + 1,
            });
            wOk = 2;
            // save date with 7day combo
            this.saveComboSevenDay('1');
            //funcC in logic spec
            this.countComboHabit(false, 1);
            //funcD in spec
            // this.playSoundEffectAndChangeBackgroundCombo(1);
          } else {
            wOk = 1;
          }
          break;
        }
      }
      if (wOk === 1 && wInt !== 0) {
        this.setState({
          Hcnt: this.state.Hcnt + 2,
        });
        this.saveComboSevenDay('2');
        //funcC in logic spec
        this.countComboHabit(false, 2);
        //funcD in spec
        // this.playSoundEffectAndChangeBackgroundCombo(2);
      } else {
        if (wOk === 0) {
          var wInt = CombCnt;
          wInt = parseInt(wInt / 7);
          wInt = wInt * 7;
          if (CombCnt === wInt && wInt !== 0) {
            this.setState({Hcnt: this.state.Hcnt + 1});
            this.saveComboSevenDay('1');
            //funcC in logic spec
            this.countComboHabit(false, 1);
            //funcD in spec
            // this.playSoundEffectAndChangeBackgroundCombo(1);
          } else {
          }
        }
      }
    }
    this.setState({
      isSuccess: false,
    });
  }

  // khi combo được thực hiện thì phát nhạc combo và thay đổi ảnh nền
  playSoundEffectAndChangeBackgroundCombo(DspCnt) {
    if (DspCnt === 1) {
      //play sound effect combo x1 và change background A_1.png trong 3s
      this.setState({comboImage1: true});
      setTimeout(() => {
        this.audioCombo1.play(success => {
          if (success) {
            console.log('successfully finished playing cb');
            this.setState({comboImage1: false});
          } else {
            console.log('playback failed due to audio decoding errors¸ cb');
            this.setState({comboImage1: false});
          }
        });
      }, 1000);
      setTimeout(() => {
        this.setState({comboImage1: false});
      }, 4000);
    } else if (DspCnt === 2) {
      //play sound effect combo x2 và change background A_2.png trong 3s
      this.setState({comboImage2: true});
      setTimeout(() => {
        this.audioCombo2.play(success => {
          if (success) {
            console.log('successfully finished playing');

            this.setState({comboImage2: false});
          } else {
            console.log('playback failed due to audio decoding errors¸');

            this.setState({comboImage2: false});
          }
        });
      }, 1000);
      setTimeout(() => {
        this.setState({comboImage2: false});
      }, 5000);
    } else if (DspCnt === 3) {
      //play sound effect combo x1 và change background A_1.png trong 3s
      this.setState({comboImage3: true}, () => {
        setTimeout(() => {
          this.setState({comboImage3: false});
        }, 3000);
      });
    }
  }

  // save data combo to storage
  saveComboSevenDay = async mode => {
    try {
      await AsyncStorage.setItem('fbDay', this.state.curDate.concat(mode));
    } catch (error) {
      console.log('save data error => ' + error);
    }
  };

  // thay đổi view allMode khi habit mỗi loại được chọn khi scroll
  renderViewModeTap() {
    switch (this.state.modeHabit) {
      case Constants.MODE_HEALTH: {
        return (
          <View style={[{position: 'absolute'}, this.changeViewAll()]}>
            <TouchableDebounce
              style={[styles.viewPress1, this.changeStylePress()]}
              onPress={() => this.clickMode()}>
              {this.showHideTapView()}
              <FastImage
                style={[styles.imageMode1, this.changeStyleMode()]}
                source={require('../../resources/images/1_1_9.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableDebounce>
          </View>
        );
      }
      case Constants.MODE_LEARNING: {
        return (
          <View style={[{position: 'absolute'}, this.changeViewAll()]}>
            <TouchableDebounce
              style={[styles.viewPress2, this.changeStylePress()]}
              onPress={() => {
                this.clickMode();
              }}>
              {this.showHideTapView()}
              <FastImage
                style={[styles.imageMode2, this.changeStyleMode()]}
                source={require('../../resources/images/1_1_10.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableDebounce>
          </View>
        );
      }
      case Constants.MODE_CONTRIBUTION: {
        return (
          <View style={[{position: 'absolute'}, this.changeViewAll()]}>
            <TouchableDebounce
              style={[styles.viewPress3, this.changeStylePress()]}
              onPress={() => this.clickMode()}>
              {this.showHideTapView()}
              <FastImage
                style={[styles.imageMode3, this.changeStyleMode()]}
                source={require('../../resources/images/1_1_11.png')}
              />
            </TouchableDebounce>
          </View>
        );
      }
    }
  }

  checkContentInputtodayAct = () => {
    if (
      this.state.todayAct
        .trim()
        .replace(/[&\{\}\[\]\\\/]/gi, '')
        .replace(regexEmoji, '')
        .replace(regexVietnameseChar, '') === ''
    ) {
      this.setState({
        todayAct: '',
      });
    } else {
      this.setState({
        todayAct: this.state.todayAct
          .trim()
          .replace(/[&\{\}\[\]\\\/]/gi, '')
          .replace(regexEmoji, '')
          .replace(regexVietnameseChar, ''),
      });
    }
  };

  //change view when user click mode with habit selected
  renderViewCreateOnly() {
    if (this.state.decision === true) {
      /*true*/
      if (this.state.charingMode === false) {
        /*false*/
        return (
          <View style={styles.content}>
            <FastImage
              style={styles.imageTitle}
              source={require('../../resources/images/d-4-3.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
            <TextInput
              value={this.state.todayAct}
              style={styles.textInput}
              editable={false}
            />
            <View
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
              }}>
              <FastImage
                style={[styles.imageAllMode, this.changeStyleViewAllMode()]}
                source={require('../../resources/images/1_5_7.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
              {this.renderViewModeTap()}
              <FastImage
                style={styles.imgPig}
                source={require('../../resources/images/1_1_4.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </View>
        );
      } else {
        return (
          <View style={styles.content}>
            <FastImage
              style={styles.imageTitle}
              source={require('../../resources/images/d-4-3.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
            <TextInput
              value={this.state.todayAct}
              style={styles.textInput}
              editable={false}
            />
            <View
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
              }}>
              <FastImage
                style={[styles.imageAllMode, this.changeStyleViewAllMode()]}
                source={require('../../resources/images/1_5_7.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
              {this.renderViewModeTap()}
              <FastImage
                style={styles.imgPig}
                source={require('../../resources/images/1_1_4.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
            <View styles={styles.viewMsg}>
              <FastImage
                style={styles.imgMsg}
                source={require('../../resources/images/1_7_5.png')}
                resizeMode={FastImage.resizeMode.stretch}
              />
              <Text style={styles.textRandom} numberOfLines={3}>
                {this.state.textRandom}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                this.continuePlayingA();
              }}
              style={styles.viewContinue}>
              <Text style={styles.textContinue}>
                {translate('txt_btn_continue_playing')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }
    } else {
      return (
        <View style={styles.content}>
          <View>
            <FastImage
              style={styles.imageTitle}
              source={require('../../resources/images/d-4-3.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
            <TextInput
              style={styles.textInput}
              onChangeText={todayAct => {
                this.setState({todayAct: todayAct});
              }}
              onBlur={() => this.checkContentInputtodayAct()}>
              {this.state.todayAct}
            </TextInput>
          </View>
          <RadioGroup
            color={Color.colorRadio}
            style={styles.viewRadio}
            selectedIndex={this.onSelectedIndex()}
            onSelect={(index, value) => this.onSelect(value)}>
            <RadioButton
              value={Constants.MODE_HEALTH}
              style={styles.buttonRadio}>
              <FastImage
                style={styles.imageRadio}
                source={require('../../resources/images/1_12_9.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </RadioButton>

            <RadioButton
              value={Constants.MODE_LEARNING}
              style={styles.buttonRadio}>
              <FastImage
                style={styles.imageRadio}
                source={require('../../resources/images/1_12_10.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </RadioButton>

            <RadioButton
              value={Constants.MODE_CONTRIBUTION}
              style={styles.buttonRadio}>
              <FastImage
                style={styles.imageRadio}
                source={require('../../resources/images/1_12_11.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </RadioButton>
          </RadioGroup>

          <TouchableOpacity
            style={styles.viewCreate}
            onPress={() => {
              if (this.state.todayAct.length > 0) {
                this.setState({decision: true});
              } else {
                Alert.alert(
                  translate('warning_dialog'),
                  translate('you_have_not_entered_what_you_did_today'),
                  [
                    {
                      text: translate('sure_recognition_dialog'),
                      onPress: () => {
                        this.setState({isLoading: false});
                      },
                      style: 'cancel',
                    },
                  ],
                );
              }
            }}>
            {/* <Text style={styles.textCreate}>{translate('decision')}</Text> */}
            <FastImage
              style={styles.textCreate}
              source={require('../../resources/images/e-11-4.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
        </View>
      );
    }
  }

  continuePlayingA = () => {
    this.setState({
      decision: false,
      modeHabit: 0,
      todayAct: '',
      charingMode: false,
    });
  };

  // khi biến comboImage1 || comboImage2 || comboImage3 === true
  // thực hiện thay đổi background screen
  showImageCombo() {
    if (this.state.comboImage1 === true) {
      return (
        <FastImage
          resizeMode={FastImage.resizeMode.stretch}
          style={styles.comboBackground}
          source={
            ratio
              ? require('../../resources/images/18x9/A_2.png')
              : require('../../resources/images/16x9/A_2.png')
          }
        />
      );
    } else {
      null;
    }

    if (this.state.comboImage2 === true) {
      return (
        <FastImage
          resizeMode={FastImage.resizeMode.stretch}
          style={styles.comboBackground}
          source={
            ratio
              ? require('../../resources/images/18x9/A_3.png')
              : require('../../resources/images/16x9/A_3.png')
          }
        />
      );
    } else {
      null;
    }

    if (this.state.comboImage3 === true) {
      return (
        <FastImage
          resizeMode={FastImage.resizeMode.stretch}
          style={styles.comboBackground}
          source={
            ratio
              ? require('../../resources/images/18x9/A_1.png')
              : require('../../resources/images/16x9/A_1.png')
          }
        />
      );
    } else {
      null;
    }
  }

  onClickRightButton() {
    Navigation.navigateToHome();
  }

  render() {
    const {isLoading, isSuccess} = this.state;
    return (
      <KeyboardAwareScrollView>
        <View style={styles.parent}>
          <Toolbar
            leftIcon="back"
            nameRightButton="home"
            style={styles.toolbar}
            onClickBackButton={() => this.onClickBackButton()}
            onClickRightButton={() => this.onClickRightButton()}
            title={Constants.SCREEN_CHARING.TITLE}
          />
          <View style={styles.viewContent}>
            {this.changeBackground()}
            <View style={{paddingHorizontal: moderateScale(25)}}>
              <View style={styles.viewButton}>
                <TouchableOpacity
                  style={[styles.itemButton1]}
                  onPress={() => {
                    Actions.pop();
                  }}>
                  <FastImage
                    style={styles.textButton}
                    source={require('../../resources/images/d-1-1.png')}
                    resizeMode={FastImage.resizeMode.stretch}
                  />
                  {/* {translate('charing_learning')}
                  </Text> */}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.itemButton2]}>
                  <FastImage
                    style={styles.textButton}
                    source={require('../../resources/images/d-1-2.png')}
                    resizeMode={FastImage.resizeMode.stretch}
                  />
                  {/* {translate('charing_only_today')}
                  </Text> */}
                </TouchableOpacity>
              </View>
              {this.renderViewCreateOnly()}
            </View>
          </View>
          {isLoading && isSuccess && (
            <ActivityIndicator
              style={styles.loading}
              color={Constants.BACKGROUND_COLOR_TOOLBAR}
              size="large"
            />
          )}
          {this.showImageCombo()}
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  loading: {
    height:
      Platform.OS === 'ios'
        ? heightScreen
        : heightScreen - StatusBar.currentHeight,
    width: '100%',
    position: 'absolute',
    backgroundColor: Color.backgroundTransparent,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  parent: {
    flex: 1,
    flexDirection: 'column',
    width: widthScreen,
    height:
      Platform.OS === 'ios'
        ? heightScreen
        : heightScreen - StatusBar.currentHeight,
  },
  toolbar: {
    flex: 2,
  },
  viewContent: {
    flex: 8,
    flexDirection: 'column',
    backgroundColor: Color.backgroundCharing,
  },
  content: {
    height: '100%',
  },
  viewButton: {
    width: widthScreen,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  itemButton1: {
    width: '35%',
    marginTop: moderateScale(15),
    marginBottom: moderateScale(5),
    height: moderateScale(45),
  },
  itemButton2: {
    width: '35%',
    marginTop: moderateScale(15),
    marginBottom: moderateScale(5),
    height: moderateScale(45),
    marginLeft: -1,
  },
  textButton: {
    alignSelf: 'center',
    resizeMode: 'stretch',
    width: widthScreen * 0.35,
    height: moderateScale(40),
  },
  imageTitle: {
    width: '40%',
    height: moderateScale(35),
    resizeMode: 'contain',
  },
  textInput: {
    borderRadius: moderateScale(5),
    borderColor: Color.borderColor,
    borderWidth: 0.6,
    backgroundColor: Color.backgroundColorInput,
    height: moderateScale(40),
    fontFamily: 'HuiFont',
    fontSize: moderateScale(20),
    color: Color.black,
    paddingVertical: scales.vertical(2),
    paddingHorizontal: scales.horizontal(5),
  },
  viewRadio: {
    marginTop: moderateScale(15),
    // justifyContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageRadio: {
    width: moderateScale(60),
    height: moderateScale(75),
    resizeMode: 'contain',
  },
  buttonRadio: {
    alignItems: 'center',
  },
  viewCreate: {
    flexDirection: 'row',
    marginTop: moderateScale(30),
    alignSelf: 'center',
    borderRadius: moderateScale(5),
  },
  textCreate: {
    resizeMode: 'contain',
    width: widthScreen * 0.7,
    height: moderateScale(60),
  },
  imageAllMode: {
    resizeMode: 'contain',
    width: isIpX ? moderateScale(160) : moderateScale(130),
    height: isIpX ? moderateScale(120) : moderateScale(100),
    alignSelf: 'center',
  },
  imageMode1: {
    position: 'absolute',
    resizeMode: 'contain',
    width: isIpX ? moderateScale(56) : moderateScale(45),
    height: isIpX ? moderateScale(56) : moderateScale(45),
  },
  imageTap1: {
    resizeMode: 'contain',
    width: isIpX ? moderateScale(50) : moderateScale(40),
    height: isIpX ? moderateScale(50) : moderateScale(40),
    marginStart: moderateScale(50),
    marginBottom: moderateScale(40),
  },
  imageMode2: {
    position: 'absolute',
    resizeMode: 'contain',
    width: isIpX ? moderateScale(56) : moderateScale(45),
    height: isIpX ? moderateScale(56) : moderateScale(45),
  },
  imageTap2: {
    resizeMode: 'contain',
    width: isIpX ? moderateScale(50) : moderateScale(40),
    height: isIpX ? moderateScale(50) : moderateScale(40),
    marginStart: moderateScale(72),
    marginBottom: moderateScale(40),
  },
  imageMode3: {
    position: 'absolute',
    resizeMode: 'contain',
    width: isIpX ? moderateScale(56) : moderateScale(45),
    height: isIpX ? moderateScale(56) : moderateScale(45),
  },
  imageTap3: {
    resizeMode: 'contain',
    width: isIpX ? moderateScale(50) : moderateScale(40),
    height: isIpX ? moderateScale(50) : moderateScale(40),
    marginStart: widthScreen / 6.4,
    marginBottom: moderateScale(40),
  },
  imgPig: {
    resizeMode: 'contain',
    width: isIpX ? moderateScale(150) : moderateScale(100),
    height: isIpX ? moderateScale(120) : moderateScale(100),
    marginTop: isIpX ? moderateScale(20) : 0,
    alignSelf: 'center',
  },
  viewPress1: {
    position: 'absolute',
  },
  viewPress2: {
    position: 'absolute',
  },
  viewPress3: {
    position: 'absolute',
  },
  imgMsg: {
    width: moderateScale(190),
    height: isIpX ? moderateScale(120) : moderateScale(95),
    alignSelf: 'center',
    bottom: moderateScale(5),
  },
  textRandom: {
    position: 'absolute',
    alignSelf: 'center',
    height: moderateScale(90),
    width: moderateScale(180),
    top: '13%',
    color: Color.black,
    fontFamily: 'HuiFont',
    fontSize: scales.horizontalScale(20),
  },
  comboBackground: {
    width: widthScreen,
    height:
      Platform.OS === 'android'
        ? heightScreen - StatusBar.currentHeight
        : heightScreen,
    justifyContent: 'center',
    position: 'absolute',
    alignItems: 'center',
  },
  viewContinue: {
    width: '70%',
    height: isIpX ? moderateScale(60) : moderateScale(40),
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(3),
    borderColor: Color.white,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Color.brown,
    marginVertical: verticalScale(15),
  },
  textContinue: {
    fontSize: scales.horizontal(20),
    color: Color.white,
    fontFamily: 'HuiFont',
    alignSelf: 'center',
  },
  viewMsg: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewBackground: {
    width: widthScreen,
    height:
      Platform.OS === 'android'
        ? heightScreen - StatusBar.currentHeight
        : heightScreen,
  },
});
