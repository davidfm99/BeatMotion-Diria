import {
  collection,
  serverTimestamp,
  writeBatch,
  doc,
} from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveUser } from "@/hooks/UseActiveUser";

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
