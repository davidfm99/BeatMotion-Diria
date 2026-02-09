import { firestore } from "@/firebaseConfig";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ClassesSchemaArray, ClassesType } from "./classesSchema";

export const useClassesByCourseId = (courseId: string) => {
  const getClasses = async () => {
    try {
      const querySnapshot = query(
        collection(firestore, "classes"),
        where("courseId", "==", courseId)
      );
      const data = await getDocs(querySnapshot);
      const classes = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClassesType[];
      return ClassesSchemaArray.parse(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      throw error;
    }
  };

  const queryResult = useQuery({
    queryKey: ["classes", courseId],
    queryFn: getClasses,
    enabled: !!courseId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 1 minute
  });

  return queryResult;
};
