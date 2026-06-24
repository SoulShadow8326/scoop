import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavPill from './NavPill';

export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const activeKey = state.routes[state.index].name;

  const onPress = (key) => {
    const route = state.routes.find((r) => r.name === key);
    if (!route) return;
    Haptics.selectionAsync().catch(() => {});
    const focused = state.routes[state.index].name === key;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(key);
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
      <NavPill activeKey={activeKey} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
});
