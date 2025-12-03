import { firestore } from "@/firebaseConfig";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, updateDoc } from "firebase/firestore";
import { Enrollment } from "./schema";

const createEnrollment = async (enrollment: Enrollment) => {
  const ref = doc(collection(firestore, "enrollments"), enrollment.id);
  await updateDoc(ref, {
    ...enrollment,
  });
  return enrollment;
};

export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient();
  const { user } = useActiveUser();

  const mutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments", user?.uid],
      });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
  return mutation;
};
