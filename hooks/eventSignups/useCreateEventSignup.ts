import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  collection,
  doc,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import type { EventSignupStatus } from "./schema";
import { ACTIVE_SIGNUP_STATUSES, computeTotals } from "./utils";
import { eventSignupsKeys } from "./useEventSignups";

type CreateEventSignupInput = {
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  inviteeCount: number;
  pricePerHead: number | null;
  isPublic: boolean;
  isFree: boolean;
  capacity: number | null | undefined;
  receiptUrl?: string | null;
};

const collectionRef = collection(firestore, "eventSignups");

export const createEventSignup = async (input: CreateEventSignupInput) => {
  const { totalAttendees, totalPrice, pricePerHead } = computeTotals({
    inviteeCount: input.inviteeCount,
    pricePerHead: input.pricePerHead,
  });

  const status: EventSignupStatus = input.isFree ? "autoApproved" : "pending";
  const safeInviteeCount = Math.max(0, Math.floor(input.inviteeCount ?? 0));

  const result = await runTransaction(firestore, async (tx) => {
    // Capacity check when capacity is defined and > 0
    if (input.capacity && input.capacity > 0) {
      const activeQuery = query(
        collectionRef,
        where("eventId", "==", input.eventId),
        where("status", "in", ACTIVE_SIGNUP_STATUSES)
      );
      const snapshot = await tx.get(activeQuery);
      const used = snapshot.docs.reduce((sum, docSnap) => {
        const data = docSnap.data() as { totalAttendees?: number };
        const attendees = Number(data.totalAttendees ?? 0);
        return sum + (Number.isFinite(attendees) ? attendees : 0);
      }, 0);

      if (used + totalAttendees > input.capacity) {
        throw new Error("NO_AVAILABLE_SLOTS");
      }
    }

    const ref = doc(collectionRef);
    tx.set(ref, {
      eventId: input.eventId,
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      inviteeCount: safeInviteeCount,
      totalAttendees,
      pricePerHead,
      totalPrice,
      status,
      receiptUrl: input.receiptUrl ?? null,
      isFree: input.isFree,
      isPublic: input.isPublic,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: ref.id, status };
  });

  return result;
};

export const useCreateEventSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventSignup,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventSignupsKeys.event(variables.eventId),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: eventSignupsKeys.myForEvent(variables.eventId, variables.userId),
      });
    },
    onError: (error) => {
      const message =
        (error as Error)?.message === "NO_AVAILABLE_SLOTS"
          ? "Lo sentimos! Ya no hay cupos disponibles."
          : "No se pudo completar el registro al evento.";
      console.error("Error creando inscripción de evento:", error);
      Alert.alert("Error", message);
    },
  });
};
