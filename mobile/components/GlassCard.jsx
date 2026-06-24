import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius } from '../theme';

export default function GlassCard({
  children,
  style,
  contentStyle,
  intensity = 28,
  radii = radius.lg,
  border = colors.glassBorder,
  tintColor = colors.glass,
}) {
  return (
    <View style={[styles.wrap, { borderRadius: radii }, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radii, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: border },
        ]}
        pointerEvents="none"
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  content: {
    padding: 20,
  },
});
