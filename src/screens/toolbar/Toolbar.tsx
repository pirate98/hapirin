/**
 * Common Toolbar
 *
 */

import React from 'react';
import {
  View,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import FastImage from '@d11/react-native-fast-image';

import TextFont from '../../commons/components/TextFont';
import TouchableDebounce from '../../commons/components/TouchableDebounce';
import TouchableDebounceDelay from '../../commons/components/TouchableDebounce';
import SoundService from '../../soundService/SoundService';
import Styles from '../../styles/Styles';
import Constants from '../../constants/Constants';
import { Color } from '../../colors/Colors';
import scales from '../../styles/scales';

interface ToolbarProps {
  title: string;
  leftIcon?: 'home' | 'back';
  nameRightButton?: 'create' | 'home' | 'none';
  onClickBackButton?: () => void;
  onClickRightButton: () => void;
  style?: object;
}

export const getNotchHeight = () => {
  if (Platform.OS === 'ios') {
    const { width, height } = Dimensions.get('window');
    return !Platform.isPad && !Platform.isTV && (height > 800 || width > 800)
      ? 30
      : 10;
  }
  return 0;
};

const Toolbar: React.FC<ToolbarProps> = ({
  title,
  leftIcon,
  nameRightButton = 'none',
  onClickBackButton,
  onClickRightButton,
}) => {
  const navigation = useNavigation();

  const handleBackPress = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    if (onClickBackButton) {
      onClickBackButton();
    } else {
      navigation.goBack(); // fallback
    }
  };

  const renderLeftIcon = () => {
    if (leftIcon === 'home') {
      return (
        <View style={{ flex: 1.5 }}>
          <TouchableDebounceDelay
            style={styles.viewLeftHome}
            onPress={handleBackPress}
          >
            <FastImage
              style={{
                width: moderateScale(45),
                height: moderateScale(45),
                marginStart: moderateScale(10),
              }}
              resizeMode={FastImage.resizeMode.cover}
              source={require('../../resources/images/home.png')}
            />
          </TouchableDebounceDelay>
        </View>
      );
    } else if (leftIcon === 'back') {
      return (
        <View style={{ flex: 1.5 }}>
          <TouchableDebounce
            style={styles.viewLeftBack}
            onPress={handleBackPress}
          >
            <FastImage
              style={{ width: moderateScale(40), height: moderateScale(26) }}
              resizeMode={FastImage.resizeMode.cover}
              source={require('../../resources/images/1_12_1.png')}
            />
          </TouchableDebounce>
        </View>
      );
    } else {
      return <View style={{ flex: 1.5 }} />;
    }
  };

  const renderRightIcon = () => {
    if (nameRightButton === 'create') {
      return (
        <View style={{ flex: 1.5 }}>
          <TouchableDebounce
            style={styles.viewRight}
            onPress={onClickRightButton}
          >
            <FastImage
              source={require('../../resources/images/1_12_12_0602.png')}
              resizeMode={FastImage.resizeMode.stretch}
              style={styles.btnCreated}
            />
          </TouchableDebounce>
        </View>
      );
    } else if (nameRightButton === 'home') {
      return (
        <View style={{ flex: 1.5 }}>
          <TouchableDebounce
            style={styles.viewRight}
            onPress={onClickRightButton}
          >
            <FastImage
              source={require('../../resources/images/home.png')}
              resizeMode={FastImage.resizeMode.stretch}
              style={{
                width: moderateScale(45),
                height: moderateScale(45),
                marginEnd: moderateScale(10),
              }}
            />
          </TouchableDebounce>
        </View>
      );
    } else {
      return <View style={{ flex: 1.5 }} />;
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: Constants.BACKGROUND_COLOR_TOOLBAR }}>
      <View style={styles.toolbar}>
        {renderLeftIcon()}
        <View style={Styles.toolbar}>
          <TextFont
            color="white"
            content={title}
            style={Styles.toolbar_title}
          />
        </View>
        {renderRightIcon()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  viewLeftHome: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  viewLeftBack: {
    justifyContent: 'center',
    alignItems: 'center',
    width: moderateScale(40),
    marginStart: moderateScale(10),
  },
  viewRight: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 3,
  },
  toolbar: {
    top: 0,
    flexDirection: 'row',
    height: moderateScale(60),
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Constants.BACKGROUND_COLOR_TOOLBAR,
    marginEnd: scales.horizontal(10),
  },
  btnCreated: {
    height: Platform.OS === 'ios' ? verticalScale(35) : verticalScale(40),
    width: Platform.OS === 'ios' ? moderateScale(70) : moderateScale(70),
    alignSelf: 'center',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: Color.cl_border_transparent,
  },
});

export default Toolbar;
