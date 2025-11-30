import { Stack } from "expo-router";

export default function PrivateLayout() {
  return (
    <Stack initialRouteName="home">
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen
        name="user/course/[courseId]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="user/events/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      {/* MarketPlace */}
      <Stack.Screen
        name="marketplace/MarketplaceList"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="user/notifications/myNotifications"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="user/payment/paymentCenter"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
