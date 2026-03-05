import { useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { firestore } from "@/firebaseConfig";
import { eventSchema, type Event } from "./schema";

const fetchEventById = async (id: string): Promise<Event | null> => {
  const snap = await getDoc(doc(firestore, "events", id));
  if (!snap.exists()) return null;
  return eventSchema.parse({ id: snap.id, ...snap.data() });
};

export const useEventById = (id?: string) => {
  const enabled = useMemo(() => Boolean(id), [id]);
  return useQuery<Event | null>({
    queryKey: ["events", id],
    queryFn: () => fetchEventById(id as string),
    enabled,
  });
};
