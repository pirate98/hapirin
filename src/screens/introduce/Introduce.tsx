import React, { useState, useEffect, useRef } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
  ViewStyle,
  Platform
} from 'react-native';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import FastImage from '@d11/react-native-fast-image';
import { moderateScale } from 'react-native-size-matters';
import TouchableDebounce from '../../commons/components/TouchableDebounce';
import SoundService from '../../soundService/SoundService';
import Constants, { isIpX, ratio } from '../../constants/Constants';
import { Color } from '../../colors/Colors';

const { width, height } = Dimensions.get('window');

interface IntroduceProps {
  navigation: any;
  style?: ViewStyle;
  screen?: string;
}

const LIST_PAGE_INTRODUCE = [
  { id: 2, image: require('../../resources/images/02_tutorial_images/02_tutorial_02.png') },
  { id: 3, image: require('../../resources/images/02_tutorial_images/02_tutorial_03.png') },
  { id: 4, image: require('../../resources/images/02_tutorial_images/02_tutorial_04.png') },
  { id: 5, image: require('../../resources/images/02_tutorial_images/02_tutorial_05.png') },
  { id: 6, image: require('../../resources/images/02_tutorial_images/02_tutorial_06.png') },
  { id: 7, image: require('../../resources/images/02_tutorial_images/02_tutorial_07.png') },
  { id: 8, image: require('../../resources/images/02_tutorial_images/02_tutorial_08.png') },
  { id: 9, image: require('../../resources/images/02_tutorial_images/02_tutorial_09.png') },
  { id: 10, image: require('../../resources/images/02_tutorial_images/02_tutorial_10.png') },
  { id: 11, image: require('../../resources/images/02_tutorial_images/02_tutorial_11.png') },
  { id: 12, image: require('../../resources/images/02_tutorial_images/02_tutorial_12.png') },
  { id: 13, image: require('../../resources/images/02_tutorial_images/02_tutorial_13.png') },
  { id: 14, image: require('../../resources/images/02_tutorial_images/02_tutorial_14.png') },
  { id: 15, image: require('../../resources/images/02_tutorial_images/02_tutorial_15.png') },
];

