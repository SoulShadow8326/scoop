import { Component } from 'react';
import { Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { logoXml } from '../assets/logoXml';
import { colors, font } from '../theme';

const ASPECT = 1624 / 478;

class LogoBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <Text style={{ fontFamily: font.bold, fontSize: this.props.fallbackSize, color: colors.purple, letterSpacing: -1 }}>
          Scoop
        </Text>
      );
    }
    return this.props.children;
  }
}

export default function Logo({ width = 150 }) {
  return (
    <LogoBoundary fallbackSize={width * 0.34}>
      <SvgXml xml={logoXml} width={width} height={width / ASPECT} />
    </LogoBoundary>
  );
}
