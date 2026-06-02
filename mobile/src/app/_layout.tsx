import '@/i18n';

import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CLERK_PUBLISHABLE_KEY } from '@/config';
import { setTokenGetter } from '@/lib/auth-token';
import { tokenCache } from '@/lib/token-cache';

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // API client uchun Clerk token getter'ini ulash.
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  // Auth gate: login qilinmagan bo'lsa sign-in'ga, login bo'lsa app'ga.
  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: 'EduPanda' }} />
        <Stack.Screen name="course/[courseId]" options={{ title: '' }} />
        <Stack.Screen name="learn/[lessonId]" options={{ title: '' }} />
        <Stack.Screen name="quiz/[sectionId]" options={{ title: '' }} />
        <Stack.Screen name="teacher/index" options={{ title: 'EduPanda' }} />
        <Stack.Screen name="parent/index" options={{ title: 'EduPanda' }} />
        <Stack.Screen name="parent/[studentId]" options={{ title: '' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <ClerkLoaded>
          <RootNavigator />
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
