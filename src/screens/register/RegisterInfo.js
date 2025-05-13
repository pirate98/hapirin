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
  TouchableHighlight,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  NativeModules,
} from 'react-native';

import Navigation from '../navigation/Navigation';

import Toolbar from '../toolbar/Toolbar';
import Constants, {
  BASE_URL,
  API_REGISTER_INF0,
  API_GET_USER_INF0,
  regexJapanese,
  regexSpecialChar,
  regexEmoji,
  regexVietnameseChar,
  regexLatinChar,
} from '../../constants/Constants';
import TextFont from '../../commons/components/TextFont';
// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better

import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';

import ModalDropdown from 'react-native-modal-dropdown';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {insertUser} from '../../databases/StorageServices';
import {Color} from '../../colors/Colors';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SoundService from '../../soundService/SoundService';
import scales from '../../styles/scales';
import FastImage from 'react-native-fast-image';
const {TaskManager} = NativeModules;

var radio_props = [
  {label: 'ちゃん', value: 100},
  {label: 'くん', value: 101},
  {label: 'なし', value: 0},
];

const genderOption = [{title: '男性', data: 0}, {title: '女性', data: 1}];

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
const isIpX =
  Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800);

export default class RegisterInfo extends React.Component {
  constructor(props) {
    super(props);
    this.pressed = false;
    this.state = {
      id: '',
      password: '',
      nickname: '',
      endname: 'ちゃん',
      gender: '',
      age: '',
      isLoading: false,
      valueSelect: 0,
    };
    setI18nConfig(); //set initial config
  }

  async componentDidMount() {
    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      Navigation.gotoStart();
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);

