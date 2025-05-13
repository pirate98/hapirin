/* eslint-disable radix */
/**
 * Create preview habit screen
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
  Switch,
  Dimensions,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Modal,
  NativeModules,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';
import {Actions} from 'react-native-router-flux';
import Constants, {
  BASE_URL,
  API_GET_INF0_HID_PREVIEW,
  API_DELETE_HABIT,
  API_HABIT_UP,
  regexEmoji,
  regexVietnameseChar,
  isIpX,
} from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import {Color} from '../../colors/Colors';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';
import Navigation from '../navigation/Navigation';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import NotificationHandle from '../../../Notification';
import scales from '../../styles/scales';
import FastImage from '@d11/react-native-fast-image';
import ScrollPicker from '../../utils/ScrollPicker';
import {getUserInfo} from '../../databases/StorageServices';
import moment from 'moment';
import platforms from '../../utils/platforms';
const {TaskManager} = NativeModules;

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

export default class PreviewHabit extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig(); //set initial config
    const {position, idHabit, Name, hour, min} = this.props;
    this.indexRadio = -1;
    this.press = false;
    this.enableUpdate = false;
    this.state = {
      idHabit: idHabit,
      position: position,
      userInfo: '',
      name: Name,
      title: '',
      wordTable: '',
      modeHabit: 0,
      enableNotification: false,
      hour: hour,
      min: min,
      timeSequence: '',
      isLoading: false,
      habit: [],
      isShowModalExplain: false,
      mode: undefined,
    };
  }

  componentDidMount() {
    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (this.state.position === 5) {
        Actions.pop();
        return true;
      } else {
        Navigation.gotoListHabit({
          position: this.state.position,
          ID: this.state.name,
        });
        return true;
      }
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
    getUserInfo()
      .then(userInfo => {
        this.setState({
          userInfo: userInfo[0],
        });
      })
      .catch(error => {
        console.error(error);
      });
    this.setState(
      {
        isLoading: true,
      },
      () => {
        this.getDataFromIdHabit();
      },
    );
  }

  getDataFromIdHabit() {
    fetch(BASE_URL + API_GET_INF0_HID_PREVIEW, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
      }),
      body: 'ID='.concat(this.state.idHabit),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        this.setState(
          {
            habit: responseJson,
            isLoading: false,
          },
          () => {
            for (var item of this.state.habit) {
              this.setState({
                title: item.AddWd,
                modeHabit: item.SelJob,
                wordTable: item.PraiseWd,
                enableNotification: this.getValueNotification(item.SelSend),
                time: this.getTime(item.SetTime),
              });
            }
          },
        );
      })
      .catch(error => {
        this.setState({
          isLoading: false,
        });
        console.log('Error =>>> ' + error);
      });
  }

  getValueNotification(selSend) {
    return selSend === '0' ? true : false;
  }

  getTime(time) {
    if (time !== '') {
      var hours = time.slice(0, 2);
      var minute = time.slice(time.length - 2, time.length);
      this.setState({
        hour: hours,
        min: minute,
        timeSequence: `${hours}${minute}`,
      });
      return hours + ':' + minute;
    }
    return time;
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
    if (
      this.state.title !== this.state.habit[0].AddWd ||
      this.state.modeHabit !== this.state.habit[0].SelJob ||
      this.state.wordTable !== this.state.habit[0].PraiseWd ||
      (this.state.enableNotification ? '0' : '1') !==
        this.state.habit[0].SelSend ||
      parseInt(`${this.state.hour}${this.state.min}`) !==
        parseInt(this.state.habit[0].SetTime)
    ) {
      this.updateInfoHabit('back');
    } else {
      this.enableUpdate = false;
      Actions.pop({
        position: this.state.position,
        ID: this.state.name,
      });
      return true;
    }
  };

  onSelect(value) {
    this.setState({modeHabit: value});
    this.enableUpdate = true;
  }

  onToggleSwitch = value => {
    this.setState({
      enableNotification: value,
    });
    this.enableUpdate = true;
    if (this.state.enableNotification) {
      this.setState({
        hour: '00',
        min: '00',
      });
    }
  };

  renderSwitch() {
    return (
      <Switch
        trackColor={{
          true: Color.trackColorTrue,
        }}
        style={styles.viewSwitch}
        thumbColor={
          this.state.enableNotification
            ? Color.trackColorFalse
            : Color.trackColorFalse
        }
        onValueChange={this.onToggleSwitch}
        value={this.state.enableNotification}
      />
    );
  }

  renderTimePicker() {
    if (this.state.enableNotification) {
      return (
        <View style={styles.viewTime}>
          <FastImage
            style={styles.imageTime}
            source={require('../../resources/images/e-13-4.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
          <View style={{width: '28%'}} />
          <View style={{width: '32%'}} />
          <View style={styles.viewPicker}>
            <ScrollPicker
              dataSource={Constants.hoursArray}
              selectedIndex={parseInt(this.state.hour)}
              renderItem={(data, index, isSelected) => {
                return (
                  <Text style={styles.textDateTime}>{data.toString()}</Text>
                );
              }}
              onValueChange={(data, selectedIndex) => {
                this.enableUpdate = true;
                this.setState({
                  hour: data,
                });
              }}
              wrapperHeight={verticalScale(80)}
              wrapperBackground={Color.cl_border_transparent}
              itemHeight={verticalScale(25)}
              highlightColor={'#d8d8d8'}
              highlightBorderWidth={2}
              activeItemColor={Color.black}
              itemColor={'#B4B4B4'}
            />

            <ScrollPicker
              dataSource={Constants.minutesArray}
              selectedIndex={parseInt(this.state.min)}
              renderItem={(data, index, isSelected) => {
                return (
                  <Text style={styles.textDateTime}>{data.toString()}</Text>
                );
              }}
              onValueChange={(data, selectedIndex) => {
                this.enableUpdate = true;
                this.setState({
                  min: data,
                });
              }}
              wrapperHeight={verticalScale(80)}
              wrapperBackground={Color.cl_border_transparent}
              itemHeight={verticalScale(25)}
              highlightColor={'#d8d8d8'}
              highlightBorderWidth={2}
              activeItemColor={Color.black}
              itemColor={'#B4B4B4'}
            />
          </View>
          {!this.state.enableNotification ? (
            <View style={styles.viewTimeDisable} />
          ) : null}
        </View>
      );
    }
  }

  deleteHabit() {
    Alert.alert(
      translate('warning_dialog'),
      translate('content_delete_dialog'),
      [
        {
          text: 'Yes',
          onPress: () => {
            fetch(BASE_URL + API_DELETE_HABIT, {
              method: 'POST',
              headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
              }),
              body: 'ID='.concat(this.state.idHabit),
            })
              .then(response => {
                return response.json();
              })
              .then(responseJson => {
                //cancel push notification
                if (this.state.habit[0].SelSend === '0') {
                  this.deletePushNotification(
                    this.state.name,
                    this.state.title,
                    this.state.timeSequence,
                  );
                } else {
                  this.comebackListHabit();
                }
              });
          },
        },
        {
          text: 'No',
          onPress: () => {
            this.setState({isLoading: false});
          },
          style: 'cancel',
        },
      ],
      {cancelable: false},
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

  checkContentInputTitle = () => {
    if (
      this.state.title
        .trim()
        .replace(/[&\{\}\[\]\\\/]/gi, '')
        .replace(regexEmoji, '')
        .replace(regexVietnameseChar, '') === ''
    ) {
      this.setState({
        title: '',
      });
    } else {
      this.setState({
        title: this.state.title
          .trim()
          .replace(/[&\{\}\[\]\\\/]/gi, '')
          .replace(regexEmoji, '')
          .replace(regexVietnameseChar, ''),
      });
    }
  };

  checkContentInputWordTable = () => {
    if (
      this.state.wordTable
        .trim()
        .replace(/[&\{\}\[\]\\\/]/gi, '')
        .replace(regexEmoji, '')
        .replace(regexVietnameseChar, '') === ''
    ) {
      this.setState({
        wordTable: '',
      });
    } else {
      this.setState({
        wordTable: this.state.wordTable
          .trim()
          .replace(/[&\{\}\[\]\\\/]/gi, '')
          .replace(regexEmoji, '')
          .replace(regexVietnameseChar, ''),
      });
    }
  };

  onSelectedIndex = () => {
    return this.state.modeHabit;
  };

  checkTitleHabit = () => {
    if (this.state.title === '') {
      Alert.alert(
        translate('warning_dialog'),
        translate('content_warning_dialog'),
        [
          {
            text: translate('sure_recognition_dialog'),
            onPress: () => {
              this.press = false;
              this.setState({
                isLoading: false,
              });
            },
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else {
      this.setState({isLoading: true}, () => {
        this.updateInfoHabit();
      });
    }
  };

  updateInfoHabit = mode => {
    if (mode === 'back') {
      Alert.alert(
        translate('warning_dialog'),
        translate('text_content_warning_update'),
        [
          {
            text: 'No',
            onPress: () => {
              // this.apiUpdateDate();
            },
          },
          {
            text: 'Yes',
            onPress: () => {
              if (mode === 'back') {
                Actions.pop({
                  position: this.state.position,
                  ID: this.state.name,
                });
              }
              this.press = false;
              this.setState({isLoading: false});
            },
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else {
      this.apiUpdateDate();
    }
  };

  apiUpdateDate = () => {
    let time = '';
    if (this.state.enableNotification) {
      var hour =
        parseInt(this.state.hour) < 10
          ? '0' + parseInt(this.state.hour)
          : parseInt(this.state.hour);
      var minute =
        parseInt(this.state.min) < 10
          ? '0' + parseInt(this.state.min)
          : parseInt(this.state.min);
      time = `${hour}${minute}`;
    } else {
      time = '0000';
    }
    if (!this.state.isLoading) {
      this.setState({
        isLoading: true,
      });
    }
    fetch(BASE_URL + API_HABIT_UP, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'ID='
        .concat(this.state.idHabit)
        .concat('&Name=')
        .concat(this.state.name)
        .concat('&SelJob=')
        .concat(this.state.modeHabit)
        .concat('&AddWd=')
        .concat(this.state.title)
        .concat('&PraiseWd=')
        .concat(this.state.wordTable)
        .concat('&SelSend=')
        .concat(this.state.enableNotification ? 0 : 1)
        .concat('&SetTime=')
        .concat(time)
        .concat('&InpMsg=')
        .concat(''),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson === 'update') {
          if (
            this.state.enableNotification ||
            ((this.state.enableNotification ? '0' : '1') === '1' &&
              this.state.habit[0].SelSend === '0')
          ) {
            if (
              (this.state.enableNotification ? '0' : '1') === '0' &&
              this.state.habit[0].SelSend === '1'
            ) {
              // nếu bật notification thì đăng kí push
              this.regiteserPushNotification(
                this.state.name,
                this.state.idHabit,
                this.state.title,
                time,
              );
            } else if (
              (this.state.habit[0].SetTime !== time ||
                this.state.title !== this.state.habit[0].AddWd) &&
              this.state.enableNotification
                ? '0'
                : '1' === '0'
            ) {
              // nếu thay đổi time or title thì update habit
              this.updatePushNotification(
                this.state.name,
                this.state.title,
                time,
                this.state.timeSequence,
                this.state.habit[0].AddWd,
              );
            } else {
              //todo: nếu tắt notification thì thực hiện cancel push notification
              //cancel push notification
              this.deletePushNotification(
                this.state.name,
                this.state.title,
                this.state.timeSequence,
              );
            }
          } else {
            this.comebackListHabit();
          }
        } else {
          this.comebackListHabit();
        }
      })
      .catch(() => {
        this.setState({isLoading: false});
        this.comebackListHabit();
      });
  };

  async regiteserPushNotification(userId, idHabit, title, time) {
    if (Platform.OS === 'android') {
      const response = await NotificationHandle.registerPushCreateAndroid(
        userId,
        title,
        time,
      );
      if (response === 'error') {
        //schedule push notification get error
        this.comebackListHabit();
      } else {
        // schedule push notification success
        this.comebackListHabit();
      }
    } else {
      // schedule push for ios
      TaskManager.registerPushNotificationCreate(
        {
          id: `${userId}`,
          addWd: `${title}`,
          time: `${time}`,
        },
        (error, task) => {
          if (error) {
            this.comebackListHabit();
          } else {
            this.comebackListHabit();
          }
        },
      );
    }
  }

  updatePushNotification(userId, title, time, timeOld, titleOld) {
    if (Platform.OS === 'android') {
      if (parseInt(timeOld) > parseInt(moment(moment()).format('hhmm'))) {
        // nếu thời gian push cũ lớn hơn thời gian hiện tại
        // thì update push đã đăng ký ngày hôm nay và ngày mai
        this.updatePushAndroid(1, userId, title, time, timeOld, titleOld);
      } else {
        // nếu thời gian push cũ nhỏ hơn thời gian hiện tại
        // thì chỉ update push đã đăng ký ngày hôm sau
        this.updatePushAndroid(2, userId, title, time, timeOld, titleOld);
      }
    } else {
      if (parseInt(timeOld) > parseInt(moment(moment()).format('hhmm'))) {
        // nếu thời gian push cũ lớn hơn thời gian hiện tại
        // thì update push đã đăng ký ngày hôm nay và ngày mai
        this.updatePushIos(1, userId, title, time, timeOld, titleOld);
      } else {
        // nếu thời gian push cũ nhỏ hơn thời gian hiện tại
        // thì chỉ update push đã đăng ký ngày hôm sau
        this.updatePushIos(2, userId, title, time, timeOld, titleOld);
      }
    }
  }

  updatePushAndroid(mode, userId, title, time, timeOld, titleOld) {
    let upDate;
    let oldDate;
    if (mode === 1) {
      upDate = `${moment().format('YYYYMMDD')}${time}`;
      oldDate = `${moment().format('YYYYMMDD')}${timeOld}`;
    } else {
      upDate = `${moment(moment())
        .add(1, 'days')
        .format('YYYYMMDD')}${time}`;
      oldDate = `${moment(moment())
        .add(1, 'days')
        .format('YYYYMMDD')}${timeOld}`;
    }
    NotificationHandle.updatePushNotification(
      userId,
      title,
      upDate,
      titleOld,
      oldDate,
    )
      .then(response => {
        if (response === 'error') {
          //schedule push notification get error
          this.comebackListHabit();
        } else {
          // schedule push notification success
          if (mode === 1) {
            this.updatePushAndroid(2, userId, title, time, timeOld, titleOld);
          } else {
            this.comebackListHabit();
          }
        }
      })
      .catch(error => {
        this.comebackListHabit();
      });
  }

  updatePushIos(mode, userId, title, time, timeOld, titleOld) {
    let upDate;
    let oldDate;
    if (mode === 1) {
      upDate = `${moment().format('YYYYMMDD')}${time}`;
      oldDate = `${moment().format('YYYYMMDD')}${timeOld}`;
    } else {
      upDate = `${moment(moment())
        .add(1, 'days')
        .format('YYYYMMDD')}${time}`;
      oldDate = `${moment(moment())
        .add(1, 'days')
        .format('YYYYMMDD')}${timeOld}`;
    }
    TaskManager.updatePushNotificationData(
      {
        id: `${userId}`,
        addWd: `${title}`,
        timeUp: `${upDate}`,
        addWdOld: `${titleOld}`,
        timeOld: `${oldDate}`,
      },
      (error, task) => {
        if (error) {
          this.comebackListHabit();
        } else {
          if (mode === 1) {
            this.updatePushIos(2, userId, title, time, timeOld, titleOld);
          } else {
            this.comebackListHabit();
          }
        }
      },
    );
  }

  deletePushNotification(userId, title, time) {
    if (Platform.OS === 'ios') {
      if (parseInt(time) > parseInt(moment(moment()).format('hhmm'))) {
        // nếu thời gian push lớn hơn thời gian hiện tại
        // thì xoá push đã đăng ký ngày hôm nay và ngày mai
        this.deletePushNotiDataIos(1);
      } else {
        // nếu thời gian push nhỏ hơn thời gian hiện tại
        // thì chỉ xoá push đã đăng ký ngày hôm sau
        this.deletePushNotiDataIos(2);
      }
    } else {
      if (parseInt(time) > parseInt(moment(moment()).format('hhmm'))) {
        // nếu thời gian push lớn hơn thời gian hiện tại
        // thì xoá push đã đăng ký ngày hôm nay và ngày mai
        this.deletePushAndroid(1);
      } else {
        // nếu thời gian push nhỏ hơn thời gian hiện tại
        // thì chỉ xoá push đã đăng ký ngày hôm sau
        this.deletePushAndroid(2);
      }
    }
  }

  deletePushAndroid(mode) {
    let delDate;
    if (mode === 1) {
      delDate = `${moment().format('YYYYMMDD')}${this.state.timeSequence}`;
    } else {
      delDate = `${moment(moment())
        .add(1, 'days')
        .format('YYYYMMDD')}${this.state.timeSequence}`;
    }
    NotificationHandle.cancelPushNotification(
      this.state.userInfo.ID,
      this.state.title,
      delDate,
    )
      .then(response => {
        if (response === 'error') {
          this.comebackListHabit();
        } else {
          if (mode === 1) {
            this.deletePushAndroid(2);
          } else {
            this.comebackListHabit();
          }
        }
      })
      .catch(e => {
        this.comebackListHabit();
      });
  }

  deletePushNotiDataIos = mode => {
    let delDate;
    if (mode === 1) {
      delDate = `${moment().format('YYYYMMDD')}${this.state.timeSequence}`;
    } else {
      delDate = `${moment(moment())
        .add(1, 'days')
        .format('YYYYMMDD')}${this.state.timeSequence}`;
    }
    TaskManager.deletePushNotificationData(
      {
        id: `${this.state.userInfo.ID}`,
        addWd: `${this.state.title}`,
        delDate: `${delDate}`,
      },
      (error, task) => {
        if (error) {
          this.comebackListHabit();
        } else {
          if (mode === 1) {
            this.deletePushNotiDataIos(2);
          } else {
            this.comebackListHabit();
          }
        }
      },
    );
  };

  comebackListHabit = () => {
    this.setState({isLoading: false});
    Actions.pop();
    this.props.navigation.state.params.onBack({
      position: this.state.position,
      ID: this.state.name,
      refresh: new Date().getTime(),
    });
  };

  showModalExplain() {
    if (this.state.mode === Constants.MODE_HEALTH) {
      return (
        <Modal transparent={true} visible={this.state.isShowModalExplain}>
          <View style={styles.viewBorderIntroduce}>
            <FastImage
              resizeMode={FastImage.resizeMode.contain}
              style={styles.background}
              source={require('../../resources/images/02_tutorial_images/02_tutorial_03.png')}
            />
            <TouchableOpacity
              onPress={async () => {
                this.setState({
                  isShowModalExplain: false,
                });
              }}
              style={styles.touchablehighlightcss}>
              <FastImage
                style={styles.exitbutton}
                source={require('../../resources/images/002.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      );
    } else if (this.state.mode === Constants.MODE_LEARNING) {
      return (
        <Modal transparent={true} visible={this.state.isShowModalExplain}>
          <View style={styles.viewBorderIntroduce}>
            <FastImage
              resizeMode={FastImage.resizeMode.contain}
              style={styles.background}
              source={require('../../resources/images/02_tutorial_images/02_tutorial_04.png')}
            />
            <TouchableOpacity
              onPress={async () => {
                this.setState({
                  isShowModalExplain: false,
                });
              }}
              style={styles.touchablehighlightcss}>
              <FastImage
                style={styles.exitbutton}
                source={require('../../resources/images/002.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      );
    } else {
      return (
        <Modal transparent={true} visible={this.state.isShowModalExplain}>
          <View style={styles.viewBorderIntroduce}>
            <FastImage
              resizeMode={FastImage.resizeMode.contain}
              style={styles.background}
              source={require('../../resources/images/02_tutorial_images/02_tutorial_05.png')}
            />
            <TouchableOpacity
              onPress={async () => {
                this.setState({
                  isShowModalExplain: false,
                });
              }}
              style={styles.touchablehighlightcss}>
              <FastImage
                style={styles.exitbutton}
                source={require('../../resources/images/002.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      );
    }
  }

  changeButtonUpdate() {
    if (this.enableUpdate) {
      return (
        <FastImage
          style={styles.textDelete}
          source={require('../../resources/images/e-14-5.png')}
          resizeMode={FastImage.resizeMode.contain}
        />
      );
    } else {
      return (
        <FastImage
          style={styles.textDelete}
          source={require('../../resources/images/e-14-5-2.png')}
          resizeMode={FastImage.resizeMode.contain}
        />
      );
    }
  }

  render() {
    return (
      <View style={styles.parent}>
        <Toolbar
          leftIcon="back"
          nameRightButton="none"
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          onClickRightButton={() => this.onClickRightButton()}
          title={Constants.SCREEN_CREATE_HABIT.TITLE}
        />
        <KeyboardAvoidingView
          behavior={platforms.isIOS ? 'padding' : null}
          enabled={platforms.isIOS}
          keyboardVerticalOffset={0}
          style={styles.content}>
          <ScrollView
            nestedScrollEnabled={true}
            // showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={'handled'}
            style={{flexGrow: 1}}>
            <View style={{paddingHorizontal: moderateScale(30)}}>
              <View>
                <FastImage
                  style={styles.imageTitle}
                  source={require('../../resources/images/e-14-1.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <TextInput
                  style={styles.textInput}
                  onChangeText={text => {
                    this.enableUpdate = true;
                    this.setState({
                      title: text,
                    });
                  }}
                  onBlur={() => this.checkContentInputTitle()}>
                  {this.state.title}
                </TextInput>
              </View>

              <RadioGroup
                color={Color.colorRadio}
                style={styles.viewRadio}
                selectedIndex={this.onSelectedIndex()}
                onSelect={(index, value) => this.onSelect(index, value)}>
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

              <View style={styles.viewAllExplain}>
                <TouchableOpacity
                  style={[
                    styles.viewExplain,
                    {
                      borderBottomWidth: moderateScale(1.5),
                      borderBottomColor: Color.cl_text_explain_telome,
                    },
                  ]}
                  onPress={() => {
                    this.setState({
                      isShowModalExplain: true,
                      mode: 0,
                    });
                  }}>
                  <Text style={styles.textTelome}>
                    {translate('txt_explain_telome')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.viewExplain,
                    {
                      borderBottomWidth: moderateScale(1.5),
                      borderBottomColor: Color.cl_text_explain_synapoo,
                    },
                  ]}
                  onPress={() => {
                    this.setState({
                      isShowModalExplain: true,
                      mode: 1,
                    });
                  }}>
                  <Text style={styles.textSynapoo}>
                    {translate('txt_explain_synapoo')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.viewExplain,
                    {
                      borderBottomWidth: moderateScale(1.5),
                      borderBottomColor: Color.cl_text_explain_cytosine,
                    },
                  ]}
                  onPress={() => {
                    this.setState({
                      isShowModalExplain: true,
                      mode: 2,
                    });
                  }}>
                  <Text style={styles.textCytosine}>
                    {translate('txt_explain_cytosine')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <FastImage
                  style={styles.imageTitle}
                  source={require('../../resources/images/e-14-2.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <TextInput
                  style={styles.textInput}
                  onChangeText={text => {
                    this.enableUpdate = true;
                    this.setState({
                      wordTable: text,
                    });
                  }}
                  onBlur={() => this.checkContentInputWordTable()}>
                  {this.state.wordTable}
                </TextInput>
                <FastImage
                  style={styles.imageNote}
                  source={require('../../resources/images/1_12_02_0309.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>

              <View style={styles.viewNotification}>
                <View style={styles.viewImageNotify}>
                  <FastImage
                    style={styles.imageNotify}
                    source={require('../../resources/images/e-13-3.png')}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </View>
                {this.renderSwitch()}
              </View>
              {this.renderTimePicker()}

              <View style={styles.viewButton}>
                <TouchableOpacity
                  style={styles.viewDelete}
                  onPress={() => {
                    this.setState({isLoading: true}, () => {
                      this.deleteHabit();
                    });
                  }}>
                  <FastImage
                    style={styles.textDelete}
                    source={require('../../resources/images/e-14-4.png')}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewDelete}
                  activeOpacity={this.enableUpdate ? 0.2 : 1}
                  onPress={() => {
                    if (
                      this.state.title !== this.state.habit[0].AddWd ||
                      this.state.modeHabit !== this.state.habit[0].SelJob ||
                      this.state.wordTable !== this.state.habit[0].PraiseWd ||
                      (this.state.enableNotification ? '0' : '1') !==
                        this.state.habit[0].SelSend ||
                      parseInt(`${this.state.hour}${this.state.min}`) !==
                        parseInt(this.state.habit[0].SetTime)
                    ) {
                      if (!this.press) {
                        this.press = true;
                        this.checkTitleHabit();
                      }
                    } else {
                      this.enableUpdate = false;
                    }
                  }}>
                  {this.changeButtonUpdate()}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {this.showModalExplain()}
        {this.renderActivityIndicator()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewIndicator: {
    backgroundColor: Color.background_transparent,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  viewBackground: {
    flex: 8,
    flexDirection: 'column',
    paddingHorizontal: moderateScale(30),
    position: 'absolute',
    backgroundColor: Color.backgroundPreview,
    width: widthScreen,
    height:
      Platform.OS === 'ios'
        ? heightScreen - moderateScale(50)
        : heightScreen - moderateScale(50) + StatusBar.currentHeight,
  },
  parent: {
    flex: 1,
    height:
      Platform.OS === 'ios'
        ? heightScreen
        : heightScreen - StatusBar.currentHeight,
    flexDirection: 'column',
  },
  toolbar: {
    flex: 2,
  },
  content: {
    flex: 8,
    flexDirection: 'column',
    backgroundColor: Color.backgroundSetting,
    // paddingHorizontal: moderateScale(30),
  },
  imageTitle: {
    width: '40%',
    height: moderateScale(35),
    resizeMode: 'contain',
    marginBottom: moderateScale(5),
    marginTop: moderateScale(10),
  },
  textInput: {
    borderRadius: moderateScale(5),
    borderColor: Color.borderColor,
    borderWidth: 0.6,
    paddingHorizontal: moderateScale(5),
    backgroundColor: Color.backgroundColorInput,
    height: moderateScale(40),
    fontFamily: 'HuiFont',
    fontSize: moderateScale(20),
    color: Color.black,
    alignItems: 'center',
    paddingVertical: 1,
    textAlignVertical: 'center',
  },
  viewRadio: {
    marginTop: scales.vertical(15),
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
  imageNote: {
    width: '100%',
    height: moderateScale(18),
    marginTop: moderateScale(8),
    resizeMode: 'contain',
  },
  viewNotification: {
    width: '100%',
    flexDirection: 'row',
    marginTop: moderateScale(20),
  },
  viewImageNotify: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
  },
  imageNotify: {
    height: moderateScale(30),
    resizeMode: 'contain',
    width: '28%',
  },
  viewSwitch: {
    transform: [{scaleX: 1.5}, {scaleY: 1.5}],
    marginRight: moderateScale(10),
  },
  viewDelete: {
    borderRadius: moderateScale(5),
    flex: 1,
    alignItems: 'center',
  },
  textDelete: {
    resizeMode: 'contain',
    width: widthScreen * 0.3,
    height: moderateScale(55),
  },
  backgroundDialog: {
    flex: 1,
    width: widthScreen - moderateScale(40),
    height: heightScreen,
    resizeMode: 'contain',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  imageDialogNotification: {
    flex: 1,
    top: moderateScale(50),
    width: widthScreen - moderateScale(60),
    height: heightScreen / 1.6,
    resizeMode: 'contain',
    position: 'absolute',
    alignSelf: 'center',
  },
  viewConfirm: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    bottom: heightScreen * 0.08,
    alignSelf: 'center',
    borderColor: Color.borderColorButton,
    borderWidth: 2,
    borderRadius: moderateScale(5),
  },
  textConfirm: {
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(10),
    paddingStart: moderateScale(40),
    paddingEnd: moderateScale(40),
    backgroundColor: Color.colorSetting,
    textAlign: 'center',
    fontSize: moderateScale(25),
    color: 'white',
    fontFamily: 'HuiFont',
    borderRadius: moderateScale(5),
  },
  viewTime: {
    width: '100%',
    flexDirection: 'row',
    marginTop: Platform.OS === 'android' ? moderateScale(5) : moderateScale(20),
  },
  imageTime: {
    height: moderateScale(25),
    resizeMode: 'contain',
    width: '28%',
    position: 'absolute',
    bottom: '30%',
  },
  viewPicker: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    width: '40%',
    marginTop: moderateScale(5),
  },
  textTime: {
    backgroundColor: Color.white,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: Color.backgroundSetting,
    fontSize: moderateScale(20),
    fontFamily: 'HuiFont',
    justifyContent: 'center',
    alignSelf: 'center',
    color: Color.black,
  },
  activityIndicatorStyle: {
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
    color: Constants.BACKGROUND_COLOR_TOOLBAR,
  },
  viewButton: {
    flexDirection: 'row',
    marginTop: scales.vertical(20),
    marginBottom: scales.vertical(10),
    alignSelf: 'center',
    width: '100%',
  },
  viewExplain: {
    justifyContent: 'center',
    flex: 1 / 3,
    marginHorizontal: moderateScale(3),
    alignItems: 'center',
  },
  textTelome: {
    color: Color.cl_text_explain_telome,
    fontSize: scales.moderate(13),
    textAlign: 'center',
    alignSelf: 'center',
  },
  textSynapoo: {
    color: Color.cl_text_explain_synapoo,
    fontSize: scales.moderate(13),
  },
  textCytosine: {
    color: Color.cl_text_explain_cytosine,
    fontSize: scales.moderate(13),
  },
  exitbutton: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    top: isIpX ? '20%' : '10%',
  },
  touchablehighlightcss: {
    width: '15%',
    height: '15%',
    alignSelf: 'flex-end',
    position: 'absolute',
    top:
      Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800)
        ? '10%'
        : '5%',
    right: 0,
  },
  background: {
    width: '85%',
    height: '85%',
  },
  viewBorderIntroduce: {
    backgroundColor: Color.background_transparent,
    width: widthScreen,
    height: heightScreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllExplain: {
    flexDirection: 'row',
  },
  textDateTime: {
    width: moderateScale(35),
    fontSize: moderateScale(22),
    textAlign: 'center',
  },
  viewTimeDisable: {
    width: '40%',
    height: '100%',
    position: 'absolute',
    marginTop: moderateScale(5),
    backgroundColor: Color.backgroundPreview,
    right: 0,
  },
});
