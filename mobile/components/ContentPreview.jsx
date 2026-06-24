import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { colors, font, radius } from '../theme';

// A stylized reconstruction of the captured conversation Scoop is analysing,
// shown at the top of the report so the user sees exactly what was examined.
export default function ContentPreview({ claim }) {
  return (
    <GlassCard contentStyle={styles.card} radii={radius.lg}>
      <Text style={styles.time}>01:47</Text>

      <View style={styles.outRow}>
        <View style={styles.bubbleOut}>
          <Text style={styles.bubbleOutText}>{claim}</Text>
        </View>
      </View>

      <View style={styles.inRow}>
        <View style={styles.replyAvatar} />
        <View style={styles.bubbleIn}>
          <Text style={styles.bubbleInText}>???</Text>
        </View>
      </View>

      <View style={styles.composer}>
        <Ionicons name="happy-outline" size={18} color={colors.textFaint} />
        <Text style={styles.composerText}>Message...</Text>
        <View style={styles.composerIcons}>
          <Feather name="mic" size={16} color={colors.textFaint} />
          <Feather name="image" size={16} color={colors.textFaint} />
          <Ionicons name="happy" size={16} color={colors.textFaint} />
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18 },
  time: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint, textAlign: 'center', marginBottom: 16 },
  outRow: { alignItems: 'flex-end', marginBottom: 14 },
  bubbleOut: {
    maxWidth: '82%',
    backgroundColor: colors.purple,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  bubbleOutText: { fontFamily: font.medium, fontSize: 15, color: '#FFFFFF' },
  inRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  replyAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.14)' },
  bubbleIn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bubbleInText: { fontFamily: font.semibold, fontSize: 15, color: colors.textMuted, letterSpacing: 1 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  composerText: { flex: 1, fontFamily: font.regular, fontSize: 14, color: colors.textFaint },
  composerIcons: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
