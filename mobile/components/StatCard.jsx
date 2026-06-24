import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { colors, font, radius } from '../theme';

export default function StatCard({ label, value, suffix, style }) {
  return (
    <GlassCard style={[styles.card, style]} contentStyle={styles.content} intensity={24}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.lg },
  content: { padding: 20, minHeight: 132, justifyContent: 'space-between' },
  label: { fontFamily: font.semibold, fontSize: 16, lineHeight: 21, color: colors.text, letterSpacing: -0.3 },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 },
  value: { fontFamily: font.bold, fontSize: 52, lineHeight: 54, color: colors.purple, letterSpacing: -2, fontVariant: ['tabular-nums'] },
  suffix: { fontFamily: font.semibold, fontSize: 18, color: colors.textMuted, marginBottom: 8, marginLeft: 2 },
});
