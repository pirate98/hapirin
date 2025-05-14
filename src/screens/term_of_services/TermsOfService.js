import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Toolbar from '../toolbar/Toolbar';
import Constants from '../../constants/Constants';
import {WebView} from 'react-native-webview';
import {Color} from '../../colors/Colors';

const TermsOfService = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  const showSpinner = () => setIsLoading(true);
  const hideSpinner = () => setIsLoading(false);

  const onClickBackButton = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  return (
    <View style={styles.parent}>
      <Toolbar
        leftIcon="back"
        nameRightButton="none"
        style={styles.toolbar}
        onClickBackButton={onClickBackButton}
        title={Constants.SCREEN_TERMS_OF_SERVICE.TITLE}
      />
      <View style={styles.content}>
        <WebView
          source={{uri: Constants.WEB_VIEW_TERMS}}
          javaScriptEnabled
          domStorageEnabled
          onLoadStart={showSpinner}
          onLoad={hideSpinner}
          scalesPageToFit
          showsVerticalScrollIndicator={false}
        />
        {isLoading && (
          <View style={styles.viewIndicator}>
            <ActivityIndicator
              size="large"
              color={Color.cl_loading}
              style={styles.activityIndicatorStyle}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default TermsOfService;

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
