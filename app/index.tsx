import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

const App = () => {
  const { user, isLoading } = useActiveUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      {user ? (
        <Redirect href="/private/home" />
      ) : (
        <Redirect href="/public/login" />
      )}
    </>
  );
};

export default App;
