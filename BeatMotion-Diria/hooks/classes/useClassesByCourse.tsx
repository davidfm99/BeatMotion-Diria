import { useQuery } from "@tanstack/react-query";
import { firestore } from "@/firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

const fetchUserById = async (userid: string) => {
  const ref = doc(firestore, "users", userid);
  const snapshot = await getDoc(ref);
  const data = snapshot.data();
  if (!data) return null;
  return {
    name: data.name,
    lastName: data.lastName,
    role: data.role,
  };
};

export const useClassesByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["classes", courseId],
    queryFn: async () => {
      const q = query(collection(firestore, "classes"), where("courseId", "==", courseId));
      const snapshot = await getDocs(q);

      const classes = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          let teacherName = "Sin asignar";

          if (data.teacherId) {
            const teacher = await fetchUserById(data.teacherId);
            if (teacher && teacher.role === "teacher") {
              teacherName = `${teacher.name} ${teacher.lastName}`;
            }
          }

          return { id: doc.id, ...data, teacherName };
        })
      );

      return classes;
    },
    enabled: !!courseId,
  });
};