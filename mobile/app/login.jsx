import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import Logo from '../components/Logo';
import { colors, font, radius } from '../theme';

function Field({ label, value, onChangeText, placeholder, secure, keyboardType, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [mode, setMode] = useState(params.mode === 'signup' ? 'signup' : 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSignup = mode === 'signup';

  const proceed = () => router.push('/onboarding');

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable onPress={() => router.replace('/welcome')} hitSlop={10} style={styles.logo}>
              <Logo width={118} />
            </Pressable>

            <Animated.View entering={FadeInDown.duration(500)} style={{ width: '100%' }}>
              <GlassCard contentStyle={styles.cardInner} radii={radius.xl}>
                <Text style={styles.eyebrow}>{isSignup ? 'Get started' : 'Welcome back'}</Text>
                <Text style={styles.title}>{isSignup ? 'Create your account' : 'Sign in to Scoop'}</Text>
                <Text style={styles.subtitle}>
                  {isSignup
                    ? 'Set up Scoop for your community in under a minute.'
                    : 'Understand a claim before you believe it.'}
                </Text>

                <View style={styles.form}>
                  {isSignup ? (
                    <Field label="Full name" value={name} onChangeText={setName} placeholder="Alex Rivera" autoComplete="name" />
                  ) : null}
                  <Field
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@school.org"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                  <Field
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secure
                    autoComplete="password"
                  />
                  <PrimaryButton
                    label={isSignup ? 'Create Account' : 'Sign in'}
                    onPress={proceed}
                    style={{ marginTop: 6 }}
                  />
                </View>

                <View style={styles.divider}>
                  <View style={styles.line} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.line} />
                </View>

                <Pressable
                  onPress={proceed}
                  style={({ pressed }) => [styles.oauth, pressed && { opacity: 0.85 }]}
                >
                  <Ionicons name="logo-google" size={18} color={colors.white} />
                  <Text style={styles.oauthText}>Continue with Google</Text>
                </Pressable>
              </GlassCard>
            </Animated.View>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isSignup ? 'Already have an account?' : 'New to Scoop?'}
              </Text>
              <Pressable onPress={() => setMode(isSignup ? 'signin' : 'signup')} hitSlop={8}>
                <Text style={styles.switchLink}>{isSignup ? 'Sign in' : 'Create an account'}</Text>
              </Pressable>
            </View>

            <Text style={styles.disclaimer}>Demo environment. Credentials are not stored or verified.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 22, paddingTop: 24, paddingBottom: 40 },
  logo: { marginBottom: 26 },
  cardInner: { padding: 26 },
  eyebrow: { ...sx('eyebrow') },
  title: { fontFamily: font.bold, fontSize: 26, letterSpacing: -0.8, color: colors.text, marginTop: 10 },
  subtitle: { fontFamily: font.regular, fontSize: 14.5, lineHeight: 21, color: colors.textMuted, marginTop: 8 },
  form: { marginTop: 22, gap: 15 },
  field: { gap: 8 },
  fieldLabel: { fontFamily: font.medium, fontSize: 13, color: colors.textMuted },
  input: {
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  inputFocused: { borderColor: colors.purple, backgroundColor: 'rgba(71,89,228,0.08)' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline },
  dividerText: { fontFamily: font.medium, fontSize: 13, color: colors.textFaint },
  oauth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  oauthText: { fontFamily: font.medium, fontSize: 15, color: colors.text },
  switchRow: { flexDirection: 'row', gap: 6, marginTop: 26, alignItems: 'center' },
  switchText: { fontFamily: font.medium, fontSize: 14, color: colors.textMuted },
  switchLink: { fontFamily: font.semibold, fontSize: 14, color: colors.purple },
  disclaimer: { fontFamily: font.regular, fontSize: 12.5, color: colors.textDim, marginTop: 16, textAlign: 'center' },
});

function sx(kind) {
  if (kind === 'eyebrow') {
    return { fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.purple };
  }
  return {};
}
