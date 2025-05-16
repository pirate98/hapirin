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
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';
import Constants, {
  BASE_URL,
  API_UPDATE_USER_INFO,
  regexEmoji,
  regexVietnameseChar,
  regexLatinChar,
  regexSpecialChar,
} from '../../constants/Constants';
import TextFont from '../../commons/components/TextFont';
// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better

// import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

import ModalDropdown from 'react-native-modal-dropdown';
import {moderateScale, verticalScale} from 'react-native-size-matters';

import {updateUser} from '../../databases/StorageServices';

import {getUserInfo} from '../../databases/StorageServices';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import scales from '../../styles/scales';
import FastImage from '@d11/react-native-fast-image';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Color} from '../../colors/Colors';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';

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

var widthScreen = Dimensions.get('window').width; //full width
var heightScreen = Dimensions.get('window').height; //full height

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

export default class RegisterInfo extends React.Component {
  constructor(props) {
    super(props);
    this.press = false;
    this.state = {
      valueSelect: 0,
      isLoading: true,
      id: '',
      userId: '',
      password: '',
      nickname: '',
      endname: '',
      gender: '0',
      age: '',
      userInfo: '',
    };
    setI18nConfig(); //set initial config
  }

  componentDidMount() {
    getUserInfo()
      .then(userInfo => {
        this.setState({
          userInfo: userInfo[0],
          userId: userInfo[0].UserId,
          id: userInfo[0].ID,
          password: userInfo[0].PassWord,
          nickname: userInfo[0].Name,
          endname: userInfo[0].Mrs,
          gender: userInfo[0].Sex,
          age: userInfo[0].Year,
          isLoading: false,
        });
        this.getInitial(this.state.endname);
      })
      .catch(error => {
        console.error(error);
      });
    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      // Actions.pop();
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
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
    this.props.navigation.pop()
  };

  onSelectedIndex() {
    if (this.state.userInfo.Mrs === 'ちゃん') {
      return 0;
    } else if (this.state.userInfo.Mrs === 'くん') {
      return 1;
    } else {
      return 2;
    }
  }

