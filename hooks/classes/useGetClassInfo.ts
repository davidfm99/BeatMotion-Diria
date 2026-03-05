import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { ClassesSchema } from "./classesSchema";

export const useGetClassInfo = (classId: string) => {
  const getClassInfo = async () => {
    try {
      const ref = doc(firestore, "classes", classId);
      const snapshot = await getDoc(ref);
      const classInfo = {
        id: snapshot.id,
        ...snapshot.data(),
      };
      return ClassesSchema.parse(classInfo);
    } catch (error: any) {
      console.error("Error in useGetClassInfo", error.message);
    }
  };

  const classQuery = useQuery({
    queryKey: ["classInfo", classId],
    queryFn: getClassInfo,
    enabled: !!classId,
  });

  return classQuery;
};
