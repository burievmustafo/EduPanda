import '@/i18n';

import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="course/[courseId]" options={{ title: '' }} />
            <Stack.Screen name="learn/[lessonId]" options={{ title: '' }} />
            <Stack.Screen name="quiz/[sectionId]" options={{ title: '' }} />
            <Stack.Screen name="teacher/index" options={{ title: 'EduPanda' }} />
            <Stack.Screen name="teacher/create-course" options={{ title: '' }} />
            <Stack.Screen name="teacher/course/[courseId]" options={{ title: '' }} />
            <Stack.Screen name="teacher/section/[sectionId]/add-lesson" options={{ title: '' }} />
            <Stack.Screen name="teacher/quiz/[sectionId]" options={{ title: '' }} />
            <Stack.Screen name="parent/index" options={{ title: 'EduPanda' }} />
            <Stack.Screen name="parent/[studentId]" options={{ title: '' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
