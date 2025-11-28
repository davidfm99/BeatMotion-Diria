import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";

type UpdateEventInput = {
  id: string;
  title?: string;
  description?: string;
  bannerUrl?: string;
  datetime?: Date;
  capacity?: number | null;
  isPublic?: boolean;
  price?: number | null;
  status?: "draft" | "published";
  category?: string;
  location?: string;
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      const { id, ...rest } = input;
      if (!id) throw new Error("ID de evento faltante");

      const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };

      ([
        "title",
        "description",
        "bannerUrl",
        "datetime",
        "capacity",
        "isPublic",
        "price",
        "status",
        "category",
        "location",
      ] as const).forEach((key) => {
        const value = rest[key];
        if (value !== undefined) {
          updateData[key] = key === "description" || key === "location"
            ? (typeof value === "string" ? value.trim() : value)
            : value;
        }
      });

      await updateDoc(doc(firestore, "events", id), updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("No se pudo actualizar el evento:", error);
      Alert.alert("Error", "No se pudo actualizar el evento.");
    },
  });
};
