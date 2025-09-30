import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../firebaseConfig";

import useUserStore from "@/store/useUserStore";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Current user:", currentUser);
      setUser(currentUser);
    });
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    if (user === null) {
      router.replace("/public/login");
    }
  }, [user]);

  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="public" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="private" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
