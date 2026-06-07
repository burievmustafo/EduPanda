import { ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { colors, layout } from '@/design/tokens';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  /** SafeArea'ni tepadan ham qo'llashmi (header bo'lmagan ekranlar uchun true). */
  edgesTop?: boolean;
  /** Pull-to-refresh — berilsa, tortib yangilash yoqiladi. */
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function Screen({
  children,
  scroll = true,
  edgesTop = false,
  onRefresh,
  refreshing = false,
}: ScreenProps) {
  const edges = edgesTop ? (['top', 'left', 'right'] as const) : (['left', 'right', 'bottom'] as const);
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={edges}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
              ) : undefined
            }>
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
  content: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  muted: { opacity: 0.7 },
});
