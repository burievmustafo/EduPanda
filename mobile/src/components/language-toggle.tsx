import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/store/language-store';
import type { Locale } from '@/types/dto';

const LOCALES: Locale[] = ['en', 'ja'];

export function LanguageToggle() {
  const theme = useTheme();
  const locale = useLanguage((s) => s.locale);
  const setLocale = useLanguage((s) => s.setLocale);

  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <Pressable
            key={l}
            onPress={() => setLocale(l)}
            style={[styles.item, active && { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="smallBold" style={!active && styles.inactive}>
              {l.toUpperCase()}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderRadius: 10, padding: 2 },
  item: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: 8 },
  inactive: { opacity: 0.6 },
});
