import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GlassCard from './GlassCard';
import { putAnalysis } from '../lib/session';
import { useStore } from '../lib/store';
import { colors, font, radius } from '../theme';

function band(score) {
  if (score < 45) return { label: 'Low', color: colors.red };
  if (score < 70) return { label: 'Moderate', color: '#E0A100' };
  return { label: 'High', color: '#3FB970' };
}

function when(at) {
  if (!at) return '';
  const diff = Date.now() - at;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return new Date(at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function ClaimRow({ entry }) {
  const router = useRouter();
  const { toggleSaved, isSaved } = useStore();
  const b = band(entry.score || 0);
  const saved = isSaved(entry.id);

  const open = () => {
    if (entry.result) putAnalysis(entry.result);
    router.push({ pathname: '/details', params: { id: entry.id } });
  };

  return (
    <Pressable onPress={open} style={({ pressed }) => pressed && { opacity: 0.9 }}>
      <GlassCard contentStyle={styles.inner} radii={radius.lg} intensity={22}>
        <View style={[styles.scoreChip, { borderColor: b.color + '55', backgroundColor: b.color + '1A' }]}>
          <Text style={[styles.scoreNum, { color: b.color }]}>{Math.round(entry.score || 0)}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.claim} numberOfLines={2}>{entry.claim}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{entry.source || 'Claim'}</Text>
            <View style={styles.dot} />
            <Text style={styles.meta}>{when(entry.at)}</Text>
          </View>
        </View>
        <Pressable onPress={() => toggleSaved(entry)} hitSlop={10} style={styles.star}>
          <Ionicons name={saved ? 'star' : 'star-outline'} size={19} color={saved ? colors.purple : colors.textFaint} />
        </Pressable>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  scoreChip: { width: 46, height: 46, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontFamily: font.bold, fontSize: 17, fontVariant: ['tabular-nums'] },
  body: { flex: 1 },
  claim: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 20, color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  meta: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textDim },
  star: { padding: 2 },
});
