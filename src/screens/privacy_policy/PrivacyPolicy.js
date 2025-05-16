/**
 * Webview screen
 */

import React from 'react';
import {StyleSheet, View, BackHandler, ActivityIndicator} from 'react-native';

import Toolbar from '../toolbar/Toolbar';
import Constants from '../../constants/Constants';
import {WebView} from 'react-native-webview';
import {Color} from '../../colors/Colors';

export default class PrivacyPolicys extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };

    this.backHandler = null;
  }

  componentDidMount() {
    // register hardware back button listener
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Actions.pop();
    });
  }

  componentWillUnmount() {
    // unregister hardware back button listener
    this.backHandler.remove()
  }

  onClickRightButton = () => {
    // alert('BBBB')
  };

  onClickBackButton = () => {
    this.props.navigation.pop()
  };

  showSpinner() {
    this.setState({isLoading: true});
  }

  hideSpinner() {
    this.setState({isLoading: false});
  }

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

  render() {
    return (
      <View style={styles.parent}>
        <Toolbar
          leftIcon="back"
          nameRightButton=""
          style={styles.toolbar}
          onClickBackButton={() => this.onClickBackButton()}
          title={Constants.SCREEN_PRIVACY_POLICY.TITLE}
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
