import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font } from '../theme';

export default function EmptyState({ icon = 'sparkles', title, text }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={colors.purple} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 60 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.purpleSofter,
    borderWidth: 1, borderColor: colors.purpleSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: font.bold, fontSize: 20, letterSpacing: -0.4, color: colors.text, textAlign: 'center' },
  text: { fontFamily: font.regular, fontSize: 14.5, lineHeight: 22, color: colors.textMuted, textAlign: 'center', marginTop: 10, maxWidth: 300 },
});
