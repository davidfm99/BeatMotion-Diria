import { Redirect } from "expo-router";
import { useActiveUser } from "@/hooks/UseActiveUser";

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
