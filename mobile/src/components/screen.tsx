import { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  /** SafeArea'ni tepadan ham qo'llashmi (header bo'lmagan ekranlar uchun true). */
  edgesTop?: boolean;
};

export function Screen({ children, scroll = true, edgesTop = false }: ScreenProps) {
  const edges = edgesTop ? (['top', 'left', 'right'] as const) : (['left', 'right', 'bottom'] as const);
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={edges}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content]}>{children}</View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

export function LoadingState({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator />
      {label ? (
        <ThemedText type="small" style={styles.muted}>
          {label}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  muted: { opacity: 0.7 },
});
