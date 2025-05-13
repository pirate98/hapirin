/**
 *
 * BeetSoft Co., Ltd
 * Common Toolbar
 *
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Image,
} from 'react-native';
import Styles from '../../styles/Styles';
import Constants from '../../constants/Constants';
import Navigation from '../navigation/Navigation';
import TextFont from '../../commons/components/TextFont';
//use scale size for screen different
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import SoundService from '../../soundService/SoundService';
import {Color} from '../../colors/Colors';
import scales from '../../styles/scales';
import FastImage from 'react-native-fast-image';
import {Actions} from 'react-native-router-flux';
import TouchableDebounceDelay from '../../commons/components/TouchableDebounce';
import TouchableDebounce from '../../commons/components/TouchableDebounce';

export const getNotchHeight = () => {
  if (Platform.OS === 'ios') {
    const {width, height} = Dimensions.get('window');
    return !Platform.isPad && !Platform.isTVOS && (height > 800 || width > 800)
      ? 30
      : 10;
  }
  return 0;
};

export default class Toolbar extends React.Component {
  // params onClickBackButton: callback of Back button
  renderLeftIcon(name, onClickBackButton) {
    return (
      <View style={{flex: 1.5}}>
        {name === 'home' ? (
          <TouchableDebounceDelay
            style={styles.viewLeftHome}
            onPress={async () => {
              await SoundService.loadSoundSel('sel.mp3');
              onClickBackButton();
            }}>
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
        ) : (
          <TouchableDebounce
            style={styles.viewLeftBack}
            onPress={async () => {
              await SoundService.loadSoundSel('sel.mp3');
              onClickBackButton();
            }}>
            <FastImage
              style={{width: moderateScale(40), height: moderateScale(26)}}
              resizeMode={FastImage.resizeMode.cover}
              source={require('../../resources/images/1_12_1.png')}
            />
          </TouchableDebounce>
        )}
      </View>
    );
  }

  // param onClickRightButton: callback of right button
  renderRightIcon(nameRightButton, onClickRightButton) {
    if (nameRightButton === 'create') {
      return (
        <View style={{flex: 1.5}}>
          <TouchableDebounce
            style={styles.viewRight}
            onPress={() => onClickRightButton()}>
            <FastImage
              source={require('../../resources/images/1_12_12_0602.png')}
              resizeMode={FastImage.resizeMode.stretch}
              style={styles.btnCreated}
              // borderRadius={moderateScale(10)}
            />
          </TouchableDebounce>
        </View>
      );
    } else if (nameRightButton === 'home') {
      return (
        <View style={{flex: 1.5}}>
          <TouchableDebounce
            style={styles.viewRight}
            onPress={() => onClickRightButton()}>
            <FastImage
              source={require('../../resources/images/home.png')}
              resizeMode={FastImage.resizeMode.stretch}
              style={{
                width: moderateScale(45),
                height: moderateScale(45),
                marginEnd: moderateScale(10),
              }}
              // borderRadius={moderateScale(10)}
            />
          </TouchableDebounce>
        </View>
      );
    } else if (nameRightButton === 'none') {
      return <View style={{flex: 1.5}} />;
    } else {
      return <View />;
    }
  }

  render() {
    const {
      title,
      leftIcon,
      nameRightButton,
      onClickBackButton,
      onClickRightButton,
    } = this.props;
    return (
      <SafeAreaView
        style={{backgroundColor: Constants.BACKGROUND_COLOR_TOOLBAR}}>
        <View style={styles.toolbar}>
          {leftIcon ? this.renderLeftIcon(leftIcon, onClickBackButton) : null}
          <View style={Styles.toolbar}>
            <TextFont
              color="white"
              content={title}
              style={Styles.toolbar_title}
            />
          </View>
          {this.renderRightIcon(nameRightButton, onClickRightButton)}
        </View>
      </SafeAreaView>
    );
  }
}

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
  textRight: {
    color: 'white',
    fontSize: moderateScale(20),
    paddingEnd: moderateScale(5),
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
