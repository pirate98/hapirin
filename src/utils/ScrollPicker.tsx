import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

interface ScrollPickerProps {
  style?: ViewStyle;
  dataSource: any[];
  selectedIndex?: number;
  onValueChange?: (value: any, index: number) => void;
  renderItem?: (data: any, index: number) => React.ReactNode;
  highlightColor?: string;
  itemHeight?: number;
  wrapperBackground?: string;
  wrapperWidth?: number;
  wrapperHeight?: number;
  highlightWidth?: number;
  highlightBorderWidth?: number;
  itemTextStyle?: TextStyle;
  activeItemTextStyle?: TextStyle;
  onMomentumScrollEnd?: () => void;
  onScrollEndDrag?: () => void;
  onTouchStart: () => void;
}

const deviceWidth = Dimensions.get('window').width;

const ScrollPicker: React.FC<ScrollPickerProps> = ({
  dataSource = [1, 2, 3],
  selectedIndex = 0,
  onValueChange,
  renderItem,
  highlightColor = '#333',
  itemHeight = 60,
  wrapperBackground = '#FFFFFF',
  wrapperHeight = 180,
  wrapperWidth = 150,
  highlightWidth = deviceWidth,
  highlightBorderWidth = 2,
  itemTextStyle = {
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    color: '#B4B4B4',
  },
  activeItemTextStyle = {
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    color: '#222121',
  },
  onMomentumScrollEnd = () => {},
  onScrollEndDrag = () => {},
  onTouchStart,
}) => {
  const scrollRef = useRef<ScrollView | null>(null);
  const [selected, setSelected] = useState(selectedIndex);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const dragStarted = useRef(false);
  const momentumStarted = useRef(false);
  const isScrollTo = useRef(false);

  useEffect(() => {
    if (selectedIndex != null) {
      scrollToIndex(selectedIndex);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [selectedIndex]);

  const renderPlaceHolder = () => {
    const height = (wrapperHeight - itemHeight) / 2;
    const header = <View style={{ height, flex: 1 }} />;
    const footer = <View style={{ height, flex: 1 }} />;
    return { header, footer };
  };

  const renderScrollItem = useCallback(
    (data: any, index: number) => {
      const isSelected = index === selected;
      const style = isSelected ? activeItemTextStyle : itemTextStyle;
      return (
        <View
          key={index}
          style={{
            height: itemHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={style}>{data}</Text>
        </View>
      );
    },
    [selected, itemHeight, itemTextStyle, activeItemTextStyle]
  );

  const scrollFix = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const verticalY = e.nativeEvent.contentOffset?.y || 0;
    const selectedIndex = Math.round(verticalY / itemHeight);
    const verticalElem = selectedIndex * itemHeight;

    if (verticalElem !== verticalY) {
      if (Platform.OS === 'ios') isScrollTo.current = true;
      scrollRef.current?.scrollTo({ y: verticalElem, animated: true });
    }

    if (selected !== selectedIndex) {
      setSelected(selectedIndex);
      onValueChange?.(dataSource[selectedIndex], selectedIndex);
    }
  };

  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollEndDrag?.();
    dragStarted.current = false;

    const scrollEvent = {
      nativeEvent: {
        contentOffset: {
          y: e.nativeEvent.contentOffset.y,
        },
      },
    };

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!momentumStarted.current && !dragStarted.current) {
        scrollFix(scrollEvent as NativeSyntheticEvent<NativeScrollEvent>);
      }
    }, 10);
  };

  const handleMomentumScrollBegin = () => {
    momentumStarted.current = true;
    if (timer.current) clearTimeout(timer.current);
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    onMomentumScrollEnd?.();
    momentumStarted.current = false;

    if (!isScrollTo.current && !momentumStarted.current && !dragStarted.current) {
      scrollFix(e);
    }
  };

  const handleScrollBeginDrag = () => {
    dragStarted.current = true;
    if (Platform.OS === 'ios') isScrollTo.current = false;
    if (timer.current) clearTimeout(timer.current);
  };

  const scrollToIndex = (ind: number) => {
    setSelected(ind);
    const y = itemHeight * ind;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 0);
  };

  const { header, footer } = renderPlaceHolder();

  return (
    <View
      style={[
        styles.container,
        {
          height: wrapperHeight,
          width: wrapperWidth,
          backgroundColor: wrapperBackground,
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: (wrapperHeight - itemHeight) / 2,
          height: itemHeight,
          width: highlightWidth,
          borderTopWidth: highlightBorderWidth,
          borderBottomWidth: highlightBorderWidth,
          borderColor: highlightColor,
        }}
      />
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        bounces={false}
        showsVerticalScrollIndicator={false}
        onTouchStart={onTouchStart}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
      >
        {header}
        {dataSource.map(renderScrollItem)}
        {footer}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignSelf: 'center',
    flex: 1,
  },
});

export default ScrollPicker;
