import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { colors, font, radius } from '../theme';

export default function MetricBar({ label, value = 0, warn = false, showValue = true, delay = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withDelay(delay, withTiming(pct, { duration: 850, easing: Easing.out(Easing.cubic) }));
  }, [pct, delay]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value}%` }));

  return (
    <View style={styles.row}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        {showValue ? <Text style={styles.value}>{pct}</Text> : null}
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { backgroundColor: warn ? colors.red : colors.purple }, fillStyle]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 14 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 },
  label: { fontFamily: font.medium, fontSize: 13.5, color: colors.textMuted },
  value: { fontFamily: font.semibold, fontSize: 12.5, color: colors.text, fontVariant: ['tabular-nums'] },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.trackDark, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
