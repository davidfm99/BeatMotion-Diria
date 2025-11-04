import { firestore } from "@/firebaseConfig";
import {
  collection,
  documentId,
  query as firestoreQuery,
  getDocs,
  where,
} from "@firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useCourseMemberByUser } from "../courseMember/useCourseMemberByUser";
import { courseSchemaWithMember } from "./schema/courseSchema";

//Bring courses where the user is member
export const useCoursesByUserMember = (uid: string) => {
  const { data: courseMembers } = useCourseMemberByUser(uid);

  const getMyCourses = async () => {
    try {
      if (!courseMembers || courseMembers.length === 0) {
        return [];
      }
      const courseIds = courseMembers.map((member) => member.courseId);
      const q = firestoreQuery(
        collection(firestore, "courses"),
        where(documentId(), "in", courseIds)
      );
      const querySnapshot = await getDocs(q);
      const courses = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...courseMembers.find((member) => member.courseId === doc.id),
          ...doc.data(),
        };
      });
      return courseSchemaWithMember.parse(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      Alert.alert("Error", "No se pudieron cargar los cursos.");
      return [];
    }
  };

  const query = useQuery({
    queryKey: ["myCourses", uid],
    queryFn: getMyCourses,
    enabled: !!uid && !!courseMembers,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  return query;
};
