import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { draftSchema } from "./notificationSchemas";

export const useDraftById = (uid: string) => {
  const fetchDraft = async () => {
    if (uid === "new") return {};
    try {
      const querySnap = await getDoc(doc(firestore, "drafts", uid));
      if (!querySnap.exists()) {
        throw new Error("Draft not found");
      }
      const draft = {
        id: querySnap.id,
        ...querySnap.data(),
      };
      return draftSchema.parse(draft);
    } catch (err) {
      console.error(
        "Error al solicitar datos de borrador. Por favor, Intentelo de nuevo"
      );
    }
  };

  const query = useQuery({
    queryKey: ["draftDetail"],
    queryFn: fetchDraft,
    enabled: !!uid,
  });

  return query;
};
