import { Stack } from "expo-router";
import React from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack initialRouteName="login">
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signIn" options={{ headerShown: false }} />
    </Stack>
  );
}
