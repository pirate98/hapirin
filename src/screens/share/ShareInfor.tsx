import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

import Toolbar from '../toolbar/Toolbar';
import Constants from '../../constants/Constants';
import { Color } from '../../colors/Colors';

const ShareInfor: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => {
      subscription.remove(); // ✅ Correct way to clean up
    };
  }, [navigation]);

  const onClickBackButton = () => {
    navigation.goBack();
  };

  const onClickRightButton = () => {}

  return (
    <View style={styles.parent}>
      <Toolbar
        leftIcon="back"
        nameRightButton="none"
        style={styles.toolbar}
        onClickBackButton={onClickBackButton}
        title={Constants.SCREEN_SHARE_INFOR.TITLE}
        onClickRightButton={onClickRightButton}
      />
      <View style={styles.content}>
        <WebView
          source={{ uri: Constants.WEB_VIEW_SHARE }}
          javaScriptEnabled
          domStorageEnabled
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
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

export default ShareInfor;
