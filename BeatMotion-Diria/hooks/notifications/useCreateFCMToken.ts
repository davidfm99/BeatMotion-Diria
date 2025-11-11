import { firestore } from "@/firebaseConfig";
import { CourseSchemaWithMember } from "@/hooks/courses/schema/courseSchema";
import { useMutation } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, setDoc } from "firebase/firestore";

export const useCreateFCMToken = () => {
  const registerPushToken = async ({
    userId,
    role,
    courseMembers,
  }: {
    userId: string;
    role: string;
    courseMembers: CourseSchemaWithMember[];
  }) => {
    if (!Device.isDevice) return;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    const finalStatus =
      existingStatus === "granted"
        ? existingStatus
        : (await Notifications.requestPermissionsAsync()).status;

    if (finalStatus !== "granted") {
      console.log("Push permissions not granted");
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    await setDoc(
      doc(firestore, "pushTokens", userId),
      {
        token,
        updatedAt: new Date().toISOString(),
        courses: courseMembers.map((member) => member.courseId),
        role,
      },
      { merge: true }
    );
  };

  const mutation = useMutation({
    mutationFn: registerPushToken,
  });

  return mutation;
};
