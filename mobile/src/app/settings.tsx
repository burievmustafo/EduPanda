import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/store/language-store';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();
  const setLocale = useLanguage((s) => s.setLocale);

  return (
    <Screen edgesTop>
      <ThemedText style={styles.title}>Settings</ThemedText>

      <SectionHeader label="Language" />
      <ThemedView style={[styles.group, { backgroundColor: theme.backgroundCard }]}>
        <SettingRow
          icon="language-outline"
          label="English"
          selected={locale === 'en'}
          onPress={() => setLocale('en')}
        />
        <Divider />
        <SettingRow
          icon="language-outline"
          label="日本語"
          selected={locale === 'ja'}
          onPress={() => setLocale('ja')}
        />
      </ThemedView>

      <SectionHeader label="Account" />
      <ThemedView style={[styles.group, { backgroundColor: theme.backgroundCard }]}>
        <SettingRow
          icon="person-outline"
          label="Switch role"
          onPress={() => router.replace('/')}
          chevron
        />
      </ThemedView>

      <SectionHeader label="About" />
      <ThemedView style={[styles.group, { backgroundColor: theme.backgroundCard }]}>
        <SettingRow icon="information-circle-outline" label="EduPanda v1.0" />
        <Divider />
        <SettingRow icon="code-outline" label="Powered by Next.js + Expo + MongoDB" />
      </ThemedView>
    </Screen>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <ThemedText style={styles.sectionLabel}>{label.toUpperCase()}</ThemedText>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

function SettingRow({
  icon,
  label,
  selected,
  onPress,
  chevron,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected?: boolean;
  onPress?: () => void;
  chevron?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <Ionicons name={icon} size={20} color={theme.textSecondary} />
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <View style={styles.rowRight}>
        {selected && (
          <Ionicons name="checkmark" size={18} color={Brand.primary} />
        )}
        {chevron && (
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginBottom: Spacing.three },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, opacity: 0.5, marginTop: Spacing.three, marginBottom: Spacing.one },
  group: { borderRadius: Radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, gap: Spacing.two },
  rowLabel: { flex: 1, fontSize: 16 },
  rowRight: { alignItems: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.four + 20 },
});
