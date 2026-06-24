import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import ScreenBackground from '../../components/ScreenBackground';
import TabHeader from '../../components/TabHeader';
import { useStore } from '../../lib/store';
import { colors, font, radius } from '../../theme';

function Row({ icon, label, value, right, onPress, last }) {
  const content = (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={17} color={colors.purple} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {right || (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textFaint} /> : null)}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export default function Settings() {
  const router = useRouter();
  const { profile, signOut, history, saved } = useStore();
  const [notify, setNotify] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const name = profile?.role || 'Scoop member';
  const place = profile?.institution || profile?.community || 'Community analyst';

  const doSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TabHeader eyebrow="Account" title="Settings" />

          <GlassCard contentStyle={styles.profileCard} radii={radius.lg}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={26} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profilePlace}>{place}</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statNum}>{history.length}</Text>
              <Text style={styles.statLabel}>checks</Text>
            </View>
          </GlassCard>

          <Text style={styles.groupLabel}>Preferences</Text>
          <GlassCard contentStyle={styles.group} radii={radius.lg}>
            <Row
              icon="notifications"
              label="Recheck alerts"
              right={
                <Switch
                  value={notify}
                  onValueChange={setNotify}
                  trackColor={{ true: colors.purple, false: 'rgba(255,255,255,0.12)' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <Row
              icon="phone-portrait"
              label="Haptics"
              right={
                <Switch
                  value={haptics}
                  onValueChange={setHaptics}
                  trackColor={{ true: colors.purple, false: 'rgba(255,255,255,0.12)' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <Row icon="moon" label="Appearance" value="Dark" last />
          </GlassCard>

          <Text style={styles.groupLabel}>Library</Text>
          <GlassCard contentStyle={styles.group} radii={radius.lg}>
            <Row icon="time" label="History" value={`${history.length} analyses`} onPress={() => router.push('/(tabs)/history')} />
            <Row icon="star" label="Saved" value={`${saved.length} starred`} onPress={() => router.push('/(tabs)/saved')} last />
          </GlassCard>

          <Text style={styles.groupLabel}>About</Text>
          <GlassCard contentStyle={styles.group} radii={radius.lg}>
            <Row icon="shield-checkmark" label="How Scoop reads a claim" onPress={() => {}} />
            <Row icon="document-text" label="Privacy" onPress={() => {}} />
            <Row icon="information-circle" label="Version" value="1.0.0" last />
          </GlassCard>

          <Pressable onPress={doSignOut} style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.8 }]}>
            <Ionicons name="log-out-outline" size={18} color={colors.red} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 130 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontFamily: font.semibold, fontSize: 16.5, color: colors.text },
  profilePlace: { fontFamily: font.regular, fontSize: 13, color: colors.textMuted, marginTop: 3 },
  statBadge: { alignItems: 'center' },
  statNum: { fontFamily: font.bold, fontSize: 20, color: colors.purple, fontVariant: ['tabular-nums'] },
  statLabel: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint },
  groupLabel: { fontFamily: font.semibold, fontSize: 12.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint, marginTop: 26, marginBottom: 12, marginLeft: 4 },
  group: { paddingVertical: 4, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  rowIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.purpleSofter, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: font.medium, fontSize: 15, color: colors.text },
  rowValue: { fontFamily: font.regular, fontSize: 12.5, color: colors.textFaint, marginTop: 2 },
  signOut: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    marginTop: 30, paddingVertical: 16, borderRadius: radius.md,
    backgroundColor: 'rgba(238,47,57,0.08)', borderWidth: 1, borderColor: 'rgba(238,47,57,0.22)',
  },
  signOutText: { fontFamily: font.semibold, fontSize: 15, color: colors.red },
});
