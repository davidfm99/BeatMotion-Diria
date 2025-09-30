import { Redirect } from "expo-router";
import { useEffect } from "react";
import useUserStore from "@/store/useUserStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

const App = () => {
  const { user, setUser } = useUserStore();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Current user:", currentUser);
      setUser(currentUser);
    });
    return unsubscribe;
  }, [setUser]);
  return (
    <>
      {user ? (
        <Redirect href="/private/index" />
      ) : (
        <Redirect href="/public/login" />
      )}
    </>
  );
};

export default App;
