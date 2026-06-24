import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavPill from './NavPill';

const ROUTES = {
  index: '/(tabs)',
  history: '/(tabs)/history',
  saved: '/(tabs)/saved',
  settings: '/(tabs)/settings',
};

export default function StaticBottomNav({ activeKey = 'index' }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onPress = (key) => {
    Haptics.selectionAsync().catch(() => {});
    router.dismissAll?.();
    router.replace(ROUTES[key]);
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
