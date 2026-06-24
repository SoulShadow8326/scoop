import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

export default function ScreenBackground({ children, glow = true }) {
  return (
    <View style={styles.root}>
      {glow ? (
        <>
          <LinearGradient
            colors={['rgba(71,89,228,0.16)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.55 }}
            style={styles.glowTop}
            pointerEvents="none"
          />
          <View style={styles.orb} pointerEvents="none" />
        </>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 420,
  },
  orb: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(71,89,228,0.10)',
  },
});
