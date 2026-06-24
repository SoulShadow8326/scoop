import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, font } from '../theme';

export default function ScreenHeader({ title, onBack }) {
  const router = useRouter();
  const back = onBack || (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')));
  return (
    <View style={styles.row}>
      <Pressable
        onPress={back}
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
        hitSlop={10}
      >
        <Ionicons name="chevron-back" size={22} color={colors.white} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
  title: { flex: 1, textAlign: 'center', fontFamily: font.bold, fontSize: 21, color: colors.text, letterSpacing: -0.4 },
});
