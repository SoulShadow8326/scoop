import { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import ScreenHeader from '../components/ScreenHeader';
import ContentPreview from '../components/ContentPreview';
import StaticBottomNav from '../components/StaticBottomNav';
import { analyzeClaim } from '../lib/api';
import { putAnalysis } from '../lib/session';
import { useStore } from '../lib/store';
import { colors, font, radius, shadow } from '../theme';

export default function Analysis() {
  const router = useRouter();
  const { claim, source } = useLocalSearchParams();
  const { addHistory } = useStore();
  const [stage, setStage] = useState({ pct: 4, label: 'Validating your question' });
  const [result, setResult] = useState(null);
  const started = useRef(false);

  const claimText = typeof claim === 'string' ? claim : 're-neet leaked again ?';
  const sourceLabel = typeof source === 'string' ? source : 'Pasted link';

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const res = await analyzeClaim({
        claim: claimText,
        sourceLabel,
        onStage: (s) => setStage(s),
      });
      putAnalysis(res);
      addHistory({
        id: res.claim_id,
        claim: res.claim,
        source: res.source_label,
        score: res.confidence?.score ?? 0,
        flags: (res.flags || []).length,
        at: Date.now(),
        result: res,
      });
      setResult(res);
    })();
  }, []);

  const done = !!result;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <ScreenHeader title={done ? 'Analysis Complete' : 'Analysing'} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(450)}>
            <ContentPreview claim={claimText} />
          </Animated.View>

          {!done ? (
            <Progress stage={stage} />
          ) : (
            <Animated.View entering={FadeIn.duration(450)}>
              <View style={styles.flags}>
                {(result.flags || []).map((f, i) => (
                  <Animated.View key={f.key} entering={FadeInDown.delay(i * 90).duration(450)}>
                    <Pressable
                      onPress={() => router.push({ pathname: '/details', params: { id: result.claim_id } })}
                      style={({ pressed }) => pressed && { opacity: 0.85 }}
                    >
                      <GlassCard contentStyle={styles.flagInner} radii={radius.md} intensity={22}>
                        <View style={styles.check}>
                          <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                        </View>
                        <Text style={styles.flagLabel}>{f.label}</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                      </GlassCard>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>

              <Pressable
                onPress={() => router.push({ pathname: '/details', params: { id: result.claim_id } })}
                style={({ pressed }) => [styles.readMore, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.readMoreText}>Read more</Text>
                <Ionicons name="arrow-forward" size={17} color={colors.text} />
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
        <StaticBottomNav activeKey="index" />
      </SafeAreaView>
    </ScreenBackground>
  );
}

function Progress({ stage }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(stage.pct, { duration: 450, easing: Easing.out(Easing.cubic) });
  }, [stage.pct]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 18 }}>
      <GlassCard contentStyle={styles.progressInner} radii={radius.md}>
        <View style={styles.progressHead}>
          <Text style={styles.progressLabel}>{stage.label}</Text>
          <Text style={styles.progressPct}>{stage.pct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, fill]} />
        </View>
        <Text style={styles.progressHint}>Scoop is reading sources, framing, and context integrity.</Text>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 130 },
  progressInner: { padding: 20 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  progressLabel: { fontFamily: font.semibold, fontSize: 14.5, color: colors.text },
  progressPct: { fontFamily: font.semibold, fontSize: 13, color: colors.purple, fontVariant: ['tabular-nums'] },
  progressTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colors.trackDark, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.purple },
  progressHint: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 18, color: colors.textFaint, marginTop: 14 },
  flags: { gap: 12, marginTop: 18 },
  flagInner: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 16 },
  check: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.pink,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.glow,
    shadowColor: colors.pink,
  },
  flagLabel: { flex: 1, fontFamily: font.medium, fontSize: 15, color: colors.text },
  readMore: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 16,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  readMoreText: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
});
