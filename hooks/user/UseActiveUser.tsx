import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect } from "react";

export type UserType = {
  uid: string;
  email: string;
  role: string;
  [key: string]: any;
};

export const useActiveUser = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<UserType | null>({
    queryKey: ["activeUser"],
    queryFn: async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const db = getFirestore();
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      return snap.exists()
        ? ({ ...snap.data(), uid: currentUser.uid } as UserType)
        : null;
    },
    staleTime: Infinity,
  });

  // will listen when the user changes (auth state changes)
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const db = getFirestore();
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = snap.exists()
          ? { ...snap.data(), uid: firebaseUser.uid }
          : null;

        queryClient.setQueryData(["activeUser"], userData);
      } else {
        queryClient.setQueryData(["activeUser"], null);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return { user, isLoading };
};
