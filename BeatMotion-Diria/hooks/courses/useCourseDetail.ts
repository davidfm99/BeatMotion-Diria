import { firestore } from "@/firebaseConfig";
import { doc, getDoc } from "@firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useCourseMemberByUser } from "../courseMember/useCourseMemberByUser";
import { courseWithMemberElement } from "./schema/courseSchema";

//Bring courses where the user is member
export const useCourseDetail = (uid: string, courseId: string) => {
  const { data: courseMembers } = useCourseMemberByUser(uid);

  const getMyCourseDetail = async () => {
    try {
      if (!courseMembers || courseMembers.length === 0) {
        return null;
      }
      const snapshot = await getDoc(doc(firestore, "courses", courseId));
      if (!snapshot.exists()) {
        throw new Error("Course not found");
      }
      const course = {
        id: snapshot.id,
        ...courseMembers.find((member) => member.courseId === snapshot.id),
        ...snapshot.data(),
      };

      return courseWithMemberElement.parse(course);
    } catch (error) {
      console.error("Error fetching courses:", error);
      Alert.alert("Error", "No se pudieron cargar los cursos.");
      return null;
    }
  };

  const query = useQuery({
    queryKey: ["courseDetail", uid, courseId],
    queryFn: getMyCourseDetail,
    enabled: !!uid && !!courseMembers,
    refetchOnWindowFocus: false,
  });

  return query;
};
