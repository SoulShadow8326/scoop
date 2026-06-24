import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenBackground from '../../components/ScreenBackground';
import TabHeader from '../../components/TabHeader';
import ClaimRow from '../../components/ClaimRow';
import EmptyState from '../../components/EmptyState';
import { useStore } from '../../lib/store';

export default function Saved() {
  const { saved } = useStore();
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TabHeader
            eyebrow="Bookmarked"
            title="Saved"
            subtitle="Claims you have starred to revisit."
          />
          {saved.length === 0 ? (
            <EmptyState
              icon="star"
              title="Nothing saved yet"
              text="Tap the star on any report to keep it here for quick access later."
            />
          ) : (
            <View style={styles.list}>
              {saved.map((entry, i) => (
                <Animated.View key={entry.id + i} entering={FadeInDown.delay(i * 50).duration(420)}>
                  <ClaimRow entry={entry} />
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 130 },
  list: { gap: 12 },
});
