import '@/i18n';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ title: 'EduPanda' }} />
          <Stack.Screen name="course/[courseId]" options={{ title: '' }} />
          <Stack.Screen name="learn/[lessonId]" options={{ title: '' }} />
          <Stack.Screen name="quiz/[sectionId]" options={{ title: '' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
