import { View, Text, TouchableHighlight, Image } from "react-native";
import { useCourses } from "@/hooks/courses/useCourses";
import DataLoader from "@/components/DataLoader";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useEffect, useState } from "react";
import { askForCameraPermission } from "@/components/enrollment/askCameraPermision";
import { useCreateEnrollment } from "@/hooks/enrollment/useCreateEnrollment";
import { useActiveUser } from "@/hooks/UseActiveUser";
import { useRouter } from "expo-router";
import { useEnrollmentByUserId } from "@/hooks/enrollment/useEnrollmentByUserId";
import { Enrollment as EnrollmentType } from "@/hooks/enrollment/schema";
import { capitalize } from "@/constants/helpers";

const INITIAL_PRICE = 20000;
const PRICE_PER_COURSE = 5000;

const Enrollment = () => {
  const createEnrollment = useCreateEnrollment();
  const { user } = useActiveUser();
  const coursesQuery = useCourses();
  const enrollmentsQuery = useEnrollmentByUserId(user!.uid);
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [paymentInProcess, setPaymentInProcess] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCourses([]);
  }, []);

  useEffect(() => {
    if (enrollmentsQuery.data) {
      const enrolledCourseIds = enrollmentsQuery.data.map(
        (enrollment: EnrollmentType) => enrollment.courseId
      );
      setEnrolledCourseIds(enrolledCourseIds);
    }
  }, [enrollmentsQuery.data]);

  const handleCheckboxToggle = (courseId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCourses((prev) => [...prev, courseId]);
    } else {
      setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
    }
  };

  const getTotal = () => {
    if (selectedCourses.length === 0) return 0;
    if (selectedCourses.length > 0) {
      return INITIAL_PRICE + (selectedCourses.length - 1) * PRICE_PER_COURSE;
    }
  };

  const handleImagePick = async () => {
    const imageSelected = await askForCameraPermission();
    setImage(imageSelected);
  };

  const handleConfirmEnrollment = () => {
    setPaymentInProcess(true);
    if (selectedCourses.length === 0) {
      alert("Selecciona al menos un curso para matricularte.");
      return;
    }
    if (!image) {
      alert("Por favor, sube el comprobante de pago.");
      return;
    }
    createEnrollment.mutate({
      coursesIds: selectedCourses,
      data: {
        status: "pending",
        paymentProofImage: image,
        userId: user?.uid,
        totalAmount: getTotal(),
        reviewedBy: null,
        reviewedAt: null,
      },
    });
    setPaymentInProcess(false);
    alert("Matrícula enviada con éxito. Será revisada pronto.");
    router.replace("/private/home");
  };

  console.log("Enrolled Course Ids:", coursesQuery?.data[0]?.startDate);

  return (
    <View className="mt-4">
      <Text className="text-white pl-4 text-2xl font-bold">
        Cursos disponibles
      </Text>
      <DataLoader query={coursesQuery} emptyMessage="No hay cursos disponibles">
        {/* TODO: fix this filter for something better */}
        {(data) =>
          data
            ?.filter((course) => !enrolledCourseIds.includes(course.id))
            .map((course) => (
              <View key={course.id} className="p-4 border-b">
                <BouncyCheckbox
                  fillColor="turquoise"
                  textComponent={
                    <View className="ml-4">
                      <Text className="text-white text-lg">{course.title}</Text>
                      <Text className="text-gray-400">
                        {course.description}
                      </Text>
                      <Text className="text-gray-500">{course.level}</Text>
                      <Text className="text-gray-500">
                        {capitalize(course.day || "")}-{" "}
                        {new Date(course.startDate || "").toLocaleDateString()}
                      </Text>
                    </View>
                  }
                  isChecked={selectedCourses.includes(course.id)}
                  onPress={(isChecked) => {
                    handleCheckboxToggle(course.id, isChecked);
                  }}
                />
              </View>
            ))
        }
      </DataLoader>

      <View className="ml-4 mt-5">
        <Text className="text-white text-xl">
          Total a pagar : <Text className="font-extrabold">₡{getTotal()}</Text>
        </Text>

        <TouchableHighlight
          onPress={handleImagePick}
          className="bg-blue-600 rounded-md p-5 mt-10 w-50 self-center text-center"
        >
          <Text className="text-white">Subir comprobante de pago</Text>
        </TouchableHighlight>
        {image && (
          <Image
            source={{ uri: image }}
            className="self-center w-64 h-64 object-cover  mt-4"
          />
        )}
        <TouchableHighlight
          disabled={!image || selectedCourses.length === 0 || paymentInProcess}
          className="bg-secondary rounded-md p-5 mt-4 w-50 self-center text-center disabled:bg-gray-500 disabled:opacity-50"
          onPress={handleConfirmEnrollment}
        >
          <Text className="text-white">
            {paymentInProcess
              ? "Confirmando matrícula..."
              : "Confirmar matrícula"}
          </Text>
        </TouchableHighlight>
        <Text className="text-white text-sm mt-10">
          Es recomendable de colocar en la descripción del pago su nombre y los
          cursos a los que se está matriculando.
        </Text>
      </View>
    </View>
  );
};
export default Enrollment;
