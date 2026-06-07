import '@/i18n';
import { installKnownErrorHandlers } from '@/lib/suppress-known-errors';

installKnownErrorHandlers();

import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/lib/query-client';
import { tokenCache } from '@/lib/token-cache';
import { setClerkAuthSnapshot } from '@/lib/clerk-auth-state';
import { setClerkSignOut, setClerkTokenGetter } from '@/lib/clerk-token';
import { getMe } from '@/api/me';
import { useThemeStore } from '@/store/theme-store';
import { useAuthFlow } from '@/store/auth-flow-store';
import { useSession } from '@/store/session-store';
import { colors, colorsDark } from '@/design/tokens';
import { AppStripeProvider } from '@/components/payment/stripe-provider';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

/**
 * Clerk'ni API client/logout bilan bog'laydi va login bo'lganda rolni /me dan oladi.
 */
function ClerkBridge({ children }: { children: ReactNode }) {
  const { getToken, signOut, isLoaded, isSignedIn } = useAuth();

  useLayoutEffect(() => {
    setClerkAuthSnapshot({ isLoaded, isSignedIn: Boolean(isSignedIn) });
  }, [isLoaded, isSignedIn]);

  // API client uchun token getter — layout effect (birinchi paint'dan oldin).
  useLayoutEffect(() => {
    setClerkTokenGetter(
      isSignedIn
        ? (opts) => getToken({ skipCache: opts?.skipCache })
        : null,
    );
    setClerkSignOut(() => signOut());
  }, [getToken, signOut, isSignedIn]);

  // Login / logout: kurslar va profil keshini yangilaymiz (oldingi 401 yoki dev demo).
  useEffect(() => {
    if (!isLoaded) return;
    queryClient.invalidateQueries({ queryKey: ['courses'] });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    queryClient.invalidateQueries({ queryKey: ['teacherDashboard'] });
  }, [isLoaded, isSignedIn]);

  // Login bo'lganda real rolni (student/instructor/admin) /me dan sinxronlaymiz.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    getMe()
      .then((me) => {
        if (active && me?.role) useSession.setState({ role: me.role });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn]);

  return children;
}

function ThemeHydrator({ children }: { children: ReactNode }) {
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const hydrateAuth = useAuthFlow((s) => s.hydrate);
  useEffect(() => {
    void hydrateTheme();
    void hydrateAuth();
  }, [hydrateTheme, hydrateAuth]);
  return children;
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === 'dark' ? colorsDark : colors;

  const navTheme =
    colorScheme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: colors.primary,
            background: palette.background,
            card: palette.surface,
            text: palette.textPrimary,
            border: palette.border,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: colors.primary,
            background: palette.background,
            card: palette.surface,
            text: palette.textPrimary,
            border: palette.border,
          },
        };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: palette.surface },
            headerTintColor: palette.textPrimary,
            contentStyle: { backgroundColor: palette.background },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="dev-roles" options={{ title: 'EduPanda', presentation: 'modal' }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[threadId]" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
          <Stack.Screen name="profile/payment-method" options={{ headerShown: false }} />
          <Stack.Screen name="profile/add-card" options={{ headerShown: false }} />
          <Stack.Screen name="profile/certificates" options={{ headerShown: false }} />
          <Stack.Screen name="profile/help-center" options={{ headerShown: false }} />
          <Stack.Screen name="profile/invite-friends" options={{ headerShown: false }} />
          <Stack.Screen name="payment/overview" options={{ headerShown: false }} />
          <Stack.Screen name="payment/method" options={{ headerShown: false }} />
          <Stack.Screen name="payment/details" options={{ headerShown: false }} />
          <Stack.Screen name="payment/transaction" options={{ headerShown: false }} />
          <Stack.Screen name="course/[courseId]" options={{ title: '' }} />
          <Stack.Screen name="learn/[lessonId]" options={{ title: '' }} />
          <Stack.Screen name="quiz/[sectionId]" options={{ title: '' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings', presentation: 'modal' }} />
          <Stack.Screen name="study-reminders" options={{ title: '' }} />
          <Stack.Screen name="teacher/index" options={{ title: 'EduPanda' }} />
          <Stack.Screen name="teacher/create-course" options={{ title: '' }} />
          <Stack.Screen name="teacher/course/[courseId]" options={{ title: '' }} />
          <Stack.Screen name="teacher/section/[sectionId]/add-lesson" options={{ title: '' }} />
          <Stack.Screen name="teacher/quiz/[sectionId]" options={{ title: '' }} />
          <Stack.Screen name="teacher/lesson/[lessonId]/questions" options={{ title: '' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppStripeProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeHydrator>
            <ClerkBridge>
              <RootNavigator />
            </ClerkBridge>
          </ThemeHydrator>
        </QueryClientProvider>
      </AppStripeProvider>
    </ClerkProvider>
  );
}
