import { auth, firestore } from "@/firebaseConfig";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export type UserType = {
  uid: string;
  email: string;
  role: string;
  [key: string]: any;
};

export const useActiveUser = () => {
  const queryClient = useQueryClient();
  const [authReady, setAuthReady] = useState(false);

  const { data: user, isLoading } = useQuery<UserType | null>({
    queryKey: ["activeUser"],
    enabled: authReady,
    queryFn: async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const snap = await getDoc(doc(firestore, "users", currentUser.uid));

      return snap.exists()
        ? ({ ...snap.data(), uid: currentUser.uid } as UserType)
        : null;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(firestore, "users", firebaseUser.uid));
        const userData = snap.exists()
          ? ({ ...snap.data(), uid: firebaseUser.uid } as UserType)
          : null;

        queryClient.setQueryData(["activeUser"], userData);
      } else {
        queryClient.setQueryData(["activeUser"], null);
      }

      setAuthReady(true);
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    user,
    isLoading: isLoading || !authReady,
  };
};