const Introduce: React.FC<IntroduceProps> = ({ navigation, style, screen = '' }) => {
  const viewPagerRef = useRef<PagerView>(null);
  const [position, setPosition] = useState(0);
  const [uiReady, setUiReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUiReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const onPageSelected = (event: PagerViewOnPageSelectedEvent) => {
    setPosition(event.nativeEvent.position);
  };

  const pageMove = (delta: number) => {
    if (!uiReady) return;
    const newPos = position + delta;
    setPosition(newPos);
    viewPagerRef.current?.setPage?.(newPos);
  };

  const renderIndicators = () => {
    return LIST_PAGE_INTRODUCE.map((_, idx) => (
      <View
        key={idx}
        style={position === idx ? styles.viewIndicatiorSelect : styles.viewIndicatorUnselect}
      />
    ));
  };

  const handleExit = async () => {
    await SoundService.loadSoundSel('sel.mp3');
    if (screen) {
      navigation.pop();
    } else {
      navigation.navigate(Constants.SCREEN_PRIVACY.KEY);
    }
  };

  const renderTutorialPage = (page: { id: number; image: any }, index: number) => (
    <View key={page.id} style={styles.viewBorderIntroduce}>
      <FastImage style={styles.imageTutorial} source={page.image} resizeMode="contain">
        <TouchableDebounce onPress={() => pageMove(-1)} style={styles.leftbutton}>
          <FastImage style={styles.exitbutton} resizeMode="contain" source={require('../../resources/images/arrow_left.png')} />
        </TouchableDebounce>
        <TouchableDebounce onPress={() => pageMove(1)} style={styles.rightbutton}>
          <FastImage style={styles.exitbutton} resizeMode="contain" source={require('../../resources/images/arrow_right.png')} />
        </TouchableDebounce>
      </FastImage>

      <TouchableOpacity onPress={handleExit} style={styles.touchablehighlightcss}>
        <FastImage style={styles.exitbutton} resizeMode="contain" source={require('../../resources/images/002.png')} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FastImage
        resizeMode="cover"
        source={
          ratio
            ? require('../../resources/images/18x9/splash_18x9.png')
            : require('../../resources/images/16x9/splash_16x9.png')
        }
        style={styles.background}
      >
        <PagerView
          style={styles.viewPager}
          initialPage={0}
          ref={viewPagerRef}
          onPageSelected={onPageSelected}
        >
          {/* First tutorial page */}
          <View key="first" style={styles.viewBorderIntroduce}>
            <FastImage
              style={styles.imageTutorial}
              source={require('../../resources/images/02_tutorial_images/02_tutorial_01.png')}
              resizeMode="contain"
            >
              <TouchableDebounce onPress={() => pageMove(1)} style={styles.rightbutton}>
                <FastImage style={styles.exitbutton} resizeMode="contain" source={require('../../resources/images/arrow_right.png')} />
              </TouchableDebounce>
            </FastImage>
            <TouchableOpacity onPress={handleExit} style={styles.touchablehighlightcss}>
              <FastImage style={styles.exitbutton} resizeMode="contain" source={require('../../resources/images/002.png')} />
            </TouchableOpacity>
          </View>

          {/* Intermediate tutorial pages */}
          {LIST_PAGE_INTRODUCE.map(renderTutorialPage)}

          {/* Last tutorial page */}
          <View key="last" style={styles.viewBorderIntroduce}>
            <FastImage
              style={styles.imageTutorial}
              source={require('../../resources/images/08.png')}
              resizeMode="contain"
            >
              <TouchableOpacity onPress={handleExit} style={styles.touchablehighlightbutton}>
                <FastImage
                  style={styles.exitbutton}
                  resizeMode="contain"
                  source={
                    screen
                      ? require('../../resources/images/g-3-1.png')
                      : require('../../resources/images/c-1-1.png')
                  }
                />
              </TouchableOpacity>
              <TouchableDebounce onPress={() => pageMove(-1)} style={styles.leftbutton}>
                <FastImage style={styles.exitbutton} resizeMode="contain" source={require('../../resources/images/arrow_left.png')} />
              </TouchableDebounce>
            </FastImage>
          </View>
        </PagerView>

        <View style={styles.group}>
          <View style={[styles.indicatorviewpager, style]}>
            {renderIndicators()}
          </View>
        </View>
      </FastImage>
    </View>
  );
};

export default Introduce;


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  indicatorviewpager: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  background: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  imageTutorial: {
    width: '80%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewPager: {
    flex: 8,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  group: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchablehighlightcss: {
    width: '15%',
    height: '15%',
    alignSelf: 'flex-end',
    position: 'absolute',
    top: ratio
      ? Platform.OS === 'ios' && (width > 800 || height > 800)
        ? '11%'
        : '9%'
      : Platform.OS === 'ios' && (width > 800 || height > 800)
      ? '11%'
      : '5%',
    right: Platform.OS === 'ios' && (width > 800 || height > 800) ? '2%' : '5%',
  },
  exitbutton: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  touchablehighlightbutton: {
    width: moderateScale(120),
    height: moderateScale(40),
    alignSelf: 'center',
    position: 'absolute',
    top: ratio
      ? Platform.OS === 'android'
        ? '78%'
        : isIpX
        ? '76%'
        : '83%'
      : Platform.OS === 'android'
      ? '81%'
      : isIpX
      ? '76%'
      : '83%',
  },
  leftbutton: {
    width: moderateScale(90),
    height: moderateScale(30),
    top: ratio
      ? Platform.OS === 'android'
        ? '80%'
        : isIpX
        ? '78%'
        : '84%'
      : Platform.OS === 'android'
      ? '83%'
      : isIpX
      ? '78%'
      : '84%',
    position: 'absolute',
    alignSelf: 'flex-start',
    left: '-8%',
  },
  rightbutton: {
    width: moderateScale(90),
    height: moderateScale(30),
    top: ratio
      ? Platform.OS === 'android'
        ? '80%'
        : isIpX
        ? '78%'
        : '84%'
      : Platform.OS === 'android'
      ? '83%'
      : isIpX
      ? '78%'
      : '84%',
    position: 'absolute',
    alignSelf: 'flex-end',
    right: '-8%',
  },
  imagebuttonchangepage: {
    width: moderateScale(90),
    height: moderateScale(30),
  },
  viewIndicatiorSelect: {
    margin: moderateScale(4),
    width: moderateScale(8),
    height: moderateScale(8),
    backgroundColor: 'white',
    borderRadius: 5,
  },
  viewIndicatorUnselect: {
    margin: moderateScale(4),
    width: moderateScale(8),
    height: moderateScale(8),
    backgroundColor: 'gray',
    borderRadius: 5,
  },
  viewBorderIntroduce: {
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    width: width,
    height: height,
  },
});
