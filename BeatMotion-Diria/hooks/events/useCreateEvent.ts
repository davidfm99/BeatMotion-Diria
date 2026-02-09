import { firestore } from "@/firebaseConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Alert } from "react-native";
import { useActiveUser } from "../user/UseActiveUser";

type CreateEventInput = {
  title: string;
  description?: string;
  bannerUrl?: string;
  datetime: Date;
  capacity: number | null;
  isPublic: boolean;
  price: number | null;
  status: "draft" | "published";
  category?: string;
  location?: string;
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useActiveUser();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!input.title.trim()) {
        throw new Error("El título es obligatorio");
      }

      const payload = {
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        bannerUrl: input.bannerUrl ?? null,
        datetime: input.datetime,
        capacity: input.capacity,
        isPublic: input.isPublic,
        price: input.price,
        status: input.status,
        category: input.category ?? "general",
        location: input.location?.trim() ?? "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid ?? "system",
        isDeleted: true,
      };

      await addDoc(collection(firestore, "events"), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("No se pudo crear el evento:", error);
      Alert.alert("Error", "No se pudo crear el evento.");
    },
  });
};
