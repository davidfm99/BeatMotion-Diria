import { useEffect } from "react";
import { Alert } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { eventCollectionSchema, type Event } from "./schema";

type Options = {
  includeDrafts?: boolean;
  includePrivate?: boolean;
};

const buildQuery = (options?: Options) => {
  const constraints: any[] = [orderBy("datetime", "asc")];
  if (!options?.includeDrafts) {
    constraints.push(where("status", "==", "published"));
  }
  if (!options?.includePrivate) {
    constraints.push(where("isPublic", "==", true));
  }
  return query(collection(firestore, "events"), ...constraints);
};

const fetchEvents = async (options?: Options) => {
  const q = buildQuery(options);
  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Record<string, unknown>
  );
  return eventCollectionSchema.parse(records);
};

export const useEvents = (options?: Options) => {
  const queryClient = useQueryClient();
  const queryKey = ["events", !!options?.includeDrafts, !!options?.includePrivate];

  const queryResult = useQuery<Event[]>({
    queryKey,
    queryFn: async () => {
      try {
        return await fetchEvents(options);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
        Alert.alert("Error", "No se pudieron cargar los eventos.");
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const q = buildQuery(options);
    const unsub = onSnapshot(q, (snapshot) => {
      try {
        const records = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Record<string, unknown>
        );
        const parsed = eventCollectionSchema.parse(records);
        queryClient.setQueryData(queryKey, parsed);
      } catch (error) {
        console.error("Error sincronizando eventos:", error);
      }
    });
    return () => unsub();
  }, [queryClient, queryKey, options?.includeDrafts, options?.includePrivate]);

  return queryResult;
};
