import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import type { EventSignupStatus } from "./schema";
import { eventSignupsKeys } from "./useEventSignups";

type UpdateEventSignupStatusInput = {
  signupId: string;
  eventId: string;
  status: Extract<EventSignupStatus, "approved" | "rejected">;
  reviewerId?: string;
};

type CancelEventSignupInput = {
  signupId: string;
  eventId: string;
  userId?: string;
};

const updateSignupStatus = async (input: UpdateEventSignupStatusInput) => {
  const ref = doc(firestore, "eventSignups", input.signupId);
  await updateDoc(ref, {
    status: input.status,
    reviewedBy: input.reviewerId ?? null,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

const cancelSignup = async (input: CancelEventSignupInput) => {
  const ref = doc(firestore, "eventSignups", input.signupId);
  await updateDoc(ref, {
    status: "canceled",
    updatedAt: serverTimestamp(),
  });
};

export const useUpdateEventSignupStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSignupStatus,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventSignupsKeys.event(variables.eventId),
        exact: false,
      });
    },
    onError: (error) => {
      console.error("Error actualizando inscripción de evento:", error);
      Alert.alert("Error", "No se pudo actualizar la inscripción.");
    },
  });
};

export const useCancelEventSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSignup,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventSignupsKeys.event(variables.eventId),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: eventSignupsKeys.myForEvent(variables.eventId, variables.userId ?? ""),
        exact: false,
      });
    },
    onError: (error) => {
      console.error("Error cancelando inscripción de evento:", error);
      Alert.alert("Error", "No se pudo cancelar la inscripción.");
    },
  });
};
