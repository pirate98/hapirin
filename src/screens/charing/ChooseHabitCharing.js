/* eslint-disable no-unused-vars */
/* eslint-disable radix */
/* eslint-disable no-fallthrough */
/* eslint-disable react-native/no-inline-styles */
/**
 * Choose habit charing
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  BackHandler,
  I18nManager,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  AsyncStorage,
  Platform,
  AppState,
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';
import Constants, {
  BASE_URL,
  API_GET_LIST_HABIT,
  API_CHARING_HABIT_TODAY,
  API_CHARING_HABIT_LAST_DATE,
  API_CHARING_HABIT_UCNTRD,
  API_CHARING_HABIT_UCNTZUP,
  API_CHARING_HABIT_UCNTUP,
  ratio,
} from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import {I18n} from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import {Color} from '../../colors/Colors';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {getUserInfo} from '../../databases/StorageServices';
import moment from 'moment';
import SoundService from '../../soundService/SoundService';
import {RadioButton, RadioGroup} from 'react-native-flexi-radio-button';
import ModalDropdown from 'react-native-modal-dropdown';
import scales from '../../styles/scales';
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

const widthScreen = Dimensions.get('window').width; //full width
const heightScreen = Dimensions.get('window').height; //full height
const isIpX =
  Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800);
var options = [];

export default class ChooseHabitCharing extends React.Component {
  constructor(props) {
    super(props);

    setI18nConfig(); //set initial config

    this.audioCombo1 = undefined;
    this.audioCombo2 = undefined;
    this.dropdownRef = React.createRef();
    this.backHandler = null;

    this.state = {
      modeHabit: 0,
      charingMode: false,
      showAllMode: 1,
      selectRow: -1,
      isLoading: true,
      isSuccess: true,
      isSelected: false,
      isTap: false,
      comboImage1: false,
      comboImage2: false,
      comboImage3: false,
      ID_User: 0,
      arr_All: [],
      arr_AddWd: [],
      arr_DelFg: [],
      arr_ID: [],
      arr_InpMsg: [],
      arr_Name: [],
      arr_PraiseWd: [],
      arr_SelJob: [],
      arr_SelSend: [],
      arr_SetTime: [],
      //data from api UcntRd
      fdTcnt: 0,
      fdGcnt: 0,
      fdScnt: 0,
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
      sTcnt: 0,
      sGcnt: 0,
      sScnt: 0,
      DspCnt: 0,
      curDate: moment().format('YYYYMMDD'),
      textRandom: '',
    };
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    // register hardware back button listener
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigate(Constants.SCREEN_HOME.KEY)
      return true;
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);

    this.getUserInfoFromDB();

    this.audioCombo1 = await SoundService.loadSoundCombo('combox1.mp3');
    this.audioCombo2 = await SoundService.loadSoundCombo('combo_x2.mp3');
    // audioCharin = await SoundService.loadSoundSel('charin.mp3');
  }

  UNSAFE_componentWillMount() {
    //  this.getUserInfoFromDB();
  }

  componentWillUnmount() {
    // unregister hardware back button listener
    this.backHandler.remove()
    AppState.removeEventListener('change', this._handleAppStateChange);
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
  }

  _dropdown_renderButtonText(rowData) {
    const title = rowData.AddWd;
    return `${title}`;
  }

  _dropdown_renderRow(rowData) {
    return (
      <TouchableOpacity>
        <Text style={styles.textDropDown} numberOfLines={1}>{`${
          rowData.AddWd
        }`}</Text>
      </TouchableOpacity>
    );
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
    this.props.navigation.pop()
  };

  getUserInfoFromDB = async () => {
    getUserInfo()
      .then(userInfo => {
        this.setState({
          //todo: change user info id from db
          ID_User: userInfo[0].ID,
        });
        this.getDataListHabit();
      })
      .catch(error => {
        console.error(error);
      });
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
        break;
      }
    }
  }

  // b0: lấy idUser từ Db ra sau đó dùng id để request data từ api
  // https://cdicom.xsrv.jp/cdi/php/HabitRd1.php
  getDataListHabit = async () => {
    fetch(BASE_URL + API_GET_LIST_HABIT, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='.concat(this.state.ID_User),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson.length > 0) {
          this.setState({arr_All: responseJson});

          options = this.state.arr_All.filter(
            item => parseInt(item.SelJob) === 0,
          );
          for (let data of responseJson) {
            this.state.arr_AddWd.push(data.AddWd);
            this.state.arr_DelFg.push(data.DelFg);
            this.state.arr_ID.push(data.ID);
            this.state.arr_InpMsg.push(data.InpMsg);
            this.state.arr_Name.push(data.Name);
            this.state.arr_PraiseWd.push(data.PraiseWd);
            this.state.arr_SelJob.push(data.SelJob);
            this.state.arr_SelSend.push(data.SelSend);
            this.state.arr_SetTime.push(data.SetTime);
          }
          this.setState({isLoading: false});
        } else {
          this.setState({isLoading: false});
        }
      })
      .catch(error => {
        this.setState({isLoading: false});
        console.log('Error =>>> ' + error);
      });
  };

  // khi click vào mode của item được chọn khi scroll
  clickMode = async () => {
    /*
     * b1:
     * call api https://cdicom.xsrv.jp/cdi/php/HisUp.php
     * sau khi cos res trar về nếu res ='insert' gọi tiếp api
     * https://cdicom.xsrv.jp/cdi/php/UcntDd.php
     */
    if (this.state.charingMode === false) {
      this.setState({
        charingMode: true,
        isLoading: true,
        isSuccess: true,
      });
      this.randomText();
      await SoundService.loadSoundSel('charin.mp3');
      var ic_JobDate = moment().format('YYYYMMDDHHmmss');
      fetch(BASE_URL + API_CHARING_HABIT_TODAY, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body: 'Name='
          .concat(this.state.ID_User)
          .concat('&JobDate=')
          .concat(ic_JobDate)
          .concat('&SelJob=')
          .concat(this.state.arr_SelJob[this.state.selectRow])
          .concat('&AddWd=')
          .concat(this.state.arr_AddWd[this.state.selectRow])
          .concat('&PraiseWd=')
          .concat(this.state.arr_PraiseWd[this.state.selectRow])
          .concat('&SelSend=')
          .concat(this.state.arr_SelSend[this.state.selectRow])
          .concat('&SetTime=')
          .concat(this.state.arr_SetTime[this.state.selectRow])
          .concat('&InpMsg=')
          .concat(this.state.arr_InpMsg[this.state.selectRow])
          .concat('&HID=')
          .concat(this.state.arr_ID[this.state.selectRow])
          .concat('&TodayFg=')
          .concat('0'),
      })
        .then(response => {
          return response.json();
        })
        .then(responseJson => {
          if (responseJson === 'insert') {
            /*
             * step 2
             * call api https://cdicom.xsrv.jp/cdi/php/UcntDd.php
             */
            this.getApiCharingLastDate();
          } else {
          }
        })
        .catch(error => {
          console.log('Error =>>> ' + error);
        });
    }
  };

  /*
   * b2
   * call api https://cdicom.xsrv.jp/cdi/php/UcntDd.php
   * khi res trả về json có giá trị thì lưu các trường từ res và các biến toàn cục
   * dTcnt = 0
   * dGcnt = 0
   * dScnt = 0
   * Fcnt = 0
   */
  async getApiCharingLastDate() {
    const yesterday = moment()
      .subtract(1, 'days')
      .toDate();

    let FDate = moment(yesterday).format('YYYYMMDD');
    fetch(BASE_URL + API_CHARING_HABIT_LAST_DATE, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='
        .concat(this.state.ID_User)
        .concat('&LastDate=')
        .concat(FDate),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        // if (responseJson.length > 0) {
        this.setState(
          {
            fdTcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].dTcnt)
                : 0,
            fdGcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].dGcnt)
                : 0,
            fdScnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].dScnt)
                : 0,
            Fcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Ccnt)
                : 0,
          },
          () => {
            // sau khi gán giá trị vào các biến toàn cục
            // check điều kiện rồi thực hiện gọi function getDataCountHabitCharing()
            if (
              this.state.fdTcnt >= 1 &&
              this.state.fdGcnt >= 1 &&
              this.state.fdScnt >= 1
            ) {
              // step2.1
              this.getDataCountHabitCharing();
            } else {
              //call api ucntZup
              // step 2.2
              this.getApiUcntZup();
            }
          },
        );
        // } else {
        // }
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
      body: 'Name='.concat(this.state.ID_User),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        this.setState(
          {
            dTcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].dTcnt)
                : 0,
            dGcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].dGcnt)
                : 0,
            dScnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].dScnt)
                : 0,
            Ccnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Ccnt)
                : 0,
            DelFg:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].DelFg)
                : 0,

            Hcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Hcnt)
                : 0,
            ID:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].ID)
                : 0,
            LastDate:
              responseJson.length > 0
                ? responseJson[responseJson.length - 1].LastDate
                : '',
            Name:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Name)
                : 0,

            tGcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].tGcnt)
                : 0,
            tScnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].tScnt)
                : 0,
            tTcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].tTcnt)
                : 0,

            Tcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Tcnt)
                : 0,
            Gcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Gcnt)
                : 0,
            Scnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Scnt)
                : 0,

            sTcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Tcnt)
                : 0,
            sGcnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Gcnt)
                : 0,
            sScnt:
              responseJson.length > 0
                ? parseInt(responseJson[responseJson.length - 1].Scnt)
                : 0,
          },
          () => {
            //sau đó check last date
            if (this.state.LastDate === '') {
              this.setState({
                LastDate: this.state.curDate,
                Tcnt: 1,
                Gcnt: 1,
                Scnt: 1,
                Ccnt: this.state.Fcnt,
              });
              switch (parseInt(this.state.arr_SelJob[this.state.selectRow])) {
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
                switch (parseInt(this.state.arr_SelJob[this.state.selectRow])) {
                  case Constants.MODE_HEALTH: {
                    this.setState(
                      {
                        tTcnt: this.state.tTcnt + 1,
                        dTcnt: this.state.dTcnt + 1,
                      },
                      () => {
                        this.checkCondition();
                      },
                    );
                    break;
                  }
                  case Constants.MODE_LEARNING: {
                    this.setState(
                      {
                        tGcnt: this.state.tGcnt + 1,
                        dGcnt: this.state.dGcnt + 1,
                      },
                      () => {
                        this.checkCondition();
                      },
                    );
                    break;
                  }
                  case Constants.MODE_CONTRIBUTION: {
                    this.setState(
                      {
                        tScnt: this.state.tScnt + 1,
                        dScnt: this.state.dScnt + 1,
                      },
                      () => {
                        this.checkCondition();
                      },
                    );
                    break;
                  }
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
                switch (parseInt(this.state.arr_SelJob[this.state.selectRow])) {
                  case Constants.MODE_HEALTH: {
                    this.setState(
                      {
                        tTcnt: this.state.tTcnt + 1,
                        dTcnt: 1,
                      },
                      () => {
                        this.checkCondition();
                      },
                    );
                    break;
                  }
                  case Constants.MODE_LEARNING: {
                    this.setState(
                      {
                        tGcnt: this.state.tGcnt + 1,
                        dGcnt: 1,
                      },
                      () => {
                        this.checkCondition();
                      },
                    );
                    break;
                  }
                  case Constants.MODE_CONTRIBUTION: {
                    this.setState(
                      {
                        tScnt: this.state.tScnt + 1,
                        dScnt: 1,
                      },
                      () => {
                        this.checkCondition();
                      },
                    );
                    break;
                  }
                }
              }
            }
          },
        );

        //call countComboHabit
        setTimeout(() => {
          this.countComboHabit(true);
        }, 100);
      })
      .catch(error => {
        console.log('Error =>>> ' + error);
      });
  }

  checkCondition = () => {
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
  };

  //call api ucntZup
  // b2.2
  async getApiUcntZup() {
    const yesterday = moment()
      .subtract(1, 'days')
      .toDate();

    let FDate = moment(yesterday).format('YYYYMMDD');
    fetch(BASE_URL + API_CHARING_HABIT_UCNTZUP, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='
        .concat(this.state.ID_User)
        .concat('&LastDate=')
        .concat(FDate)
        .concat('&Ccnt=')
        .concat('0'),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        //this is func1 in spec
        this.getDataCountHabitCharing();
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
        .concat(this.state.ID_User)
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
      //b1
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
      //b2
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
  // b5
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

  //thay đổi background khi bắt đầu thực hiện charing
  changebackground() {
    if (this.state.charingMode === true) {
      return (
        <FastImage
          resizeMode={FastImage.resizeMode.stretch}
          style={{
            flex: 1,
            width: widthScreen,
            position: 'absolute',
            height:
              Platform.OS === 'android'
                ? heightScreen - StatusBar.currentHeight
                : heightScreen,
          }}
          source={require('../../resources/images/1_7_1.png')}
        />
      );
    } else {
    }
  }

  showHideMessage() {
    if (this.state.charingMode === true) {
      var text = '';
      text = this.state.arr_PraiseWd[this.state.selectRow];
      return (
        <View style={styles.content}>
          <View
            styles={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <FastImage
              style={styles.imgMsg}
              source={require('../../resources/images/1_7_5.png')}
              resizeMode={FastImage.resizeMode.stretch}
            />
            <Text style={styles.textRandom} numberOfLines={3}>
              {text !== '' ? text : this.state.textRandom}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.continuePlayingB();
            }}
            style={styles.viewContinue}>
            <Text style={styles.textContinue}>
              {translate('txt_btn_continue_playing')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  continuePlayingB = () => {
    this.onSelect(0);
    this.setState(
      {
        charingMode: false,
        isLoading: false,
        isSuccess: false,
        modeHabit: 0,
        isTap: false,
        showAllMode: 1,
        selectRow: -1,
      },
      () => {
        this.dropdownRef.current.select(-1);
      },
    );
  };

  // thay đổi style của view allmode khi nhấn vào mode
  changeStyleViewAllMode() {
    if (this.state.charingMode === true) {
      /*true*/
      return {marginTop: moderateScale(10)};
    } else {
      return {marginTop: moderateScale(61.5)};
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

  //thay đổi style của view touchable khi nhấn vào mode
  changeStylePress() {
    switch (this.state.modeHabit) {
      case Constants.MODE_HEALTH: {
        if (this.state.charingMode === false) {
          return {
            marginTop: isIpX ? moderateScale(62) : moderateScale(48.5),
            marginStart: !isIpX ? moderateScale(3) : 0,
            width: widthScreen / 4.2,
            borderRadius: 25,
          };
        } else {
          return {
            marginTop: isIpX ? moderateScale(30) : moderateScale(13),
            marginStart: !isIpX ? moderateScale(3) : 0,
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
            marginStart: isIpX ? moderateScale(29.5) : moderateScale(19),
            marginTop: !isIpX ? moderateScale(4) : 0,
            borderRadius: 25,
          };
        } else {
          return {
            width: widthScreen / 4.8,
            height: heightScreen / 12,
            marginStart: isIpX ? moderateScale(29.5) : moderateScale(19),
            borderRadius: 60,
          };
        }
      }
      case Constants.MODE_CONTRIBUTION: {
        if (this.state.charingMode === false) {
          return {
            width: widthScreen / 4.2,
            height: heightScreen / 7.5,
            marginStart: isIpX ? moderateScale(95) : moderateScale(70),
            marginTop: isIpX ? moderateScale(46) : moderateScale(36.5),
            borderRadius: 25,
          };
        } else {
          return {
            width: widthScreen / 4.2,
            height: heightScreen / 9,
            marginStart: isIpX ? moderateScale(95) : moderateScale(70),
            marginTop: isIpX ? moderateScale(30) : moderateScale(15),
            marginBottom: moderateScale(5),
            borderRadius: 60,
          };
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
      }
    }
  }

  //thay đổi style của view mode khi nhấn vào mode
  changeStyleMode() {
    switch (this.state.modeHabit) {
      case Constants.MODE_HEALTH: {
        if (this.state.charingMode === false) {
          return {marginTop: moderateScale(29)};
        } else {
          return {marginTop: moderateScale(27.5)};
        }
      }
      case Constants.MODE_LEARNING: {
        if (this.state.charingMode === false) {
          return {
            marginStart: moderateScale(19),
            marginTop: moderateScale(28),
          };
        } else {
          return {
            marginStart: moderateScale(19),
            marginTop: moderateScale(2),
          };
        }
      }
      case Constants.MODE_CONTRIBUTION: {
        if (this.state.charingMode === false) {
          return {
            marginStart: widthScreen / 47,
            marginTop: moderateScale(29.5),
          };
        } else {
          return {
            marginStart: widthScreen / 46,
            marginTop: moderateScale(27),
          };
        }
      }
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

  // sau khi modeHabit thay đổi thì sẽ thay đổi view mode
  // enable mode được chọn và thêm 1 image tab bên cạnh
  renderViewModeTap() {
    switch (this.state.modeHabit) {
      case Constants.MODE_HEALTH: {
        return (
          <View style={[{position: 'absolute'}, this.changeViewAll()]}>
            <TouchableOpacity
              style={[styles.viewPress1, this.changeStylePress()]}
              onPress={() => {
                this.setState(
                  {
                    isTap: true,
                  },
                  () => {
                    this.clickMode();
                  },
                );
              }}>
              {this.showHideTapView()}
              <FastImage
                style={[styles.imageMode1, this.changeStyleMode()]}
                source={require('../../resources/images/1_1_9.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>
        );
      }
      case Constants.MODE_LEARNING: {
        return (
          <View style={[{position: 'absolute'}, this.changeViewAll()]}>
            <TouchableOpacity
              style={[styles.viewPress2, this.changeStylePress()]}
              onPress={() => {
                this.setState(
                  {
                    isTap: true,
                  },
                  () => {
                    this.clickMode();
                  },
                );
              }}>
              {this.showHideTapView()}
              <FastImage
                style={[styles.imageMode2, this.changeStyleMode()]}
                source={require('../../resources/images/1_1_10.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>
        );
      }
      case Constants.MODE_CONTRIBUTION: {
        return (
          <View style={[{position: 'absolute'}, this.changeViewAll()]}>
            <TouchableOpacity
              style={[styles.viewPress3, this.changeStylePress()]}
              onPress={() => {
                this.setState(
                  {
                    isTap: true,
                  },
                  () => {
                    this.clickMode();
                  },
                );
              }}>
              {this.showHideTapView()}
              <FastImage
                style={[styles.imageMode3, this.changeStyleMode()]}
                source={require('../../resources/images/1_1_11.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>
        );
      }
    }
  }

  // khi scroll 1 phần tử trong mảng arr_AddWd được chọn thì thay đổi modeHabit
  onItemSelected(selectedItem) {
    var index = this.state.arr_All.indexOf(selectedItem);
    this.setState({
      selectRow: index,
      isSelected: true,
    });
    if (parseInt(selectedItem.SelJob) === 3) {
      this.setState({showAllMode: 1});
    } else {
      this.setState({showAllMode: 2});
      switch (selectedItem.SelJob) {
        case Constants.MODE_HEALTH: {
          this.setState({
            modeHabit: Constants.MODE_HEALTH,
          });
          break;
        }
        case Constants.MODE_LEARNING: {
          this.setState({
            modeHabit: Constants.MODE_LEARNING,
          });
          break;
        }
        case Constants.MODE_CONTRIBUTION: {
          this.setState({modeHabit: Constants.MODE_CONTRIBUTION});
          break;
        }
      }
    }
  }

  // thay đổi giá trị selectRow
  viewDropdown() {
    return (
      <View style={[styles.viewDropDown, {marginTop: scales.vertical(15)}]}>
        <FastImage
          style={styles.viewArrowDown}
          source={require('../../resources/images/4_2_9.png')}
          resizeMode={FastImage.resizeMode.contain}
        />
        <ModalDropdown
          ref={this.dropdownRef}
          style={styles.dropDown}
          options={options}
          disabled={this.state.charingMode}
          defaultValue={translate('text_default_list_habit')}
          textStyle={styles.textInputModal}
          dropdownTextStyle={styles.textDropDown}
          dropdownStyle={styles.dropdownStyle}
          renderButtonText={rowData => this._dropdown_renderButtonText(rowData)}
          renderRow={this._dropdown_renderRow.bind(this)}
          onSelect={(idx, value) => {
            this.onItemSelected(value);
          }}
        />
      </View>
    );
  }

  //thực hiện thay đổi view AllMode khi bình thường vào khi được user tab vào
  renderViewAllMode() {
    /*true*/
    if (this.state.showAllMode === 1) {
      /*false*/
      console.log('object1111');
      return (
        <View style={styles.content}>
          {this.viewDropdown()}
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
            <FastImage
              style={styles.imgPig}
              source={require('../../resources/images/1_1_4.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        </View>
      );
    } else if (this.state.showAllMode === 2) {
      console.log('object22222');
      return (
        <View style={styles.content}>
          {this.viewDropdown()}
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: scales.vertical(10),
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
          {this.showHideMessage()}
        </View>
      );
    }
  }

  onSelectedIndex() {
    if (this.state.modeHabit !== 0) {
      return this.state.modeHabit;
    } else {
      return 0;
    }
  }

  onSelect(value) {
    options = this.state.arr_All.filter(
      item => parseInt(item.SelJob) === value,
    );
    this.setState(
      {
        modeHabit: value,
      },
      () => {
        if (
          this.state.modeHabit === Constants.MODE_HEALTH &&
          this.state.isSelected
        ) {
          this.setState(
            {
              showAllMode: 1,
              selectRow: -1,
            },
            () => {
              this.dropdownRef.current.select(-1);
            },
          );
        } else if (
          this.state.modeHabit === Constants.MODE_LEARNING &&
          this.state.isSelected
        ) {
          this.setState(
            {
              showAllMode: 1,
              selectRow: -1,
            },
            () => {
              this.dropdownRef.current.select(-1);
            },
          );
        } else if (
          this.state.modeHabit === Constants.MODE_CONTRIBUTION &&
          this.state.isSelected
        ) {
          this.setState(
            {
              showAllMode: 1,
              selectRow: -1,
            },
            () => {
              this.dropdownRef.current.select(-1);
            },
          );
        }
      },
    );
  }

  renderRadioGroup() {
    if (!this.state.isTap) {
      return (
        <RadioGroup
          color={Color.colorRadio}
          style={styles.viewRadio}
          selectedIndex={this.onSelectedIndex()}
          onSelect={(index, value) => {
            !this.state.isTap ? this.onSelect(value) : null;
          }}>
          <RadioButton
            disabled={
              this.state.modeHabit === Constants.MODE_HEALTH
                ? false
                : this.state.isTap
            }
            value={Constants.MODE_HEALTH}
            style={styles.buttonRadio}>
            <FastImage
              style={styles.imageRadio}
              source={require('../../resources/images/1_12_9.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </RadioButton>

          <RadioButton
            disabled={
              this.state.modeHabit === Constants.MODE_LEARNING
                ? false
                : this.state.isTap
            }
            value={Constants.MODE_LEARNING}
            style={styles.buttonRadio}>
            <FastImage
              style={styles.imageRadio}
              source={require('../../resources/images/1_12_10.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </RadioButton>

          <RadioButton
            disabled={
              this.state.modeHabit === Constants.MODE_CONTRIBUTION
                ? false
                : this.state.isTap
            }
            value={Constants.MODE_CONTRIBUTION}
            style={styles.buttonRadio}>
            <FastImage
              style={styles.imageRadio}
              source={require('../../resources/images/1_12_11.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </RadioButton>
        </RadioGroup>
      );
    }
  }

  render() {
    const {isLoading, isSuccess} = this.state;
    return (
      <View style={styles.parent}>
        <Toolbar
          leftIcon="home"
          nameRightButton="none"
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          onClickRightButton={() => this.onClickRightButton()}
          title={Constants.SCREEN_CHARING.TITLE}
        />
        <View style={styles.viewContent}>
          {this.changebackground()}
          <View>
            <View style={styles.viewButton}>
              <TouchableOpacity style={[styles.itemButton1]}>
                <FastImage
                  style={styles.textButton}
                  source={require('../../resources/images/d-2-1.png')}
                  resizeMode={FastImage.resizeMode.stretch}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.itemButton2]}
                onPress={() =>
                  this.props.navigate(Constants.SCREEN_CREATE_HABIT, {
                    IdUser: this.state.ID_User,
                  })
                }>
                <FastImage
                  style={styles.textButton}
                  source={require('../../resources/images/d-2-2.png')}
                  resizeMode={FastImage.resizeMode.stretch}
                />
                {/* {translate('charing_only_today')}
                </Text> */}
              </TouchableOpacity>
            </View>
            {this.renderRadioGroup()}
            {this.renderViewAllMode()}
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
    );
  }
}

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    flexDirection: 'column',
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  viewButton: {
    marginTop: moderateScale(10),
    // backgroundColor:'black',
    width: widthScreen,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  itemButton1: {
    width: '35%',
    marginTop: moderateScale(15),
    height: moderateScale(45),
  },
  itemButton2: {
    // backgroundColor: Color.colorButtonNone,
    width: '35%',
    marginLeft: -1,
    marginTop: moderateScale(15),
    height: moderateScale(45),
  },
  textButton: {
    alignSelf: 'center',
    resizeMode: 'stretch',
    width: widthScreen * 0.35,
    height: moderateScale(40),
  },
  viewScroll: {
    width: widthScreen - moderateScale(50),
    backgroundColor: Color.white,
  },

  imageAllMode: {
    resizeMode: 'contain',
    width: isIpX ? moderateScale(160) : moderateScale(120),
    height: isIpX ? moderateScale(120) : moderateScale(80),
    alignSelf: 'center',
  },
  imageMode1: {
    position: 'absolute',
    resizeMode: 'contain',
    width: isIpX ? moderateScale(56) : moderateScale(40),
    height: isIpX ? moderateScale(56) : moderateScale(40),
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
    width: isIpX ? moderateScale(56) : moderateScale(40),
    height: isIpX ? moderateScale(56) : moderateScale(40),
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
    width: isIpX ? moderateScale(56) : moderateScale(40),
    height: isIpX ? moderateScale(56) : moderateScale(40),
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
    alignSelf: 'center',
    marginTop: scales.vertical(10),
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
    height: isIpX ? moderateScale(100) : moderateScale(80),
    width: moderateScale(180),
    top: '9%',
    color: Color.black,
    fontFamily: 'HuiFont',
    fontSize: scales.horizontal(20),
  },
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
  viewRadio: {
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
  dropDown: {
    margin: 0,
    fontSize: moderateScale(20),
    color: Color.textColor,
    textAlignVertical: 'center',
  },
  textDropDown: {
    backgroundColor: 'white',
    borderColor: '#D4D4D8',
    fontFamily: 'HuiFont',
    lineHeight: moderateScale(35),
    height: scales.moderate(35),
    fontSize: moderateScale(20),
    width: scales.horizontal(250),
    textAlign: 'center',
    alignSelf: 'center',
  },
  textInputModal: {
    width: widthScreen * 0.8,
    fontFamily: 'HuiFont',
    fontSize: moderateScale(20),
    paddingStart: scales.horizontal(5),
    paddingEnd: widthScreen * 0.08,
    textAlign: 'center',
    alignSelf: 'center',
    color: Color.black,
  },
  dropdownStyle: {
    width: widthScreen * 0.8,
    height: scales.vertical(106),
    flexWrap: 'nowrap',
    marginTop: moderateScale(10),
    backgroundColor: Color.white,
  },
  viewDropDown: {
    width: '80%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderColor: '#D4D4D8',
    borderWidth: 1,
    borderRadius: scales.moderate(10),
    height: scales.moderate(40),
    backgroundColor: 'white',
  },
  viewArrowDown: {
    position: 'absolute',
    width: scales.horizontal(15),
    height: scales.vertical(25),
    right: 0,
    marginEnd: scales.horizontal(10),
  },
  viewContinue: {
    width: '70%',
    height: scales.vertical(50),
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(3),
    borderColor: Color.white,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Color.brown,
    marginVertical: verticalScale(20),
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
});
