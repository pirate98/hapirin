/* eslint-disable radix */
/* eslint-disable no-alert */
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
  FlatList,
  TouchableOpacity,
  BackHandler,
  I18nManager,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';

import Constants, {
  BASE_URL,
  API_GET_HABIT,
  heightScreen,
} from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import {I18n} from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import {moderateScale} from 'react-native-size-matters';
import {Color} from '../../colors/Colors';
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

var width = Dimensions.get('window').width; //full width

export default class ListHabitHealth extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig(); //set initial config
    this.state = {
      listHabit: [],
      path: props.path,
      ID: props.ID,
      isLoading: true,
      hour: '',
      min: '',
    };

    this.backHandler = null;
  }

  componentDidMount() {
    // register hardware back button listener
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Actions.pop();
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
    this.getHabit();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.refresh !== this.props.refresh) {
      this.getHabit();
    }
  }

  renderFlatList() {
    if (this.state.isLoading === true) {
      return null;
    } else {
      return (
        <FlatList
          style={styles.lineBottom}
          data={this.state.listHabit}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => {
                var hours =
                  item.SetTime !== '' ? item.SetTime.slice(0, 2) : '00';
                var minute =
                  item.SetTime !== ''
                    ? item.SetTime.slice(
                        item.SetTime.length - 2,
                        item.SetTime.length,
                      )
                    : '00';
                this.setState(
                  {
                    hour: hours,
                    min: minute,
                  },
                  () => {
                    this.props.onItemPress({
                      Name: item.Name,
                      idHabit: item.ID,
                      position: Constants.MODE_HEALTH,
                      hour: this.state.hour,
                      min: this.state.min,
                    });
                  },
                );
              }}>
              <View style={styles.view_item}>
                <FastImage
                  style={styles.icon_mode}
                  source={this.getImagePath(item)}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.text_item} numberOfLines={1}>
                  {item.AddWd}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.ID}
        />
      );
    }
  }

  componentWillUnmount() {
    // unregister hardware back button listener
    this.backHandler.remove()
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
  }

  UNSAFE_componentWillMount() {}

  getHabit() {
    fetch(BASE_URL + API_GET_HABIT.concat(this.state.path), {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: 'Name='.concat(this.state.ID),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        this.setState({
          listHabit: responseJson,
          isLoading: false,
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };

  getImagePath = item => {
    if (item.SelJob === '0') {
      return require('../../resources/images/1_1_9.png');
    } else if (item.SelJob === '1') {
      return require('../../resources/images/1_1_10.png');
    } else if (item.SelJob === '2') {
      return require('../../resources/images/1_1_11.png');
    }
  };

  render() {
    const {isLoading} = this.state;
    return (
      <View style={styles.parent}>
        {this.renderFlatList()}
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
  parent: {
    flex: 1,
    flexDirection: 'column',
    paddingBottom: moderateScale(10),
  },
  view_item: {
    width: '100%',
    flexDirection: 'row',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    paddingVertical: moderateScale(10),
    justifyContent: 'flex-start',
  },
  icon_mode: {
    width: moderateScale(45),
    height: moderateScale(45),
    alignSelf: 'center',
  },
  text_item: {
    width: width * 0.75,
    color: 'black',
    fontSize: moderateScale(20),
    fontFamily: 'HuiFont',
    marginStart: moderateScale(10),
    alignSelf: 'center',
  },
  loading: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    backgroundColor: Color.cl_border_transparent,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
