import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, font, shadow } from '../theme';

export default function PrimaryButton({ label, onPress, style, loading, disabled, variant = 'solid' }) {
  const isGhost = variant === 'ghost';
  return (
    <Pressable
      onPress={(e) => {
        if (disabled || loading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress && onPress(e);
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isGhost ? styles.ghost : styles.solid,
        !isGhost && shadow.glow,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        (disabled || loading) && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.purple : '#0B0B0F'} />
      ) : (
        <Text style={[styles.label, isGhost ? styles.labelGhost : styles.labelSolid]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  solid: { backgroundColor: colors.purple },
  ghost: {
    backgroundColor: colors.purpleSofter,
    borderWidth: 1,
    borderColor: colors.purpleSoft,
  },
  label: { fontFamily: font.semibold, fontSize: 16.5, letterSpacing: -0.2 },
  labelSolid: { color: '#0B0B0F' },
  labelGhost: { color: colors.purple },
});
