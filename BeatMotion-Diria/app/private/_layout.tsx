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
      <Stack.Screen name="user/events/index" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      {/* MarketPlace */}
      <Stack.Screen
        name="marketplace/MarketplaceList"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="marketplace/MarketplaceDetail"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="user/notifications/myNotifications"
        options={{ headerShown: false }}
      />
      {/* Encuestas */}
       <Stack.Screen 
        name="surveys/list" 
        options={{ 
          headerShown: false,
          title: "Encuestas Disponibles" 
        }} 
      />
      <Stack.Screen 
        name="surveys/take/[surveyId]" 
        options={{ 
          headerShown: false,
          title: "Responder Encuesta",
          presentation: "card"
        }} 
        />
      <Stack.Screen
        name="user/payment/paymentCenter"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="user/enrollment/createEnrollment"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
