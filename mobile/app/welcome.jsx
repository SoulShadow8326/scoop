import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import ScreenBackground from '../components/ScreenBackground';
import PrimaryButton from '../components/PrimaryButton';
import Logo from '../components/Logo';
import { colors, font } from '../theme';

export default function Welcome() {
  const router = useRouter();
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Animated.View entering={FadeIn.duration(600)} style={styles.logoWrap}>
            <Logo width={208} />
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(120).duration(620)} style={styles.headline}>
            Verify Before{'\n'}You Trust!
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(220).duration(620)} style={styles.sub}>
            Trust the evidence. Own the decision.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(340).duration(620)} style={styles.actions}>
            <PrimaryButton label="Create Account" onPress={() => router.push('/login?mode=signup')} />
            <Pressable
              onPress={() => router.push('/login?mode=signin')}
              style={styles.loginRow}
              hitSlop={8}
            >
              <Text style={styles.loginText}>Already have an account? </Text>
              <Text style={styles.loginLink}>Log in</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  top: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: '24%' },
  logoWrap: { marginBottom: 40 },
  headline: {
    fontFamily: font.bold,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1.4,
    textAlign: 'center',
    color: colors.white,
  },
  sub: {
    marginTop: 18,
    fontFamily: font.medium,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: { alignSelf: 'stretch', marginTop: 44 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  loginText: { fontFamily: font.medium, fontSize: 14, color: colors.textMuted },
  loginLink: { fontFamily: font.semibold, fontSize: 14, color: colors.purple },
});
