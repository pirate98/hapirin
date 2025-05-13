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
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Constants, {
  API_LIST_CHARIN_HISTORY,
  BASE_URL,
} from '../../constants/Constants';
import Navigation from '../navigation/Navigation';
import {moderateScale} from 'react-native-size-matters';
import Toolbar from '../toolbar/Toolbar';
import {Color} from '../../colors/Colors';
import FastImage from 'react-native-fast-image';

// multi languages
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better

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

const LIST_IMG_NM = [
  require('../../resources/images/1_1_9.png'),
  require('../../resources/images/1_1_10.png'),
  require('../../resources/images/1_1_11.png'),
];

const POSITION_CHARIN_HISTORY = 5;

export default class CharinHistory extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig();
    const {date} = this.props;
    this.state = {
      ID: props.ID,
      date: new Date(date),
      time: '',
      listCharin: [],
      idItem: -1,
      isLoading: true,
    };
  }

  componentDidMount() {
    // register hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.pop();
      return true;
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
    this.renDateMonth(
      this.state.date.getDate(),
      this.state.date.getMonth() + 1,
    );
    this.getListCharin(this.state.date);
    // this.setValue();
  }

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

  getListCharin(date) {
    var dateFormat = this.formatDate(date);
    fetch(BASE_URL + API_LIST_CHARIN_HISTORY, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
      }),
      body: 'Name='
        .concat(this.state.ID)
        .concat('&FromD=')
        .concat(dateFormat.concat('000000'))
        .concat('&ToD=')
        .concat(dateFormat.concat('999999')),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        this.setState({
          isLoading: false,
          listCharin: responseJson,
        });
      })
      .catch(error => {
        this.setState({
          isLoading: false,
        });
        console.log('Error =>>> ' + error);
      });
  }

  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return year + month + day;
  }

  checkChangeScreen(listData, HID) {
    if (listData.length > 0) {
      Navigation.gotoPreviewHabit({
        idHabit: HID,
        position: POSITION_CHARIN_HISTORY,
      });
    }
  }

  renDateMonth(date, month) {
    var dateText = '日';
    var monthText = '月';
    this.setState({
      time: month
        .toString()
        .concat(monthText)
        .concat(date)
        .concat(dateText),
    });
  }

  renNextDay(date) {
    date.setDate(date.getDate() + 1);
  }

  renPreviousDay(date) {
    date.setDate(date.getDate() - 1);
  }

  renNextState() {
    this.renNextDay(this.state.date);
    this.renDateMonth(
      this.state.date.getDate(),
      this.state.date.getMonth() + 1,
    );
    this.getListCharin(this.state.date);
  }

  renPreviousState() {
    this.renPreviousDay(this.state.date);
    this.renDateMonth(
      this.state.date.getDate(),
      this.state.date.getMonth() + 1,
    );
    this.getListCharin(this.state.date);
  }

  getImagePath = item => {
    var index = item.SelJob;
    return LIST_IMG_NM[index];
  };

  renderDetail(item) {
    if (item.TodayFg === '0') {
      return <Text style={styles.styletextdetail}>...</Text>;
    }
  }

  changeBackgroundButtonHealth() {
    // if (this.state.idItem === index) {
    //   return {
    //     backgroundColor: Color.cl_item_history_selected,
    //     borderBottomColor: Color.cl_item_history_selected,
    //     borderBottomWidth: 1,
    //   };
    // } else {
    return {
      backgroundColor: Color.backgroundSetting,
      borderBottomColor: Color.cl_item_history_selected,
      borderBottomWidth: 1,
    };
    // }
  }

  renderList() {
    if (this.state.listCharin.length > 0) {
      return (
        <FlatList
          data={this.state.listCharin}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={this.changeBackgroundButtonHealth()}
              activeOpacity={1}
              onPress={() => {
                this.setState({
                  idItem: index,
                });
              }}>
              <View style={styles.viewItem}>
                <FastImage
                  style={styles.itemImage}
                  source={this.getImagePath(item)}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.contentItem} numberOfLines={1}>
                  {item.AddWd}
                </Text>
                {/*{this.renderDetail(item)}*/}
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.ID}
        />
      );
    } else {
      return (
        <View style={styles.parentblanklist}>
          <FastImage
            style={styles.styleImageBlank}
            source={require('../../resources/images/3_3_1.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      );
    }
  }

  renderActivityIndicator() {
    if (this.state.isLoading) {
      return (
        <View style={styles.renderActivityIndicator}>
          <ActivityIndicator
            size="large"
            color={Color.cl_loading}
            style={styles.activityIndicatorStyle}
          />
        </View>
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
          title={Constants.SCREEN_CHARIN_HISTORY.TITLE}
        />
        <View style={styles.content}>
          <View style={styles.note}>
            <TouchableOpacity
              style={styles.touchableopacitystyle}
              onPress={() => this.renPreviousState()}>
              <Text style={styles.textbutton}>前の日</Text>
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
              <Text style={styles.textbutton}>次の日</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stylecontentlist}>{this.renderList()}</View>
        </View>
        {this.renderActivityIndicator()}
      </View>
    );
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
    alignContent: 'center',
    alignItems: 'center',

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
    width: '70%',
    color: 'black',
    fontSize: moderateScale(15),
    fontFamily: 'HuiFont',
    paddingStart: moderateScale(10),
    textAlign: 'center',
  },
  textdatetime: {
    width: '50%',
    color: 'black',
    fontSize: moderateScale(15),
    fontFamily: 'HuiFont',
    flex: 7,
    textAlign: 'center',
  },
  touchableopacitystyle: {
    flex: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagebuttonstyle: {
    width: moderateScale(20),
    height: moderateScale(20),
    resizeMode: 'contain',
  },
  stylecontentlist: {
    width: '100%',
    height: '90%',
  },
  parentblanklist: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleImageBlank: {
    width: '35%',
    height: '25%',
    alignSelf: 'center',
    justifyContent: 'center',
    resizeMode: 'stretch',
  },
  viewItem: {
    width: '100%',
    flexDirection: 'row',
    padding: moderateScale(10),
  },
  itemImage: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignSelf: 'center',
  },
  contentItem: {
    width: '85%',
    color: 'black',
    fontSize: moderateScale(15),
    fontFamily: 'HuiFont',
    alignSelf: 'center',
    paddingLeft: moderateScale(10),
    left: moderateScale(10),
  },
  styletextdetail: {
    width: '30%',
    color: 'black',
    fontSize: moderateScale(20),
    fontFamily: 'HuiFont',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  renderActivityIndicator: {
    backgroundColor: Color.background_transparent,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  activityIndicatorStyle: {
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
    color: Color.cl_loading,
  },
});
