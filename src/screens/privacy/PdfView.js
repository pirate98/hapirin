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
  BackHandler,
  I18nManager,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';

import Toolbar from '../toolbar/Toolbar';

import Constants from '../../constants/Constants';
// multi languages
import * as RNLocalize from 'react-native-localize';
import {I18n} from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import WebView from 'react-native-webview';
import {Color} from '../../colors/Colors';

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

export default class PdfView extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig(); //set initial config
    this.state = {
      isLoading: true,
    };

    this.backHandler = null;
  }

  componentDidMount() {
    // register hardware back button listener
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate(Constants.SCREEN_PRIVACY.KEY)
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

  onClickRightButton = () => {
    // alert('BBBB')
  };

  onClickBackButton = () => {
    this.props.navigation.pop()
  };

  renderActivityIndicator() {
    if (this.state.isLoading) {
      return (
        <View style={styles.viewIndicator}>
          <ActivityIndicator
            size="large"
            color={Color.cl_loading}
            style={styles.activityIndicatorStyle}
          />
        </View>
      );
    }
  }

  showSpinner() {
    this.setState({isLoading: true});
  }

  hideSpinner() {
    this.setState({isLoading: false});
  }

  render() {
    return (
      <View style={styles.parent}>
        <Toolbar
          leftIcon="back"
          nameRightButton=""
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          onClickRightButton={() => this.onClickRightButton()}
          title={Constants.SCREEN_PDF_VIEW.TITLE}
        />
        <View style={styles.content}>
          <WebView
            source={{uri: Constants.WEB_VIEW_PRIVACY_POLICY}}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onLoadStart={() => this.showSpinner()}
            onLoad={() => this.hideSpinner()}
            scalesPageToFit={true}
            showsVerticalScrollIndicator={false}
          />
          {this.renderActivityIndicator()}
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
  },
  pdf: {
    flex: 1,
    width: widthScreen,
    height: heightScreen,
  },
  viewIndicator: {
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
