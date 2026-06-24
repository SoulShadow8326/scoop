import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import { useStore } from '../lib/store';
import { colors, font, radius } from '../theme';

const ROLES = [
  { value: 'Student', desc: 'Navigating rumors about school policies or safety.' },
  { value: 'Parent or Caregiver', desc: 'Reacting to community panic on social media.' },
  { value: 'Local Journalist', desc: 'Tracking the origin of community claims.' },
  { value: 'School Administrator', desc: 'Understanding how a narrative is spreading.' },
];
const INTERESTS = ['School safety', 'Policy changes', 'Local news', 'Health alerts', 'Event schedules', 'Viral rumors'];
const STEP_NAMES = ['Your role', 'Your community', 'Your interests'];

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [institution, setInstitution] = useState('');
  const [community, setCommunity] = useState('');
  const [interests, setInterests] = useState([]);

  const total = 3;
  const pct = Math.round(((step + 1) / total) * 100);
  const canContinue = step === 0 ? !!role : true;

  const toggleInterest = (v) =>
    setInterests((prev) => (prev.includes(v) ? prev.filter((i) => i !== v) : [...prev, v]));

  const finish = async () => {
    await completeOnboarding({ role, institution, community, interests });
    router.replace('/(tabs)');
  };

  const next = () => {
    if (step === total - 1) return finish();
    setStep(step + 1);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.replace('/welcome')} style={styles.logoRow} hitSlop={10}>
          <Text style={styles.logo}>Scoop</Text>
          <View style={styles.logoDot} />
        </Pressable>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassCard contentStyle={styles.card} radii={radius.xl}>
            <View style={styles.progressHead}>
              <Text style={styles.stepLabel}>Step {step + 1} of {total}</Text>
              <Text style={styles.stepName}>{STEP_NAMES[step]}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${pct}%` }]} />
            </View>

            <Animated.View key={step} entering={FadeIn.duration(320)} style={styles.stepBody}>
              {step === 0 ? (
                <>
                  <Text style={styles.title}>Who are you on Scoop?</Text>
                  <Text style={styles.sub}>We tune how reports read for your point of view.</Text>
                  <View style={styles.options}>
                    {ROLES.map((r) => {
                      const sel = role === r.value;
                      return (
                        <Pressable
                          key={r.value}
                          onPress={() => setRole(r.value)}
                          style={[styles.option, sel && styles.optionSel]}
                        >
                          <Text style={[styles.optionTitle, sel && { color: colors.purple }]}>{r.value}</Text>
                          <Text style={styles.optionDesc}>{r.desc}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <Text style={styles.title}>Where are you based?</Text>
                  <Text style={styles.sub}>Add your school or community. Optional, and you can skip it.</Text>
                  <View style={styles.fields}>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>Institution</Text>
                      <TextInput
                        value={institution}
                        onChangeText={setInstitution}
                        placeholder="Lincoln High School"
                        placeholderTextColor={colors.textDim}
                        style={styles.input}
                      />
                    </View>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>Community or district</Text>
                      <TextInput
                        value={community}
                        onChangeText={setCommunity}
                        placeholder="Riverside County"
                        placeholderTextColor={colors.textDim}
                        style={styles.input}
                      />
                    </View>
                  </View>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <Text style={styles.title}>What do you want to track?</Text>
                  <Text style={styles.sub}>Pick anything that fits. This shapes the claims Scoop surfaces.</Text>
                  <View style={styles.chips}>
                    {INTERESTS.map((i) => {
                      const sel = interests.includes(i);
                      return (
                        <Pressable
                          key={i}
                          onPress={() => toggleInterest(i)}
                          style={[styles.chip, sel && styles.chipSel]}
                        >
                          <Text style={[styles.chipText, sel && { color: colors.purple }]}>{i}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}
            </Animated.View>

            <View style={styles.actions}>
              {step > 0 ? (
                <Pressable onPress={() => setStep(step - 1)} hitSlop={8}>
                  <Text style={styles.back}>Back</Text>
                </Pressable>
              ) : (
                <View />
              )}
              <View style={styles.actionsRight}>
                {step > 0 ? (
                  <Pressable onPress={next} hitSlop={8}>
                    <Text style={styles.skip}>Skip</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={next}
                  disabled={!canContinue}
                  style={({ pressed }) => [
                    styles.next,
                    !canContinue && { opacity: 0.45 },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.nextText}>{step === total - 1 ? 'Enter Scoop' : 'Continue'}</Text>
                </Pressable>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'center', marginTop: 8, marginBottom: 4 },
  logo: { fontFamily: font.bold, fontSize: 22, color: colors.purple, letterSpacing: -0.5 },
  logoDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.purple, marginTop: 6 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  card: { padding: 24 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  stepLabel: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.purple },
  stepName: { fontFamily: font.medium, fontSize: 13, color: colors.textMuted },
  progressTrack: { height: 5, borderRadius: 999, backgroundColor: colors.trackDark, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 999, backgroundColor: colors.purple },
  stepBody: { marginTop: 24 },
  title: { fontFamily: font.bold, fontSize: 23, letterSpacing: -0.6, color: colors.text },
  sub: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: colors.textMuted, marginTop: 8 },
  options: { marginTop: 20, gap: 10 },
  option: {
    padding: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  optionSel: { borderColor: colors.purple, backgroundColor: 'rgba(71,89,228,0.10)' },
  optionTitle: { fontFamily: font.semibold, fontSize: 15.5, color: colors.text },
  optionDesc: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 4 },
  fields: { marginTop: 20, gap: 16 },
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
  chips: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chipSel: { borderColor: colors.purple, backgroundColor: 'rgba(71,89,228,0.10)' },
  chipText: { fontFamily: font.medium, fontSize: 14, color: colors.textMuted },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 },
  actionsRight: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  back: { fontFamily: font.medium, fontSize: 14, color: colors.textMuted },
  skip: { fontFamily: font.medium, fontSize: 14, color: colors.textMuted },
  next: { backgroundColor: colors.purple, borderRadius: radius.sm, paddingHorizontal: 22, paddingVertical: 12 },
  nextText: { fontFamily: font.semibold, fontSize: 14.5, color: '#0B0B0F' },
});
