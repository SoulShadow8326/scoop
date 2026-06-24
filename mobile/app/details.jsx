import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import ScreenHeader from '../components/ScreenHeader';
import StatCard from '../components/StatCard';
import MetricBar from '../components/MetricBar';
import StaticBottomNav from '../components/StaticBottomNav';
import { getAnalysis } from '../lib/session';
import { sampleAnalysis } from '../data/mock';
import { colors, font, radius } from '../theme';

const pct = (v) => {
  const n = Number(v) || 0;
  const scaled = n > 0 && n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, Math.round(scaled)));
};

export default function Details() {
  const { id } = useLocalSearchParams();
  const data = (typeof id === 'string' && getAnalysis(id)) || sampleAnalysis;

  const c = data.confidence?.components || {};
  const ci = data.context_integrity || {};
  const em = data.emotional_manipulation || {};
  const passport = (data.trust_passport?.sources || [])[0];
  const judge = data.reasoning?.judge || {};

  const breakdown = [
    { label: 'Source authority', value: pct(c.authority) },
    { label: 'Independence', value: pct(c.independence) },
    { label: 'Historical Trust', value: pct(c.historical_trust) },
    { label: 'Context integrity', value: pct(c.context_integrity) },
    { label: 'Manipulation Resistance', value: pct(c.manipulation_inverse) },
  ];

  const integrityScore = pct(ci.integrity_score);
  const emotionalResistance = pct(em.emotional_resistance ?? (100 - pct(em.manipulation_risk)));

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <ScreenHeader title="Details" />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(450)}>
            <GlassCard contentStyle={styles.breakdownCard} radii={radius.lg}>
              <Text style={styles.cardTitle}>Confidence Breakdown</Text>
              <View style={styles.pills}>
                {breakdown.map((b) => (
                  <View key={b.label} style={styles.pill}>
                    <Text style={styles.pillLabel}>{b.label}</Text>
                    <Text style={styles.pillValue}>{b.value}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(450)} style={styles.stats}>
            <StatCard label={'Context\nIntegrity'} value={integrityScore} />
            <StatCard label={'Emotional\nResistance'} value={emotionalResistance} />
          </Animated.View>

          {passport ? (
            <Animated.View entering={FadeInDown.delay(140).duration(450)}>
              <GlassCard contentStyle={styles.sourceCard} radii={radius.lg}>
                <Text style={styles.sourceUrl}>{passport.url}</Text>
                <View style={styles.sourceBars}>
                  <MetricBar label="Authority" value={pct(passport.authority_score)} showValue={false} delay={60} />
                  <MetricBar label="Evidence density" value={pct(passport.evidence_density)} showValue={false} delay={120} />
                  <MetricBar label="Retraction record" value={pct(passport.retraction_history)} showValue={false} delay={180} />
                  <MetricBar label="Neutral tone" value={100 - pct(passport.emotional_language_tendency)} showValue={false} delay={240} />
                </View>
              </GlassCard>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(200).duration(450)}>
            <GlassCard contentStyle={styles.verdictCard} radii={radius.lg}>
              <View style={styles.verdictHead}>
                <Ionicons name="scale-outline" size={16} color={colors.purple} />
                <Text style={styles.verdictEyebrow}>The ruling</Text>
              </View>
              <Text style={styles.verdictText}>{judge.ruling || 'No ruling was issued.'}</Text>
              {judge.recommended_action ? (
                <View style={styles.action}>
                  <Text style={styles.actionLabel}>What we'd do</Text>
                  <Text style={styles.actionText}>{judge.recommended_action}</Text>
                </View>
              ) : null}
            </GlassCard>
          </Animated.View>

          {(data.recommendations || []).length ? (
            <Animated.View entering={FadeInDown.delay(260).duration(450)}>
              <GlassCard contentStyle={styles.recCard} radii={radius.lg}>
                <Text style={styles.cardTitle}>Recommended next steps</Text>
                <View style={styles.recList}>
                  {data.recommendations.map((r, i) => (
                    <View key={i} style={styles.recRow}>
                      <View style={styles.recDot} />
                      <Text style={styles.recText}>{typeof r === 'string' ? r : r.text || r.action}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </Animated.View>
          ) : null}
        </ScrollView>
        <StaticBottomNav activeKey="index" />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 130, gap: 16 },
  breakdownCard: { padding: 22 },
  cardTitle: { fontFamily: font.bold, fontSize: 19, letterSpacing: -0.4, color: colors.text },
  pills: { marginTop: 18, gap: 11 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  pillLabel: { fontFamily: font.semibold, fontSize: 14, color: '#0C0C0C' },
  pillValue: { fontFamily: font.bold, fontSize: 13, color: colors.purple, fontVariant: ['tabular-nums'] },
  stats: { flexDirection: 'row', gap: 14 },
  sourceCard: { padding: 22 },
  sourceUrl: { fontFamily: font.bold, fontSize: 18, letterSpacing: -0.4, color: colors.white, marginBottom: 18 },
  sourceBars: { gap: 2 },
  verdictCard: { padding: 22 },
  verdictHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  verdictEyebrow: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.purple },
  verdictText: { fontFamily: font.regular, fontSize: 15, lineHeight: 23, color: colors.text },
  action: {
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.purpleSofter,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
  },
  actionLabel: { fontFamily: font.semibold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.purple },
  actionText: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 21, color: colors.text, marginTop: 5 },
  recCard: { padding: 22 },
  recList: { marginTop: 16, gap: 13 },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  recDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.purple, marginTop: 7 },
  recText: { flex: 1, fontFamily: font.regular, fontSize: 14.5, lineHeight: 21, color: colors.textMuted },
});
