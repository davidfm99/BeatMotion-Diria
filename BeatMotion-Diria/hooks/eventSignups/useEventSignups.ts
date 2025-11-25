import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import {
  eventSignupCollectionSchema,
  eventSignupSchema,
  type EventSignup,
  type EventSignupStatus,
} from "./schema";
import { ACTIVE_SIGNUP_STATUSES, sumActiveAttendees } from "./utils";

const collectionRef = collection(firestore, "eventSignups");

const serializeStatuses = (statuses?: EventSignupStatus[]) =>
  statuses && statuses.length > 0 ? statuses.slice().sort().join("|") : "all";

export const eventSignupsKeys = {
  all: ["eventSignups"] as const,
  event: (eventId: string) => ["eventSignups", "event", eventId] as const,
  eventWithStatus: (eventId: string, statuses?: EventSignupStatus[]) =>
    ["eventSignups", "event", eventId, "status", serializeStatuses(statuses)] as const,
  myForEvent: (eventId: string, userId: string) =>
    ["eventSignups", "event", eventId, "user", userId] as const,
  activeCount: (eventId: string) =>
    ["eventSignups", "event", eventId, "activeCount"] as const,
};

const buildEventSignupsQuery = (eventId: string, statuses?: EventSignupStatus[]) => {
  const constraints: any[] = [where("eventId", "==", eventId)];
  if (statuses && statuses.length > 0) {
    constraints.push(where("status", "in", statuses.slice(0, 10)));
  }
  return query(collectionRef, ...constraints);
};

export const fetchEventSignups = async (
  eventId: string,
  statuses?: EventSignupStatus[]
) => {
  const q = buildEventSignupsQuery(eventId, statuses);
  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Record<string, unknown>
  );
  return eventSignupCollectionSchema.parse(records);
};

export const fetchMySignupForEvent = async (eventId: string, userId: string) => {
  const q = query(
    collectionRef,
    where("eventId", "==", eventId),
    where("userId", "==", userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const record = {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as Record<string, unknown>;
  return eventSignupSchema.parse(record);
};

export const fetchActiveAttendeeCount = async (eventId: string) => {
  try {
    const q = query(
      collectionRef,
      where("eventId", "==", eventId),
      where("status", "in", ACTIVE_SIGNUP_STATUSES)
    );
    const snapshot = await getDocs(q);
    const signups = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Record<string, unknown>
    );
    const parsed = eventSignupCollectionSchema.parse(signups);
    return sumActiveAttendees(parsed);
  } catch (error: any) {
    if (error?.code === "permission-denied") {
      console.warn("Sin permisos para leer inscripciones del evento; usando 0.", error);
      return 0;
    }
    // Gracefully handle other unexpected errors to avoid crashing UI
    console.warn("No se pudo calcular cupos usados, asumiendo 0.", error);
    return 0;
  }
};

export const useEventSignupsByEvent = (eventId?: string, statuses?: EventSignupStatus[]) =>
  useQuery<EventSignup[]>({
    queryKey: eventSignupsKeys.eventWithStatus(eventId ?? "", statuses),
    queryFn: async () => {
      if (!eventId) return [];
      try {
        return await fetchEventSignups(eventId, statuses);
      } catch (error) {
        console.error("Error al obtener inscripciones de evento:", error);
        Alert.alert("Error", "No se pudieron cargar las inscripciones del evento.");
        throw error;
      }
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

export const useMyEventSignup = (eventId?: string, userId?: string) =>
  useQuery<EventSignup | null>({
    queryKey: eventSignupsKeys.myForEvent(eventId ?? "", userId ?? ""),
    queryFn: async () => {
      if (!eventId || !userId) return null;
      try {
        return await fetchMySignupForEvent(eventId, userId);
      } catch (error) {
        console.error("Error al obtener mi inscripción de evento:", error);
        throw error;
      }
    },
    enabled: !!eventId && !!userId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useEventActiveAttendees = (eventId?: string) =>
  useQuery<number>({
    queryKey: eventSignupsKeys.activeCount(eventId ?? ""),
    queryFn: async () => {
      if (!eventId) return 0;
      try {
        return await fetchActiveAttendeeCount(eventId);
      } catch (error) {
        console.error("Error al calcular cupos usados del evento:", error);
        throw error;
      }
    },
    enabled: !!eventId,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
