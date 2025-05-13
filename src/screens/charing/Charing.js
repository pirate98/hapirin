/**
 * Charing screen
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  AsyncStorage,
  FlatList,
  TouchableOpacity,
  BackHandler,
  I18nManager,
  Dimensions,
  StatusBar,
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';
import {Actions} from 'react-native-router-flux';
import Constants from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import {Color} from '../../colors/Colors';
import {moderateScale} from 'react-native-size-matters';
import ChooseHabitCharing from './ChooseHabitCharing';
import CreatHabitOnlyToday from './CreateHabitOnlyToday';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

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

export default class Charing extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig(); //set initial config
    this.state = {
      mode: 0,
    };
  }

  componentDidMount() {
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

  onClickRightButton = () => {};

  onClickBackButton = () => {
    Actions.pop();
  };

  onClickChooseHabit = () => {
    this.setState({
      mode: 0,
    });
  };

  onClickCreateOnlyHabit = () => {
    this.setState({
      mode: 1,
    });
  };

  renderSwitchView(mode) {
    switch (mode) {
      case 0: {
        return <ChooseHabitCharing />;
      }
      case 1: {
        return <CreatHabitOnlyToday />;
      }
    }
  }

  changeBackgroundButtonChoose(mode) {
    if (mode === 0) {
      return {backgroundColor: Color.colorButtonCharingFocus};
    } else {
      return {backgroundColor: Color.colorButtonNone};
    }
  }

  changeBackgroundButtonCreate(mode) {
    if (mode === 1) {
      return {backgroundColor: Color.colorButtonCharingFocus};
    } else {
      return {backgroundColor: Color.colorButtonNone};
    }
  }

  render() {
    return (
      <KeyboardAwareScrollView>
        <View style={styles.parent}>
          <Toolbar
            leftIcon="home"
            nameRightButton="none"
            style={styles.toolbar}
            onClickBackButton={() => this.onClickBackButton()}
            onClickRightButton={() => this.onClickRightButton()}
            title={Constants.SCREEN_CHARING.TITLE}
          />
          <View style={styles.content}>
            <View style={styles.viewButton}>
              <TouchableOpacity
                style={[
                  styles.itemButton1,
                  this.changeBackgroundButtonChoose(this.state.mode),
                ]}
                onPress={() => this.onClickChooseHabit()}>
                <Text style={styles.textButton}>
                  {translate('charing_learning')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.itemButton2,
                  this.changeBackgroundButtonCreate(this.state.mode),
                ]}
                onPress={() => this.onClickCreateOnlyHabit()}>
                <Text style={styles.textButton}>
                  {translate('charing_only_today')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.viewContent}>
              {this.renderSwitchView(this.state.mode)}
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
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
    backgroundColor: Color.backgroundCharing,
  },
  toolbar: {
    flex: 2,
  },
  content: {
    flex: 8,
    flexDirection: 'column',
  },
  viewButton: {
    width: '100%',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  viewContent: {
    flex: 9,
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: moderateScale(25),
  },
  itemButton1: {
    backgroundColor: Color.colorButtonNone,
    width: '35%',
    marginVertical: moderateScale(15),
    height: moderateScale(45),
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    justifyContent: 'center',
  },
  itemButton2: {
    backgroundColor: Color.colorButtonNone,
    width: '35%',
    marginTop: moderateScale(15),
    marginBottom: moderateScale(15),
    height: moderateScale(45),
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
  },
  textButton: {
    color: Color.white,
    fontSize: moderateScale(22),
    fontFamily: 'HuiFont',
    alignSelf: 'center',
    textAlign: 'center',
  },
});
