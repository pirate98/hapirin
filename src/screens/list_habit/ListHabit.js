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
  TouchableOpacity,
  BackHandler,
  I18nManager,
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';

import Constants from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import {I18n} from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import {Color} from '../../colors/Colors';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import ListAllHabit from '../list_habit/ListAllHabit';
import ListHabitHealth from '../list_habit/ListHabitHealth';
import ListHabitLearning from '../list_habit/ListHabitLearning';
import ListHabitContribution from '../list_habit/ListHabitContribution';

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

export default class ListHabit extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig(); //set initial config
    const {ID, position} = this.props;
    this.state = {
      position: position,
      ID: ID,
      path: '',
      refresh: undefined,
    };

    this.backHandler = null;
  }

  componentDidMount() {
    // register hardware back button listener
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate(Constants.SCREEN_HOME.KEY)
      return true;
    });
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
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

  onClickRightButton = position => {
    this.props.navigation.navigate(Constants.SCREEN_CREATE_HABIT.KEY, {
      position: position,
      onBack: this.handleStatusTags.bind(this),
    });
  };

  handleStatusTags(data) {
    this.setState({refresh: data.refresh});
  }

  onClickBackButton = () => {
    this.props.navigation.state.params.onBack1({
      refresh: new Date().getTime(),
    });
    this.props.navigation.pop()
  };

  onClickAllButton = () => {
    this.setState({
      position: Constants.MODE_ALL,
    });
  };

  onClickTelomeButton = () => {
    this.setState({
      position: Constants.MODE_HEALTH,
    });
  };

  onClickGlowButton = () => {
    this.setState({
      position: Constants.MODE_LEARNING,
    });
  };

  onClickCytosineButton = () => {
    this.setState({
      position: Constants.MODE_CONTRIBUTION,
    });
  };

  onPressItem({Name, idHabit, position, hour, min}) {
    this.props.navigation.navigate(Constants.SCREEN_PREVIEW_HABIT.KEY, {
      Name: Name,
      idHabit: idHabit,
      position: position,
      hour: hour,
      min: min,
      onBack: this.handleStatusTags.bind(this),
    });
  }

  renderSwitchView(position) {
    switch (position) {
      case Constants.MODE_ALL: {
        return (
          <ListAllHabit
            path={'HabitRd1.php'}
            ID={this.state.ID}
            refresh={this.state.refresh}
            onItemPress={this.onPressItem.bind(this)}
          />
        );
      }
      case Constants.MODE_HEALTH: {
        return (
          <ListHabitHealth
            path={'HabitRd2.php'}
            ID={this.state.ID}
            refresh={this.state.refresh}
            onItemPress={this.onPressItem.bind(this)}
          />
        );
      }
      case Constants.MODE_LEARNING: {
        return (
          <ListHabitLearning
            path={'HabitRd3.php'}
            ID={this.state.ID}
            refresh={this.state.refresh}
            onItemPress={this.onPressItem.bind(this)}
          />
        );
      }
      case Constants.MODE_CONTRIBUTION: {
        return (
          <ListHabitContribution
            path={'HabitRd4.php'}
            ID={this.state.ID}
            refresh={this.state.refresh}
            onItemPress={this.onPressItem.bind(this)}
          />
        );
      }
    }
  }

  changeBackgroundButton(position, mode) {
    if (this.state.position === position) {
      return {
        backgroundColor: Color.colorButtonNone,
        color: Color.white,
      };
    } else {
      return {
        borderColor: Color.colorButtonNone,
        borderWidth: mode !== 'text' ? 2 : null,
      };
    }
  }

  render() {
    return (
      <View style={styles.parent}>
        <Toolbar
          leftIcon="home"
          nameRightButton="create"
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          onClickRightButton={() => {
            this.onClickRightButton(this.state.position);
          }}
          title={Constants.SCREEN_LIST_HABIT.TITLE}
        />
        <View style={styles.content}>
          <View style={styles.viewButton}>
            <TouchableOpacity
              style={[
                styles.itemButtonNone,
                this.changeBackgroundButton(Constants.MODE_ALL),
              ]}
              onPress={() => this.onClickAllButton()}>
              <Text
                style={[
                  styles.textButtonNone,
                  this.changeBackgroundButton(Constants.MODE_ALL, 'text'),
                ]}>
                {translate('habit_all')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.itemButtonNone,
                this.changeBackgroundButton(Constants.MODE_HEALTH),
              ]}
              onPress={() => this.onClickTelomeButton()}>
              <Text
                style={[
                  styles.textButtonNone,
                  this.changeBackgroundButton(Constants.MODE_HEALTH, 'text'),
                ]}>
                {translate('habit_telome')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.itemButtonNone,
                this.changeBackgroundButton(Constants.MODE_LEARNING),
              ]}
              onPress={() => this.onClickGlowButton()}>
              <Text
                style={[
                  styles.textButtonNone,
                  this.changeBackgroundButton(Constants.MODE_LEARNING, 'text'),
                ]}>
                {translate('habit_glow')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.itemButtonNone,
                this.changeBackgroundButton(Constants.MODE_CONTRIBUTION),
              ]}
              onPress={() => this.onClickCytosineButton()}>
              <Text
                style={[
                  styles.textButtonNone,
                  this.changeBackgroundButton(
                    Constants.MODE_CONTRIBUTION,
                    'text',
                  ),
                ]}>
                {translate('habit_cytosine')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewContent}>
            {this.renderSwitchView(this.state.position)}
          </View>
        </View>
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
  content: {
    flex: 8,
    flexDirection: 'column',
    backgroundColor: Color.backgroundListHabit,
  },
  viewButton: {
    width: '100%',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },

  itemButtonNone: {
    backgroundColor: Color.white,
    width: '20%',
    marginTop: moderateScale(15),
    marginHorizontal: moderateScale(8),
    height: moderateScale(40),
    borderRadius: 5,
    justifyContent: 'center',
  },
  textButtonNone: {
    color: Color.colorButtonNone,
    fontSize: moderateScale(15),
    fontFamily: 'HuiFont',
    alignSelf: 'center',
    textAlign: 'center',
  },

  viewContent: {
    flex: 9,
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: moderateScale(15),
    marginTop: verticalScale(5),
  },
});
