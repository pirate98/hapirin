/* eslint-disable radix */
/**
 * Creat habit screen
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
import Constants, {
  BASE_URL,
  API_GET_HtpRd,
  API_GET_HDATE_UP,
  API_HABIT_UP,
  regexEmoji,
  regexVietnameseChar,
  isIpX,
  API_GET_HABIT,
} from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import {I18n} from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import {Color} from '../../colors/Colors';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';
import TextFont from '../../commons/components/TextFont';
import {getUserInfo} from '../../databases/StorageServices';
import NotificationHandle from '../../../Notification';
import DateTimeUtil from '../../commons/DateTimeUtil';
import scales from '../../styles/scales';
import FastImage from '@d11/react-native-fast-image';
import ScrollPicker from '../../utils/ScrollPicker';
import platforms from '../../utils/platforms';
const {TaskManager} = NativeModules;

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

var widthScreen = Dimensions.get('window').width; //full width
var heightScreen = Dimensions.get('window').height; //full height

export default class CreateHabit extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig(); //set initial config
    const {position} = this.props;
    this.indexRadio = -1;
    this.press = false;
    this.state = {
      userInfo: '',
      position: position,
      title_habit: '',
      cheering_habit: '',
      type_habit: -1,
      enableNotification: false,
      hours_min: '',
      hour: '00',
      min: '00',
      clickNotification: false,
      isLoading: false,
      isShowModalExplain: false,
      mode: undefined,
      listHabit: [],
    };

    this.backHandler = null;
  }

  componentDidMount() {
    // register hardware back button listener
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate({
        position: this.state.position,
        ID: this.state.userInfo.ID,
      });
      return true;
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

    if (this.state.position === 3 || this.state.position < 0) {
      this.setState({type_habit: Constants.MODE_HEALTH});
    } else {
      this.setState({type_habit: this.state.position});
    }
  }

  componentWillUnmount() {
    // unregister hardware back button listener
    this.backHandler.remove()
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
    this.props.navigation.navigate({
      position: this.state.position,
      ID: this.state.userInfo.ID,
    });
  };

  onSelect(value) {
    this.setState({type_habit: value});
  }

  onSelectedIndex() {
    if (this.state.type_habit !== 0) {
      return this.state.type_habit;
    } else {
      return 0;
    }
  }

  onToggleSwitch = value => {
    //todo: lấy time lúc bật notification
    this.setState({
      clickNotification: value,
      enableNotification: value,
    });
  };

  renderTextNotification() {
    if (this.state.enableNotification) {
      return (
        <TextFont
          content={translate('enable_notification_tomorrow')}
          style={{
            color: Color.textColor,
            fontSize: moderateScale(15),
            marginStart: moderateScale(10),
            marginBottom: scales.vertical(5),
          }}
        />
      );
    }
  }

  renderSwitch() {
    if (this.state.enableNotification) {
      return (
        <Switch
          trackColor={{
            true: Color.trackColorTrue,
          }}
          style={styles.viewSwitch}
          onValueChange={this.onToggleSwitch}
          // disabled={true}
          thumbColor={Color.trackColorFalse}
          value={this.state.enableNotification}
        />
      );
    } else {
      return (
        <Switch
          trackColor={{
            true: Color.trackColorTrue,
          }}
          style={styles.viewSwitch}
          onValueChange={this.onToggleSwitch}
          value={this.state.enableNotification}
        />
      );
    }
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
              selectedIndex={0}
              renderItem={(data, index, isSelected) => {
                <Text style={styles.textDateTime}>{data.toString()}</Text>;
              }}
              onValueChange={(data, selectedIndex) => {
                this.setState({
                  hour: data,
                });
              }}
              wrapperHeight={verticalScale(80)}
              wrapperWidth={moderateScale(15)}
              wrapperBackground={Color.cl_border_transparent}
              itemHeight={verticalScale(25)}
              highlightColor={'#d8d8d8'}
              highlightBorderWidth={2}
              activeItemColor={'#222121'}
              itemColor={'#B4B4B4'}
            />
            <ScrollPicker
              dataSource={Constants.minutesArray}
              selectedIndex={0}
              renderItem={(data, index, isSelected) => {
                <Text style={styles.textDateTime}>{data.toString()}</Text>;
              }}
              onValueChange={(data, selectedIndex) => {
                this.setState({
                  min: data,
                });
              }}
              wrapperHeight={verticalScale(80)}
              wrapperWidth={moderateScale(15)}
              wrapperBackground={Color.cl_border_transparent}
              itemHeight={verticalScale(25)}
              highlightColor={'#d8d8d8'}
              highlightBorderWidth={2}
              activeItemColor={'#222121'}
              itemColor={'#B4B4B4'}
            />
          </View>
        </View>
      );
    }
  }

  /**
   * schedule push notification using NCMB from native code
   *
   */
  scheduleSendPushNotification = async idHabit => {
    if (this.state.enableNotification) {
      if (Platform.OS === 'android') {
        const response = await NotificationHandle.registerPushCreateAndroid(
          this.state.userInfo.ID,
          // idHabit,
          this.state.title_habit,
          this.state.hours_min,
        );
        if (response === 'error') {
          //schedule push notification get error
          this.comebackListHabit();
        } else {
          // schedule push notification success
          this.requestHtpRd(this.state.userInfo.ID);
        }
      } else {
        // schedule push for ios
        TaskManager.registerPushNotificationCreate(
          {
            id: `${this.state.userInfo.ID}`,
            // idHabit: `${idHabit}`,
            addWd: `${this.state.title_habit}`,
            time: `${this.state.hours_min}`,
          },
          (error, task) => {
            if (error) {
              this.comebackListHabit();
            } else {
              this.requestHtpRd(this.state.userInfo.ID);
            }
          },
        );
        // this.requestHtpRd(this.state.userInfo.ID);
      }
    } else {
      this.comebackListHabit();
    }
  };

  requestHtpRd = ID => {
    fetch(BASE_URL + API_GET_HtpRd, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='.concat(ID),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        let createdHabit = responseJson[responseJson.length - 1];
        this.requestHdateUp(createdHabit);
      })
      .catch(error => {
        this.setState({
          isLoading: false,
        });
        console.log(error);
      });
  };

  requestHdateUp = itemHabit => {
    fetch(BASE_URL + API_GET_HDATE_UP, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'HID='
        .concat(itemHabit.ID)
        .concat('&Hdate=')
        .concat(DateTimeUtil.getTomorrowDate(new Date())),
    })
      .then(response => {
        return response.json();
      })
      .then(() => {
        this.comebackListHabit();
      })
      .catch(error => {
        console.log(error);
        this.comebackListHabit();
      });
  };

  comebackListHabit = () => {
    this.setState({isLoading: false});
    //nagative to list with position
    this.props.navigation.pop()
    this.props.navigation.state.params.onBack({
      position: this.state.type_habit,
      ID: this.state.userInfo.ID,
      refresh: new Date().getTime(),
    });
  };

  saveHabit() {
    if (this.state.title_habit.length === 0) {
      Alert.alert(
        translate('warning_dialog'),
        translate('content_warning_dialog'),
        [
          {
            text: translate('sure_recognition_dialog'),
            onPress: () => {
              this.press = false;
            },
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else {
      if (this.state.enableNotification) {
        var hour =
          parseInt(this.state.hour) < 10
            ? '0' + parseInt(this.state.hour)
            : parseInt(this.state.hour);
        var minute =
          parseInt(this.state.min) < 10
            ? '0' + parseInt(this.state.min)
            : parseInt(this.state.min);
        this.setState(
          {
            hours_min: `${hour}${minute}`,
            isLoading: true,
          },
          () => {
            this.callApiCreateHabit();
          },
        );
      } else {
        this.setState(
          {
            hours_min: '0000',
            isLoading: true,
          },
          () => {
            this.callApiCreateHabit();
          },
        );
      }
    }
  }

  callApiCreateHabit = () => {
    fetch(BASE_URL + API_HABIT_UP, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'ID='
        .concat('')
        .concat('&Name=')
        .concat(this.state.userInfo.ID)
        .concat('&SelJob=')
        .concat(this.state.type_habit)
        .concat('&AddWd=')
        .concat(this.state.title_habit)
        .concat('&PraiseWd=')
        .concat(this.state.cheering_habit)
        .concat('&SelSend=')
        .concat(this.state.enableNotification ? 0 : 1) // 0 is enable push else disable
        .concat('&SetTime=')
        .concat(this.state.hours_min)
        .concat('&InpMsg=')
        .concat(''),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson === 'insert') {
          //sau khi create thành công
          // get list theo mode vừa tạo, lấy id mới nhất để tạo push notification
          this.getIdToCreatePush();
        } else {
          this.comebackListHabit();
        }
      })
      .catch(() => {
        this.comebackListHabit();
      });
  };

  getIdToCreatePush() {
    let path = '';
    switch (this.state.type_habit) {
      case Constants.MODE_HEALTH: {
        path = 'HabitRd2.php';
        break;
      }
      case Constants.MODE_LEARNING: {
        path = 'HabitRd3.php';
        break;
      }
      case Constants.MODE_CONTRIBUTION: {
        path = 'HabitRd4.php';
        break;
      }
    }

    fetch(BASE_URL + API_GET_HABIT.concat(path), {
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
        this.setState(
          {
            listHabit: responseJson,
          },
          () => {
            let idHabit = this.state.listHabit[this.state.listHabit.length - 1];
            this.scheduleSendPushNotification(idHabit.ID);
          },
        );
      })
      .catch(error => {
        console.error(error);
      });
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
      this.state.title_habit
        .trim()
        .replace(/[&\{\}\[\]\\\/]/gi, '')
        .replace(regexEmoji, '')
        .replace(regexVietnameseChar, '') === ''
    ) {
      this.setState({
        title_habit: '',
      });
    } else {
      this.setState({
        title_habit: this.state.title_habit
          .trim()
          .replace(/[&\{\}\[\]\\\/]/gi, '')
          .replace(regexEmoji, '')
          .replace(regexVietnameseChar, ''),
      });
    }
  };

  checkContentInputWordTable = () => {
    if (
      this.state.cheering_habit
        .trim()
        .replace(/[&\{\}\[\]\\\/]/gi, '')
        .replace(regexEmoji, '')
        .replace(regexVietnameseChar, '') === ''
    ) {
      this.setState({
        cheering_habit: '',
      });
    } else {
      this.setState({
        cheering_habit: this.state.cheering_habit
          .trim()
          .replace(/[&\{\}\[\]\\\/]/gi, '')
          .replace(regexEmoji, '')
          .replace(regexVietnameseChar, ''),
      });
    }
  };

  renderNotificationNote() {
    if (this.state.clickNotification) {
      return (
        <View style={[styles.content, styles.viewBackgroundNotification]}>
          <View style={styles.viewNotificationImg}>
            <FastImage
              style={styles.imageDialogNotification}
              source={require('../../resources/images/e-12-1.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
            <TouchableOpacity
              style={styles.viewConfirm}
              onPress={() => {
                this.setState({clickNotification: false});
              }}>
              <Text style={styles.textConfirm}>{translate('all_right')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

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

        {/* <View style={styles.viewContent}> */}
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
                  onChangeText={title => {
                    this.setState({title_habit: title});
                  }}
                  onBlur={() => this.checkContentInputTitle()}>
                  {this.state.title_habit}
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
                  onChangeText={wordTable => {
                    this.setState({cheering_habit: wordTable});
                  }}
                  onBlur={() => this.checkContentInputWordTable()}>
                  {this.state.cheering_habit}
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
                  {this.renderTextNotification()}
                </View>
                {this.renderSwitch()}
              </View>

              {this.renderTimePicker()}

              <TouchableOpacity
                style={styles.viewCreate}
                onPress={() => {
                  if (!this.press) {
                    this.press = true;
                    this.saveHabit();
                  }
                }}>
                <View style={styles.borderViewCreate}>
                  <Text style={styles.textCreate}>{translate('decision')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {/* </View> */}
        {this.renderNotificationNote()}
        {this.showModalExplain()}
        {this.renderActivityIndicator()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
  viewContent: {
    height:
      Platform.OS === 'ios'
        ? heightScreen - moderateScale(60)
        : heightScreen - moderateScale(60) - StatusBar.currentHeight,
  },
  imageTitle: {
    width: '40%',
    height: moderateScale(35),
    resizeMode: 'contain',
    marginBottom: moderateScale(5),
    marginTop: moderateScale(15),
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
    paddingHorizontal: scales.horizontal(5),
    alignItems: 'center',
    paddingVertical: 1,
    textAlignVertical: 'center',
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
    paddingEnd: scales.horizontal(15),
    alignItems: 'center',
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
  },
  viewCreate: {
    flex: 1,
    flexDirection: 'row',
    marginTop: scales.vertical(15),
    marginBottom: scales.vertical(10),
    alignSelf: 'center',
  },
  borderViewCreate: {
    paddingVertical: scales.vertical(8),
    paddingHorizontal: moderateScale(80),
    backgroundColor: Color.colorSetting,
    borderRadius: moderateScale(5),
    borderColor: Color.borderColorButton,
    borderWidth: 2,
  },
  textCreate: {
    textAlign: 'center',
    fontSize: moderateScale(25),
    color: 'white',
    fontFamily: 'HuiFont',
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
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  viewConfirm: {
    backgroundColor: Color.colorSetting,
    alignSelf: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(5),
  },
  textConfirm: {
    textAlign: 'center',
    fontSize: moderateScale(25),
    color: 'white',
    fontFamily: 'HuiFont',
  },
  viewTime: {
    width: '100%',
    flexDirection: 'row',
    marginTop:
      Platform.OS === 'android' ? moderateScale(-10) : moderateScale(20),
  },
  imageTime: {
    height: moderateScale(25),
    resizeMode: 'contain',
    width: '28%',
    position: 'absolute',
    top: '20%',
  },
  viewPicker: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    resizeMode: 'contain',
    width: '40%',
    marginBottom: moderateScale(-5),
    flexDirection: 'row',
  },
  activityIndicatorStyle: {
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
    color: Constants.BACKGROUND_COLOR_TOOLBAR,
  },
  viewNotificationImg: {
    backgroundColor: 'white',
    // padding: moderateScale(20),
    borderColor: Color.red,
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(5),
    width: '80%',
    height: isIpX ? '60%' : '70%',
    alignSelf: 'center',
  },
  viewBackgroundNotification: {
    justifyContent: 'center',
    position: 'absolute',
    height: heightScreen,
    width: widthScreen,
    backgroundColor: Color.backgroundTransparent,
  },
  viewIndicator: {
    backgroundColor: Color.background_transparent,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  textDateTime: {
    width: moderateScale(25),
    fontSize: moderateScale(22),
    textAlign: 'center',
  },
  viewAllExplain: {
    flexDirection: 'row',
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
  viewExplain: {
    justifyContent: 'center',
    flex: 1 / 3,
    alignItems: 'center',
    marginHorizontal: moderateScale(3),
  },
  viewBorderIntroduce: {
    backgroundColor: Color.background_transparent,
    width: widthScreen,
    height: heightScreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    width: '85%',
    height: '85%',
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
});
