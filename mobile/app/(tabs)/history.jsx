import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenBackground from '../../components/ScreenBackground';
import TabHeader from '../../components/TabHeader';
import ClaimRow from '../../components/ClaimRow';
import EmptyState from '../../components/EmptyState';
import { useStore } from '../../lib/store';

export default function History() {
  const { history } = useStore();
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TabHeader
            eyebrow="Your activity"
            title="History"
            subtitle="Every claim you have run through Scoop."
          />
          {history.length === 0 ? (
            <EmptyState
              icon="time"
              title="No analyses yet"
              text="Paste a link or upload media from Home to run your first report. It will appear here."
            />
          ) : (
            <View style={styles.list}>
              {history.map((entry, i) => (
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