    // audioBtn = await SoundService.loadSoundSel('sel.mp3');
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
    Navigation.gotoStart();
  };

  register() {
    if (
      this.state.id !== '' &&
      this.state.password !== '' &&
      this.state.nickname !== ''
    ) {
      if (!this.pressed) {
        this.pressed = true;
        this.setState({
          isLoading: true,
        });
        fetch(BASE_URL + API_REGISTER_INF0, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body: 'UserId='
            .concat(this.state.id)
            .concat('&PassWord=')
            .concat(this.state.password)
            .concat('&Mrs=')
            .concat(this.state.endname)
            .concat('&Name=')
            .concat(this.state.nickname)
            .concat('&Sex=')
            .concat(this.state.gender)
            .concat('&Year=')
            .concat(this.state.age),
        })
          .then(response => {
            return response.json();
          })
          .then(responseJson => {
            // this.setState({isLoading: false});
            if (responseJson !== '') {
              fetch(BASE_URL + API_GET_USER_INF0, {
                method: 'POST',
                headers: new Headers({
                  'Content-Type': 'application/x-www-form-urlencoded',
                }),
                body: 'UserId='
                  .concat(this.state.id)
                  .concat('&PassWord=')
                  .concat(this.state.password),
              })
                .then(response => {
                  return response.json();
                })
                .then(responseJsonUser => {
                  this.setState({isLoading: false});
                  if (responseJsonUser.length !== 0) {
                    const newUser = {
                      ID: responseJsonUser[0].ID,
                      UserId: responseJsonUser[0].UserId,
                      PassWord: responseJsonUser[0].PassWord,
                      Name: responseJsonUser[0].Name,
                      Mrs: responseJsonUser[0].Mrs,
                      Sex: responseJsonUser[0].Sex,
                      Year: responseJsonUser[0].Year,
                      DelFg: responseJsonUser[0].DelFg,
                    };
                    insertUser(newUser)
                      .then(() => {
                        Navigation.gotoConfirm();
                      })
                      .catch(error => {
                        this.setState({
                          isLoading: false,
                        });
                        alert(error);
                      });
                  } else {
                    this.setState({
                      isLoading: false,
                    });
                    this.pressed = false;
                    alert(translate('hapiboo_app_txt_cant_register_user'));
                  }
                })
                .catch(error => {
                  this.setState({
                    isLoading: false,
                  });
                  this.pressed = false;
                  console.log('Error =>>> ' + error);
                  alert(error);
                });
            } else {
              this.setState({
                isLoading: false,
              });
              console.log('Get data error!');
            }
          })
          .catch(error => {
            console.log('Error =>>> ' + error);
            this.setState({
              isLoading: false,
            });
            if (error === 'TypeError: Network request failed') {
              alert(error);
            }
          });
      }
    } else {
      Alert.alert(
        translate('warning_dialog'),
        translate('dialog_warning_register_info'),
        [
          {
            text: translate('sure_recognition_dialog'),
            onPress: () => {
              this.pressed = false;
            },
          },
        ],
      );
    }
  }

  checkContentInputId = () => {
    if (
      this.state.id
        .trim()
        // .replace(regexJapanese, '')
        // .replace(regexSpecialChar, '')
        .replace(regexEmoji, '')
        .replace(regexVietnameseChar, '') === ''
    ) {
      this.setState({
        id: '',
      });
    } else {
      this.setState({
        id: this.state.id
          .trim()
          // .replace(regexJapanese, '')
          // .replace(regexSpecialChar, '')
          .replace(regexEmoji, '')
          .replace(regexVietnameseChar, ''),
      });
    }
  };
  checkContentInputPass = () => {
    if (
      this.state.password
        .trim()
        // .replace(regexJapanese, '')
        // .replace(regexSpecialChar, '')
        .replace(regexEmoji, '')
        .replace(regexVietnameseChar, '') === ''
    ) {
      this.setState({
        password: '',
      });
    } else {
      this.setState({
        password: this.state.password
          .trim()
          // .replace(regexJapanese, '')
          // .replace(regexSpecialChar, '')
          .replace(regexEmoji, '')
          .replace(regexVietnameseChar, ''),
      });
    }
  };
  checkContentInputNickName = () => {
    if (
      this.state.nickname
        .trim()
        .replace(regexEmoji, '')
        .replace(regexVietnameseChar, '') === ''
      // .replace(regexSpecialChar, '')
      // .this.state.nickname.replace(regexLatinChar, '') === ''
    ) {
      this.setState({
        nickname: '',
      });
    } else {
      this.setState({
        nickname: this.state.nickname
          .trim()
          .replace(regexEmoji, '')
          .replace(regexVietnameseChar, ''),
        // .replace(regexSpecialChar, ''),
        // .replace(regexLatinChar, ''),
      });
    }
  };

  render() {
    const {isLoading} = this.state;
    return (
      <View style={styles.parent}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <Toolbar
          leftIcon="back"
          nameRightButton="none"
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          onClickRightButton={() => this.onClickRightButton()}
          title={Constants.SCREEN_REGISTER_INFO.TITLE}
        />
        <KeyboardAwareScrollView style={styles.content}>
          <View style={styles.viewContent}>
            <FastImage
              style={styles.image}
              source={require('../../resources/images/c-3-1.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
            <View style={styles.viewInput}>
              <View style={styles.infoGroup}>
                <TextFont
                  content={translate('register_info_text_id')}
                  style={styles.textInfo}
                />
                <TextFont
                  content={translate('register_info_text_input_pass')}
                  style={styles.textInfo}
                />
                <TextFont
                  content={translate('register_info_text_input_nickname')}
                  style={styles.textInfo}
                />
                <TextFont
                  content={translate('register_info_text_radio_name')}
                  style={[styles.textInfo, styles.textRadioName]}
                />
                <TextFont
                  content={translate('register_info_text_dropdown_sex')}
                  style={[styles.textInfo, styles.textDropdownSex]}
                />
                <TextFont
                  content={translate('register_info_text_input_year')}
                  style={[styles.textInfo, styles.textInputYear]}
                />
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.textInput, {marginTop: moderateScale(5)}]}
                  onChangeText={text => {
                    this.setState({id: text});
                  }}
                  placeholder={translate('register_info_placeholder_id')}
                  placeholderTextColor={Color.cl_item_history_selected}
                  onBlur={() => this.checkContentInputId()}>
                  {this.state.id}
                </TextInput>
                <TextInput
                  style={styles.textInput}
                  onChangeText={text => this.setState({password: text})}
                  placeholderTextColor={Color.cl_item_history_selected}
                  placeholder={translate(
                    'register_info_placeholder_input_pass',
                  )}
                  onBlur={() => this.checkContentInputPass()}>
                  {this.state.password}
                </TextInput>
                <TextInput
                  style={styles.textInput}
                  onChangeText={text => this.setState({nickname: text})}
                  placeholder={translate('register_info_placeholder_nickname')}
                  placeholderTextColor={Color.cl_item_history_selected}
                  onBlur={() => this.checkContentInputNickName()}>
                  {this.state.nickname}
                </TextInput>
                <RadioForm
                  style={styles.radioGroup}
                  formHorizontal={true}
                  animation={true}>
                  {radio_props.map((obj, i) => {
                    var onPress = async (value, index) => {
                      await SoundService.loadSoundSel('sel.mp3');
                      this.setState({
                        endname: radio_props[index].label,
                        valueSelect: index,
                      });
                    };
                    return (
                      <RadioButton labelHorizontal={true} key={i}>
                        <RadioButtonInput
                          obj={obj}
                          index={i}
                          borderWidth={1}
                          isSelected={this.state.valueSelect === i}
                          onPress={onPress}
                          buttonInnerColor={'black'}
                          buttonOuterColor={
                            this.state.valueSelect === i ? 'black' : 'gray'
                          }
                          buttonSize={moderateScale(8)}
                          buttonStyle={{margin: moderateScale(8)}}
                        />
                        <RadioButtonLabel
                          obj={obj}
                          index={i}
                          onPress={onPress}
                          labelStyle={styles.labelStyle}
                          labelWrapStyle={{}}
                        />
                      </RadioButton>
                    );
                  })}
                </RadioForm>
                <View style={styles.viewDropDown}>
                  <FastImage
                    resizeMode={FastImage.resizeMode.contain}
                    source={require('../../resources/images/2_10_5.png')}
                    style={styles.iconDropDown}
                  />
                  <ModalDropdown
                    style={styles.containerDropDown}
                    options={genderOption}
                    defaultValue={translate(
                      'txt_default_modal_dropdown_choose_sex',
                    )}
                    textStyle={styles.textStyleDropdown}
                    dropdownTextStyle={styles.dropdownTextStyle}
                    dropdownStyle={styles.dropdownStyle}
                    onSelect={(idx, value) =>
                      this.setState({gender: value.title})
                    }
                    renderButtonText={rowData =>
                      this._dropdown_2_renderButtonText(rowData)
                    }
                    renderRow={this._dropdown_2_renderRow.bind(this)}
                  />
                </View>

                <View style={styles.viewChooseYear}>
                  <TextInput
                    style={styles.textInput}
                    numeric
                    keyboardType={'numeric'}
                    onChangeText={text => this.setState({age: text})}
                    maxLength={4}
                  />
                  <Text style={styles.textYear}>
                    {translate('register_info_text_year_old')}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.buttonCharing}
              onPress={() => {
                // Navigation.gotoConfirm();
                this.register();
              }}>
              <Text style={styles.textCharing}>
                {translate('button_register_info_user')}
              </Text>
            </TouchableOpacity>
          </View>
          {isLoading && (
            <ActivityIndicator
              style={styles.loading}
              color={Constants.BACKGROUND_COLOR_TOOLBAR}
              size="large"
            />
          )}
        </KeyboardAwareScrollView>
      </View>
    );
  }

  handleInputChange = text => {
    if (/^[0-9]+$/.test(text)) {
      this.setState({
        age: text,
      });
    }
  };

  _dropdown_2_renderButtonText(rowData) {
    const {title} = rowData;
    return `${title}`;
  }

  _dropdown_2_renderRow(rowData) {
    return (
      <TouchableHighlight>
        <Text style={styles.textDropDown}>{`${rowData.title}`}</Text>
      </TouchableHighlight>
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
    backgroundColor: Color.backgroundSetting,
  },
  toolbar: {
    height: moderateScale(120),
  },

  content: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: moderateScale(15),
  },

  viewContent: {
    alignItems: 'center',
    flex: 8,
    height:
      Platform.OS === 'ios'
        ? heightScreen - moderateScale(60)
        : heightScreen - moderateScale(60) - StatusBar.currentHeight,
  },

  image: {
    top: moderateScale(5),
    width: '90%',
    height: '30%',
    resizeMode: 'contain',
  },

  viewInput: {
    flexDirection: 'row',
    width: '100%',
  },

  textInput: {
    margin:
      Platform.OS === 'ios'
        ? widthScreen > 800 || heightScreen > 800
          ? moderateScale(10)
          : scales.vertical(12)
        : moderateScale(8),
    backgroundColor: 'white',
    width: '80%',
    height: moderateScale(35),
    borderColor: Color.cl_border_input,
    borderWidth: 1,
    borderRadius: 5,
    fontFamily: 'HuiFont',
    fontSize: moderateScale(15),
    paddingStart: scales.horizontal(5),
    paddingVertical: moderateScale(1),
    textAlignVertical: 'center',
    color: Color.black,
  },

  textInputModal: {
    margin:
      Platform.OS === 'ios'
        ? widthScreen > 800 || heightScreen > 800
          ? moderateScale(10)
          : scales.vertical(12)
        : moderateScale(8),
    backgroundColor: 'white',
    width: '80%',
    height: moderateScale(35),
    borderColor: Color.cl_border_input,
    borderWidth: 1,
    borderRadius: 5,
    fontFamily: 'HuiFont',
    fontSize: moderateScale(15),
    paddingStart: scales.horizontal(5),
    paddingVertical: scales.vertical(8),
    textAlignVertical: 'center',
    color: Color.black,
  },

  textInfo: {
    marginStart: '15%',
    marginVertical:
      Platform.OS === 'ios'
        ? widthScreen > 800 || heightScreen > 800
          ? moderateScale(11)
          : scales.vertical(12)
        : moderateScale(8),
    width: '100%',
    height: moderateScale(35),
    fontSize: moderateScale(16),
    color: Color.textColor,
    textAlignVertical: 'center',
  },

  inputGroup: {
    width: '65%',
    flexDirection: 'column',
  },

  infoGroup: {
    width: '35%',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  radioGroup: {
    marginVertical: moderateScale(15),
    height: moderateScale(25),
    alignItems: 'center',
  },

  textDropDown: {
    backgroundColor: 'white',
    borderColor: Color.cl_border_input,
    fontFamily: 'HuiFont',
    lineHeight: moderateScale(25),
    fontSize: moderateScale(16),
    paddingStart: 10,
    width: '100%',
  },

  dropdownStyle: {
    width: '48%',
    flexWrap: 'nowrap',
    height: moderateScale(55),
  },

  textCharing: {
    color: 'white',
    fontSize: moderateScale(25),
    fontWeight: 'normal',
    fontFamily: 'HuiFont',
  },

  buttonCharing: {
    width: moderateScale(200),
    height: moderateScale(50),
    marginTop: scales.vertical(5),
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',
    borderColor: Color.white,
    borderWidth: 2,
    backgroundColor: Color.colorSetting,
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
  labelStyle: {
    color: Color.textColor,
    fontFamily: 'HuiFont',
  },
  viewChooseYear: {
    width: '80%',
    height: moderateScale(35),
    flexDirection: 'row',
    marginTop:
      Platform.OS === 'android'
        ? verticalScale(8)
        : isIpX
        ? verticalScale(8)
        : verticalScale(16),
  },
  textYear: {
    width: '20%',
    fontSize: moderateScale(18),
    marginTop: moderateScale(15),
    fontFamily: 'HuiFont',
    color: Color.textColor,
  },
  viewDropDown: {
    width: '80%',
    alignSelf: 'flex-start',
    backgroundColor: Color.white,
    flexDirection: 'row',
    marginTop: scales.vertical(10),
    borderColor: Color.cl_border_input,
    borderWidth: scales.moderate(1),
    borderRadius: scales.moderate(5),
    marginStart:
      Platform.OS === 'ios'
        ? widthScreen > 800 || heightScreen > 800
          ? moderateScale(10)
          : scales.vertical(12)
        : moderateScale(8),
    height: moderateScale(35),
  },
  iconDropDown: {
    right: '5%',
    alignSelf: 'center',
    position: 'absolute',
    width: scales.horizontal(15),
    height: scales.vertical(20),
  },
  dropdownTextStyle: {
    backgroundColor: Color.white,
    fontSize: scales.vertical(10),
    height: moderateScale(35),
    lineHeight: moderateScale(35),
  },
  containerDropDown: {
    width: '100%',
  },
  textStyleDropdown: {
    fontSize: scales.moderate(14),
    marginHorizontal: scales.horizontal(10),
    marginVertical: scales.vertical(10),
    justifyContent: 'center',
    alignItems: 'center',
    color: Color.cl_text_filter,
    fontFamily: 'HuiFont',
    textAlignVertical: 'center',
  },
  textRadioName: {
    marginTop:
      Platform.OS === 'ios'
        ? widthScreen > 800 || heightScreen > 800
          ? moderateScale(5)
          : moderateScale(10)
        : null,
  },
  textDropdownSex: {
    marginTop:
      Platform.OS === 'ios'
        ? widthScreen > 800 || heightScreen > 800
          ? moderateScale(8)
          : moderateScale(13)
        : null,
  },
  textInputYear: {
    marginTop:
      Platform.OS === 'ios'
        ? widthScreen > 800 || heightScreen > 800
          ? moderateScale(12)
          : moderateScale(17)
        : null,
  },
});
