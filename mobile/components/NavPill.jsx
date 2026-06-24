import { View, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';

export const NAV_ITEMS = [
  { key: 'index', icon: 'home' },
  { key: 'history', icon: 'time' },
  { key: 'saved', icon: 'star' },
  { key: 'settings', icon: 'settings-sharp' },
];

export default function NavPill({ activeKey, onPress }) {
  return (
    <View style={[styles.pill, shadow.card]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.tint]} />
      <View style={[StyleSheet.absoluteFill, styles.border]} pointerEvents="none" />
      <View style={styles.row}>
        {NAV_ITEMS.map((item) => {
          const focused = item.key === activeKey;
          return (
            <Pressable key={item.key} onPress={() => onPress(item.key)} style={styles.item} hitSlop={6}>
              <View style={[styles.iconWrap, focused ? styles.active : styles.idle]}>
                <Ionicons name={item.icon} size={focused ? 22 : 20} color={focused ? '#FFFFFF' : colors.textFaint} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', borderRadius: radius.pill, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 9 },
  tint: { backgroundColor: 'rgba(20,20,26,0.62)' },
  border: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.glassBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  item: { alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: colors.purple, ...shadow.glow },
  idle: { backgroundColor: 'rgba(255,255,255,0.06)' },
});
