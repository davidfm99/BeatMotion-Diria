import { firestore } from "@/firebaseConfig";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

export const createEnrollment = async ({
  data,
  coursesIds,
}: {
  data: any;
  coursesIds: string[];
}) => {
  const batch = writeBatch(firestore);
  coursesIds.forEach((courseId) => {
    const ref = doc(collection(firestore, "enrollments"));
    batch.set(ref, {
      ...data,
      courseId,
      submittedAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return { count: coursesIds.length };
};

export const useCreateEnrollment = () => {
  const { user } = useActiveUser();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", user?.uid] });
    },
  });
  return mutation;
};