  updateUserInfo() {
    if (this.state.nickname !== '') {
      this.setState({
        isLoading: true,
      });
      fetch(BASE_URL + API_UPDATE_USER_INFO, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body: 'ID='
          .concat(this.state.id)
          .concat('&UserId=')
          .concat(this.state.userId)
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
          if (responseJson === 'update') {
            const newUser = {
              ID: this.state.id,
              UserId: this.state.userId,
              PassWord: this.state.password,
              Name: this.state.nickname,
              Mrs: `${this.state.endname}`,
              Sex: `${this.state.gender}`,
              Year: `${this.state.age}`,
              DelFg: '0',
            };
            updateUser(newUser)
              .then(() => {
                this.setState({isLoading: false}, () => {
                  this.props.navigation.pop()
                });
              })
              .catch(error => {
                this.setState(
                  {
                    isLoading: false,
                  },
                  () => {
                    Alert.alert(translate(error.message));
                  },
                );
              });
          }
        })
        .catch(error => {
          this.setState({isLoading: false});
          this.press = false;
          console.log('Error =>>> ' + error);
          alert(error);
        });
    } else {
      Alert.alert(
        translate('warning_dialog'),
        translate('dialog_warning_register_info'),
        [
          {
            text: translate('sure_recognition_dialog'),
            onPress: () => {
              this.press = false;
            },
          },
        ],
      );
    }
  }

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
        <Toolbar
          leftIcon="back"
          nameRightButton="none"
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          onClickRightButton={() => this.onClickRightButton()}
          title={Constants.SCREEN_REGISTER_INFO.TITLE}
        />
        <KeyboardAwareScrollView>
          <View style={styles.content}>
            <FastImage
              resizeMode={FastImage.resizeMode.stretch}
              style={styles.imageBg}
              source={require('../../resources/images/4_2_01_0309.png')}>
              <View style={styles.viewNotEdit}>
                <FastImage
                  style={styles.imageID}
                  source={require('../../resources/images/g-1-1.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text
                  style={styles.textNotEdit}
                  onChangeText={text => this.setState({userId: text})}>
                  {this.state.userId}
                </Text>
                <FastImage
                  style={styles.imagePass}
                  source={require('../../resources/images/g-1-2.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text
                  style={styles.textNotEdit}
                  onChangeText={text => this.setState({password: text})}>
                  {this.state.password}
                </Text>
              </View>
            </FastImage>

            <View style={styles.viewNickName}>
              <FastImage
                style={styles.imgTitleNickName}
                source={require('../../resources/images/g-1-3.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
              <TextInput
                // value={this.state.nickname}
                style={styles.textInputNickName}
                onChangeText={text => this.setState({nickname: text})}
                placeholder={translate('register_info_placeholder_nickname')}
                onBlur={() => this.checkContentInputNickName()}>
                {this.state.nickname}
              </TextInput>
            </View>
            <View style={styles.viewInput}>
              <View style={styles.infoGroup}>
                <FastImage
                  source={require('../../resources/images/g-1-4.png')}
                  style={[styles.textInfo, {width: '60%'}]}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <FastImage
                  source={require('../../resources/images/g-1-5.png')}
                  style={[styles.textInfo, {width: '60%'}]}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <FastImage
                  source={require('../../resources/images/g-1-6.png')}
                  style={[styles.textInfo, {width: '80%'}]}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View style={styles.inputGroup}>
                <RadioGroup
                  color={Color.colorRadio}
                  style={styles.viewRadio}
                  selectedIndex={this.onSelectedIndex()}
                  onSelect={(index, value) => {
                    this.setState({
                      endname: value,
                      valueSelect: index,
                    });
                  }}>
                  <RadioButton
                    value={radio_props[0].label}
                    style={styles.buttonRadio}>
                    <TextFont
                      style={styles.labelStyle}
                      content={radio_props[0].label}
                    />
                  </RadioButton>

                  <RadioButton
                    value={radio_props[1].label}
                    style={styles.buttonRadio}>
                    <TextFont
                      style={styles.labelStyle}
                      content={radio_props[1].label}
                    />
                  </RadioButton>

                  <RadioButton
                    value={radio_props[2].label}
                    style={styles.buttonRadio}>
                    <TextFont
                      style={styles.labelStyle}
                      content={radio_props[2].label}
                    />
                  </RadioButton>
                </RadioGroup>

                <View style={styles.viewDropDown}>
                  <FastImage
                    source={require('../../resources/images/2_10_5.png')}
                    style={styles.iconDropDown}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <ModalDropdown
                    style={styles.containerDropDown}
                    options={genderOption}
                    defaultValue={this._dropdown_2_renderDefault(
                      this.state.gender,
                    )}
                    textStyle={styles.textStyleDropdown}
                    dropdownTextStyle={styles.dropdownTextStyle}
                    dropdownStyle={styles.dropdownStyle}
                    onSelect={(idx, value) => {
                      this.setState({gender: value.title});
                    }}
                    renderButtonText={rowData =>
                      this._dropdown_2_renderButtonText(rowData)
                    }
                    renderRow={this._dropdown_2_renderRow.bind(this)}
                  />
                </View>

                <TextInput
                  style={styles.textInput}
                  numeric
                  keyboardType={'numeric'}
                  value={this.state.age}
                  onChangeText={text => this.setState({age: text})}
                  maxLength={4}
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.buttonCharing}
              onPress={() => {
                if (!this.press) {
                  this.press = true;
                  this.updateUserInfo();
                }
              }}>
              <Text style={styles.textCharing}>
                {translate('txt_btn_registrtion_edit_info')}
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <ActivityIndicator
              style={styles.loading}
              color={Color.cl_loading}
              size="large"
            />
          )}
        </KeyboardAwareScrollView>
      </View>
    );
  }

  getInitial(mrs) {
    for (let mr of radio_props) {
      if (mrs === mr) {
        this.setState({
          valueSelect: parseInt(mr.value),
        });
      }
    }
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

  _dropdown_2_renderDefault = gender => {
    return gender !== '' ? gender : '';
  };

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
    flexDirection: 'column',
    backgroundColor: '#FDF7E3',
    justifyContent: 'center',
    height:
      Platform.OS === 'ios'
        ? heightScreen
        : heightScreen - StatusBar.currentHeight,
  },
  toolbar: {
    flex: 2,
  },

  content: {
    flex: 8,
    flexDirection: 'column',
    alignItems: 'center',
  },

  imageBg: {
    width: wp('100%'),
    height: hp('38%'),
    marginTop: scales.vertical(5),
  },

  imageID: {
    resizeMode: 'contain',
    width: wp('15%'),
    height: 25,
    marginStart: wp('10%'),
  },

  imagePass: {
    resizeMode: 'contain',
    width: wp('25%'),
    height: 25,
    marginStart: wp('10%'),
  },
  viewNickName: {
    width: '80%',
    marginStart: '12%',
    marginEnd: '13%',
  },
  imgTitleNickName: {
    resizeMode: 'contain',
    width: Platform.OS === 'android' ? wp('70%') : wp('62%'),
    height: 25,
    marginTop: scales.vertical(8),
  },
  textInputNickName: {
    marginTop: moderateScale(10),
    backgroundColor: 'white',
    width: '100%',
    height: moderateScale(35),
    borderColor: '#D4D4D8',
    borderWidth: 1,
    borderRadius: 5,
    fontFamily: 'HuiFont',
    fontSize: moderateScale(20),
    paddingStart: scales.horizontal(5),
    paddingVertical: scales.vertical(1),
    textAlignVertical: 'center',
    color: Color.black,
  },

  viewInput: {
    flexDirection: 'row',
    width: '100%',
  },

  viewNotEdit: {
    position: 'absolute',
    flexDirection: 'column',
    width: '100%',
    bottom: 10,
  },

  textInput: {
    margin: moderateScale(10),
    marginTop: verticalScale(20),
    backgroundColor: 'white',
    width: '75%',
    height: moderateScale(35),
    borderColor: '#D4D4D8',
    borderWidth: 1,
    borderRadius: 5,
    fontFamily: 'HuiFont',
    fontSize: moderateScale(20),
    paddingStart: scales.horizontal(5),
    paddingVertical: scales.vertical(1),
    textAlignVertical: 'center',
    color: Color.black,
  },
  textInputModal: {
    margin:
      Platform.OS === 'ios'
        ? widthScreen > 800 || heightScreen > 800
          ? moderateScale(10)
          : scales.vertical(12)
        : moderateScale(10),
    backgroundColor: 'white',
    width: '75%',
    height: moderateScale(35),
    borderColor: '#D4D4D8',
    borderWidth: 1,
    borderRadius: 5,
    fontFamily: 'HuiFont',
    fontSize: moderateScale(20),
    paddingStart: scales.horizontal(5),
    paddingVertical:
      Platform.OS === 'android' ? scales.vertical(1) : scales.vertical(6),
    textAlignVertical: 'center',
    color: Color.black,
  },
  buttonRadio: {
    alignItems: 'center',
  },
  viewRadio: {
    width: '85%',
    marginTop: moderateScale(8),
    flexDirection: 'row',
  },

  textNotEdit: {
    margin: moderateScale(5),
    backgroundColor: 'white',
    width: '80%',
    height: moderateScale(35),
    lineHeight: moderateScale(35),
    borderColor: '#D4D4D8',
    borderWidth: 1,
    borderRadius: 5,
    fontFamily: 'HuiFont',
    fontSize: moderateScale(15),
    paddingStart: scales.horizontal(5),
    justifyContent: 'center',
    alignSelf: 'center',
    textAlignVertical: 'center',
  },

  textInfo: {
    marginStart: '15%',
    margin: moderateScale(10),
    height: moderateScale(35),
  },

  inputGroup: {
    width: '70%',
    flexDirection: 'column',
  },

  infoGroup: {
    width: '30%',
    flexDirection: 'column',
    justifyContent: 'center',
    marginStart: '5%',
  },

  radioGroup: {
    margin: moderateScale(10),
    height: moderateScale(35),
    alignItems: 'center',
  },

  viewDropDown: {
    width: '75%',
    alignSelf: 'flex-start',
    backgroundColor: Color.white,
    flexDirection: 'row',
    marginTop: scales.vertical(15),
    borderColor: Color.cl_border_input,
    borderWidth: scales.moderate(1),
    borderRadius: scales.moderate(5),
    marginStart:
      Platform.OS === 'ios'
        ? widthScreen > 800 || heightScreen > 800
          ? moderateScale(10)
          : scales.vertical(12)
        : moderateScale(8),
    height: scales.vertical(35),
  },
  iconDropDown: {
    right: '5%',
    alignSelf: 'center',
    position: 'absolute',
    width: scales.horizontal(15),
    height: scales.vertical(20),
  },
  containerDropDown: {
    width: '100%',
  },
  textStyleDropdown: {
    fontSize: scales.moderate(14),
    marginHorizontal: scales.horizontal(10),
    marginVertical: scales.vertical(8),
    justifyContent: 'center',
    alignItems: 'center',
    color: Color.cl_text_filter,
    fontFamily: 'HuiFont',
    textAlignVertical: 'center',
  },
  dropdownTextStyle: {
    backgroundColor: Color.white,
    fontSize: scales.vertical(10),
  },
  dropdownStyle: {
    width: '52%',
    flexWrap: 'nowrap',
    height: moderateScale(55),
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
  buttonCharing: {
    width: moderateScale(200),
    height: moderateScale(50),
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',
    borderColor: Color.white,
    borderWidth: 2,
    backgroundColor: Color.colorSetting,
    marginTop: verticalScale(5),
  },

  textCharing: {
    color: 'white',
    fontSize: moderateScale(25),
    fontWeight: 'normal',
    fontFamily: 'HuiFont',
  },

  labelStyle: {
    color: '#785230',
    fontFamily: 'HuiFont',
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
});
