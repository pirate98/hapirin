/**
 * BeetSoft Co., Ltd
 * Introduce Screen
 *
 */

import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import {moderateScale, verticalScale} from 'react-native-size-matters';

import SoundService from '../../soundService/SoundService';
import FastImage from '@d11/react-native-fast-image';
import TouchableDebounce from '../../commons/components/TouchableDebounce';
import {Color} from '../../colors/Colors';
import Constants, {isIpX, ratio} from '../../constants/Constants';
import scales from '../../styles/scales';

const LIST_PAGE_INTRODUCE = [
  {
    id: 2,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_02.png'),
  },
  {
    id: 3,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_03.png'),
  },
  {
    id: 4,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_04.png'),
  },
  {
    id: 5,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_05.png'),
  },
  {
    id: 6,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_06.png'),
  },
  {
    id: 7,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_07.png'),
  },
  {
    id: 8,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_08.png'),
  },
  {
    id: 9,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_09.png'),
  },
  {
    id: 10,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_10.png'),
  },
  {
    id: 11,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_11.png'),
  },
  {
    id: 12,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_12.png'),
  },
  {
    id: 13,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_13.png'),
  },
  {
    id: 14,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_14.png'),
  },
  {
    id: 15,
    image: require('../../resources/images/02_tutorial_images/02_tutorial_15.png'),
  },
];
let screen1 = '';
var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height; //full height

export default class Introduce extends React.Component {
  viewPager: React.Ref<typeof ViewPager>;
  constructor(props) {
    super(props);
    this.arr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const {screen} = this.props;
    if (screen !== undefined) {
      screen1 = screen;
    } else {
      screen1 = '';
    }

    this.state = {
      position: 0,
      screen: screen1,
    };
    this.viewPager = React.createRef();
  }

  async componentDidMount() {
    // audioBtn = await SoundService.loadSoundSel('sel.mp3');
  }

  renderItem = position => {
    return this.arr.map((item, index) =>
      position === index ? (
        <View key={index} style={styles.viewIndicatiorSelect} />
      ) : (
        <View key={index} style={styles.viewIndicatorUnselect} />
      ),
    );
  };

  onPageScrollStateChanged(evt, positionPage) {
    if (evt.nativeEvent.pageScrollState === 'idle') {
      this.setState(() => ({
        position: positionPage,
      }));
    }
  }

  onPageSelected(positionPage) {
    this.setState(() => ({
      position: positionPage,
    }));
  }

  pageMove = delta => {
    var newPosition = this.state.position + delta;
    this.setState({
      position: newPosition,
    });
    this.go(newPosition);
  };

  go = newPage => {
    this.viewPager.current.setPage(newPage);
  };

  renderPageItem() {
    return LIST_PAGE_INTRODUCE.map(page => {
      return (
        <View key={page.id} style={styles.viewBorderIntroduce}>
          <FastImage
            style={styles.imageTutorial}
            source={page.image}
            resizeMode={FastImage.resizeMode.contain}>
            <TouchableDebounce
              onPress={() => this.pageMove(-1)}
              style={styles.leftbutton}>
              <FastImage
                style={styles.exitbutton}
                resizeMode={FastImage.resizeMode.contain}
                source={require('../../resources/images/arrow_left.png')}
              />
            </TouchableDebounce>

            <TouchableDebounce
              onPress={() => this.pageMove(1)}
              style={styles.rightbutton}>
              <FastImage
                style={styles.exitbutton}
                resizeMode={FastImage.resizeMode.contain}
                source={require('../../resources/images/arrow_right.png')}
              />
            </TouchableDebounce>
          </FastImage>
          <TouchableOpacity
            onPress={async () => {
              await SoundService.loadSoundSel('sel.mp3');
              if (this.state.screen !== '') {
                this.props.navigation.pop()
              } else {
                this.props.navigation.navigate(Constants.SCREEN_PRIVACY.KEY)
              }
            }}
            style={styles.touchablehighlightcss}>
            <FastImage
              style={styles.exitbutton}
              source={require('../../resources/images/002.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
        </View>
      );
    });
  }

  render() {
    return (
      <View style={styles.screen}>
        <FastImage
          resizeMode={FastImage.resizeMode.cover}
          source={
            ratio
              ? require('../../resources/images/18x9/splash_18x9.png')
              : require('../../resources/images/16x9/splash_16x9.png')
          }
          style={styles.background}>
          <ViewPager
            style={styles.viewPager}
            initialPage={0}
            // onPageScrollStateChanged={(evt, position) => this.onPageScrollStateChanged(evt, evt.nativeEvent.position)}
            ref={this.viewPager}
            onPageSelected={evt =>
              this.onPageSelected(evt.nativeEvent.position)
            }>
            <View key="1" style={styles.viewBorderIntroduce}>
              <FastImage
                style={styles.imageTutorial}
                source={require('../../resources/images/02_tutorial_images/02_tutorial_01.png')}
                resizeMode={FastImage.resizeMode.contain}>
                <TouchableDebounce
                  onPress={() => this.pageMove(1)}
                  style={styles.rightbutton}>
                  <FastImage
                    style={styles.exitbutton}
                    source={require('../../resources/images/arrow_right.png')}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </TouchableDebounce>
              </FastImage>
              <TouchableOpacity
                onPress={async () => {
                  await SoundService.loadSoundSel('sel.mp3');
                  if (this.state.screen !== '') {
                    this.props.navigation.pop()
                  } else {
                    this.props.navigation.navigate(Constants.SCREEN_PRIVACY.KEY)
                  }
                }}
                style={styles.touchablehighlightcss}>
                <FastImage
                  style={styles.exitbutton}
                  source={require('../../resources/images/002.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            </View>
            {this.renderPageItem()}
            <View key="15" style={styles.viewBorderIntroduce}>
              <FastImage
                style={styles.imageTutorial}
                source={require('../../resources/images/08.png')}
                resizeMode={FastImage.resizeMode.contain}>
                <TouchableOpacity
                  onPress={async () => {
                    await SoundService.loadSoundSel('sel.mp3');
                    if (this.state.screen !== '') {
                      this.props.navigation.pop()
                    } else {
                      this.props.navigation.navigate(Constants.SCREEN_PRIVACY.KEY)
                    }
                  }}
                  style={styles.touchablehighlightbutton}>
                  {this.state.screen !== '' ? (
                    <FastImage
                      style={styles.exitbutton}
                      source={require('../../resources/images/g-3-1.png')}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  ) : (
                    <FastImage
                      style={styles.exitbutton}
                      source={require('../../resources/images/c-1-1.png')}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  )}
                </TouchableOpacity>
                <TouchableDebounce
                  onPress={() => this.pageMove(-1)}
                  style={styles.leftbutton}>
                  <FastImage
                    style={styles.exitbutton}
                    source={require('../../resources/images/arrow_left.png')}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </TouchableDebounce>
              </FastImage>
            </View>
          </ViewPager>
          <View style={styles.group}>
            <View style={[styles.indicatorviewpager, this.props.style]}>
              {this.renderItem(this.state.position)}
            </View>
          </View>
        </FastImage>
      </View>
    );
  }
}

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
