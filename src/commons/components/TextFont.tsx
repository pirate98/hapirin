import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface TextFontProps {
  content: string | number;
  color?: string; // Note: not used directly in style; you can add it if needed
  style?: StyleProp<TextStyle>;
}

export default class TextFont extends React.Component<TextFontProps> {
  render() {
    const { content, style } = this.props;

    return <Text style={[style, { fontFamily: 'HuiFont' }]}>{content}</Text>;
  }
}
