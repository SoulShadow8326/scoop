import { View, Text, StyleSheet } from 'react-native';
import { colors, font } from '../theme';

export default function TabHeader({ eyebrow, title, subtitle }) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  eyebrow: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.purple, marginBottom: 8 },
  title: { fontFamily: font.bold, fontSize: 32, letterSpacing: -1, color: colors.white },
  subtitle: { fontFamily: font.regular, fontSize: 14.5, lineHeight: 21, color: colors.textMuted, marginTop: 8 },
});
