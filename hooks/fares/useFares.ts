import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { FareSchema } from "./schema";

export const useFares = () => {
  const fetchFares = async () => {
    try {
      const snapShots = await getDocs(collection(firestore, "fares"));
      const responseFares = snapShots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return FareSchema.parse(responseFares);
    } catch (error: any) {
      console.error("Error in Fares", error.message);
    }
  };
  const faresQuery = useQuery({
    queryKey: ["fares"],
    queryFn: fetchFares,
    staleTime: Infinity,
  });

  return faresQuery;
};
