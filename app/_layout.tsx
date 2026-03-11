// app/_layout.tsx
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: process.env.EXPO_PUBLIC_APP_ENV !== "production",
  environment: process.env.EXPO_PUBLIC_APP_ENV,
  enabled:
    process.env.EXPO_PUBLIC_APP_ENV !== "development" &&
    !!process.env.EXPO_PUBLIC_SENTRY_DSN,
});

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useActiveUser();

  return (
    <Stack>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="public" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="private" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AppContent />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </QueryClientProvider>
  );
});
