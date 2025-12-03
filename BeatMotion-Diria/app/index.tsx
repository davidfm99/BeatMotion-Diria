import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { Redirect } from "expo-router";

const App = () => {
  const { user } = useActiveUser();

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
