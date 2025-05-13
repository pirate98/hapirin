import React, { Component, ReactNode } from 'react';
import { TouchableOpacity, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import { debounce } from '../../utils/debounceFunctions';

interface TouchableDebounceProps {
  onPress: (event?: GestureResponderEvent) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
}

class TouchableDebounce extends Component<TouchableDebounceProps> {
  // Debounced handler stored once to avoid re-debouncing on every render
  private debouncedOnPress: (event: GestureResponderEvent) => void;

  constructor(props: TouchableDebounceProps) {
    super(props);
    this.debouncedOnPress = debounce((event: GestureResponderEvent) => {
      this.props.onPress?.(event);
    }, 300);
  }

  render() {
    const { style, activeOpacity, children } = this.props;

    return (
      <TouchableOpacity
        style={style}
        activeOpacity={activeOpacity}
        onPress={this.debouncedOnPress}
      >
        {children}
      </TouchableOpacity>
    );
  }
}

export default TouchableDebounce;
