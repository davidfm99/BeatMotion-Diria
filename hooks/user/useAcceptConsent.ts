import { firestore } from "@/firebaseConfig";
import { useMutation } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";

const acceptConsent = (uid: string) =>
  updateDoc(doc(firestore, "users", uid), {
    consentAccepted: true,
    consentAcceptedAt: new Date(),
  });

export const useAcceptConsent = () => useMutation({ mutationFn: acceptConsent });
