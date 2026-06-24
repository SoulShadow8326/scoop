import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { useStore } from '../../lib/store';
import { trending } from '../../data/mock';
import { colors, font, radius, shadow } from '../../theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function today() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}

const UPLOADS = [
  { key: 'image', label: 'Upload Image', icon: <Feather name="image" size={22} color={colors.textMuted} /> },
  { key: 'video', label: 'Upload Video', icon: <Ionicons name="play" size={22} color={colors.textMuted} /> },
  { key: 'doc', label: 'Upload Doc', icon: <Ionicons name="document-text-outline" size={22} color={colors.textMuted} /> },
];

const SOCIALS = [
  { key: 'ig', icon: <Feather name="instagram" size={17} color={colors.textMuted} /> },
  { key: 'yt', icon: <Feather name="youtube" size={17} color={colors.textMuted} /> },
  { key: 'x', icon: <FontAwesome6 name="x-twitter" size={15} color={colors.textMuted} /> },
];

export default function Home() {
  const router = useRouter();
  const { profile } = useStore();
  const [link, setLink] = useState('');

  const analyze = (claim, sourceLabel) => {
    const text = (claim || link).trim();
    if (!text) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push({
      pathname: '/analysis',
      params: { claim: text, source: sourceLabel || 'Pasted link' },
    });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.dateRow}>
                <Ionicons name="sparkles" size={15} color={colors.purple} />
                <Text style={styles.date}>{today()}</Text>
              </View>
              <Text style={styles.greeting}>{greeting()}</Text>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/settings')} style={styles.avatar} hitSlop={8}>
              <Ionicons name="person" size={20} color={colors.white} />
            </Pressable>
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard contentStyle={styles.analyseCard} radii={radius.xl}>
              <View style={styles.inputRow}>
                <View style={styles.linkIcon}>
                  <Feather name="link" size={16} color={colors.purple} />
                </View>
                <TextInput
                  value={link}
                  onChangeText={setLink}
                  placeholder="Paste link to analyse"
                  placeholderTextColor={colors.textFaint}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={() => analyze()}
                  returnKeyType="go"
                />
                <Pressable
                  onPress={() => analyze()}
                  style={({ pressed }) => [styles.submit, pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }]}
                  hitSlop={6}
                >
                  <Feather name="arrow-up-right" size={20} color="#FFFFFF" />
                </Pressable>
              </View>
              <Text style={styles.supports}>Supports videos, images, podcasts &amp; social media links</Text>
              <View style={styles.socials}>
                {SOCIALS.map((s) => (
                  <View key={s.key} style={styles.social}>{s.icon}</View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.uploads}>
            {UPLOADS.map((u) => (
              <Pressable
                key={u.key}
                onPress={() => analyze('Uploaded ' + u.label.replace('Upload ', '').toLowerCase() + ' for analysis', u.label)}
                style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.85 }]}
              >
                <GlassCard contentStyle={styles.uploadInner} radii={radius.lg} intensity={20}>
                  <View style={styles.uploadIcon}>{u.icon}</View>
                  <Text style={styles.uploadLabel}>{u.label}</Text>
                </GlassCard>
              </Pressable>
            ))}
          </Animated.View>

          <Text style={styles.sectionTitle}>Trending Fake AI</Text>

          <View style={styles.trending}>
            {trending.map((t, i) => (
              <Animated.View key={t.id} entering={FadeInDown.delay(120 + i * 60).duration(500)}>
                <Pressable
                  onPress={() => analyze(t.title, 'Trending claim')}
                  style={({ pressed }) => pressed && { opacity: 0.9 }}
                >
                  <GlassCard contentStyle={styles.trendInner} radii={radius.lg} intensity={22}>
                    <View style={styles.trendText}>
                      <View style={styles.verifiedRow}>
                        <Ionicons name="shield-checkmark" size={14} color={colors.purple} />
                        <Text style={styles.verifiedText}>
                          Verified by <Text style={styles.verifiedBrand}>Scoop</Text>
                        </Text>
                      </View>
                      <Text style={styles.trendTitle} numberOfLines={2}>{t.title}</Text>
                    </View>
                    <View style={styles.trendThumb} />
                  </GlassCard>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 130 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  date: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  greeting: { fontFamily: font.bold, fontSize: 34, letterSpacing: -1, color: colors.white, marginTop: 6 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.glow,
  },
  analyseCard: { padding: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkIcon: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.purpleSofter,
    alignItems: 'center', justifyContent: 'center',
  },
  input: { flex: 1, fontFamily: font.medium, fontSize: 15.5, color: colors.text, paddingVertical: 4 },
  submit: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.purple,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.glow,
  },
  supports: { fontFamily: font.regular, fontSize: 12.5, color: colors.textFaint, marginTop: 16 },
  socials: { flexDirection: 'row', gap: 9, marginTop: 12 },
  social: {
    width: 34, height: 30, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: colors.glassBorderSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  uploads: { flexDirection: 'row', gap: 12, marginTop: 16 },
  uploadInner: { paddingVertical: 18, paddingHorizontal: 10, alignItems: 'center', gap: 12, minHeight: 110, justifyContent: 'center' },
  uploadIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  uploadLabel: { fontFamily: font.medium, fontSize: 12.5, color: colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontFamily: font.bold, fontSize: 20, letterSpacing: -0.4, color: colors.white, marginTop: 30, marginBottom: 14 },
  trending: { gap: 12 },
  trendInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  trendText: { flex: 1 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifiedText: { fontFamily: font.medium, fontSize: 12.5, color: colors.textMuted },
  verifiedBrand: { fontFamily: font.semibold, color: colors.text },
  trendTitle: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 20, color: colors.text, marginTop: 8 },
  trendThumb: {
    width: 76, height: 64, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: colors.glassBorderSoft,
  },
});
