import { useEffect } from "react";
import { Alert } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { marketplaceCollectionSchema, MarketplaceItem } from "./schema";

const fetchMarketplaceItems = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, "marketplace"));
    const records = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Record<string, unknown>,
    );
    return marketplaceCollectionSchema.parse(records);
  } catch (error) {
    console.error("Error al obtener la tienda:", error);
    Alert.alert("Error", "No se pudo cargar el marketplace. Intenta de nuevo mas tarde.");
    throw error;
  }
};

export const useMarketplaceItems = () => {
  const queryClient = useQueryClient();

  const query = useQuery<MarketplaceItem[]>({
    queryKey: ["marketplace"],
    queryFn: fetchMarketplaceItems,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "marketplace"),
      (snapshot) => {
        try {
          const records = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as Record<string, unknown>,
          );
          const parsed = marketplaceCollectionSchema.parse(records);
          queryClient.setQueryData(["marketplace"], parsed);
        } catch (error) {
          console.error("Error al sincronizar marketplace:", error);
        }
      },
    );

    return () => unsubscribe();
  }, [queryClient]);

  return query;
};
