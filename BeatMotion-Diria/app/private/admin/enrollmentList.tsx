import {
  View,
  Text,
  Image,
  TouchableHighlight,
  ScrollView,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { useEnrollments } from "@/hooks/enrollment/useEnrrollments";
import DataLoader from "@/components/DataLoader";
import { getEnrollmentColor, statusTranslations } from "@/constants/helpers";
import Icon from "react-native-vector-icons/Entypo";
import { useRouter } from "expo-router";
import { useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useUpdateEnrollment } from "@/hooks/enrollment/useUpdateEnrollment";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { Enrollment as Enrollmentype } from "@/hooks/enrollment/schema";
import { serverTimestamp } from "firebase/database";

const EnrollmentList = () => {
  const enrollmentQuery = useEnrollments();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [imageSelected, setImageSelected] = useState<string | null>(null);
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null);
  const updateEnrollment = useUpdateEnrollment();
  const { user: activeUser } = useActiveUser();

  const handleViewUserProfile = (userId: string) => {
    router.push(`/private/admin/user/${userId}`);
  };

  const handleViewCourseDetails = (courseId: string) => {
    router.push(`/private/admin/courses/${courseId}`);
  };

  const toggleOptions = (enrollmentId: string) => {
    setOpenOptionsId((prevId) =>
      prevId === enrollmentId ? null : enrollmentId
    );
  };

  const handleClickOption = async (
    enrollment: Enrollmentype,
    action: "accept" | "reject"
  ) => {
    const { course, user, ...rest } = enrollment;
    console.log("Updating enrollment:", enrollment.id, "Action:", activeUser);
    try {
      await updateEnrollment.mutateAsync({
        ...rest,
        status: action === "accept" ? "approved" : "rejected",
        reviewedBy: activeUser?.uid || null,
        reviewedAt: serverTimestamp(),
      });
      Alert.alert("Matrícula actualizada");
    } catch (error: any) {
      Alert.alert("Error updating enrollment:", error.message);
    }
  };

  const handleConfirmationEnrollment = (
    enrollment: Enrollmentype,
    action: "accept" | "reject"
  ) => {
    Alert.alert(
      `Confirmar ${action === "accept" ? "aceptar" : "rechazar"}`,
      `¿Estás seguro de que deseas ${
        action === "accept" ? "aceptar" : "rechazar"
      } la matrícula de ${enrollment.user?.firstName} ${
        enrollment.user?.lastName
      }?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () => handleClickOption(enrollment, action),
        },
      ]
    );
  };

  return (
    <ScrollView className="p-4 space-y-4">
      <Text>Matriculas</Text>
      <DataLoader query={enrollmentQuery} emptyMessage="No existen matriculas">
        {(data) =>
          data.map((enrollment) => (
            <View
              key={enrollment.id}
              className="bg-gray-700 p-5 rounded-lg flex gap-3 "
            >
              <View className="flex-row justify-between">
                <TouchableHighlight
                  onPress={() =>
                    handleViewCourseDetails(enrollment.course?.id || "")
                  }
                >
                  <Text className="text-white underline text-2xl font-bold">
                    {enrollment.course?.title}
                  </Text>
                </TouchableHighlight>
                <View className="relative w-[50%] items-end">
                  <TouchableHighlight
                    onPress={() => toggleOptions(enrollment.id)}
                  >
                    <Icon
                      name="dots-three-horizontal"
                      size={24}
                      color="white"
                    />
                  </TouchableHighlight>
                  {openOptionsId === enrollment.id && (
                    <View className="z-10 absolute right-0 top-8 w-full text-dark rounded-md bg-white py-3 px-4 flex gap-3 border border-b border-gray-300">
                      <Pressable
                        disabled={enrollment.status !== "pending"}
                        className="active:bg-gray-200 rounded-md mb-2"
                        onPress={() => {
                          handleConfirmationEnrollment(enrollment, "accept");
                        }}
                      >
                        <Text className="disabled:text-gray-400">Aceptar</Text>
                      </Pressable>
                      <Pressable
                        disabled={enrollment.status !== "pending"}
                        onPress={() => {
                          handleConfirmationEnrollment(enrollment, "reject");
                        }}
                        className="active:bg-gray-200 rounded-md"
                      >
                        <Text className="disabled:text-gray-400">Rechazar</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>

              <Text className="text-white text-lg flex-row items-center justify-center">
                Estudiante:{" "}
                <TouchableHighlight
                  onPress={() =>
                    handleViewUserProfile(enrollment.user?.id || "")
                  }
                >
                  <Text className="underline text-white">
                    {enrollment.user?.firstName} {enrollment.user?.lastName}
                  </Text>
                </TouchableHighlight>
              </Text>
              <Text className="text-white">
                Correo Estudiante: {enrollment.user?.email}
              </Text>
              <Text className="text-gray-400">
                Monto total: ₡{enrollment.totalAmount}
              </Text>
              <Text className="text-gray-400">
                Fecha de solicitud:{" "}
                {new Date(enrollment.submittedAt).toLocaleDateString()}
              </Text>
              <Text className="text-gray-400">
                Dia de curso: {enrollment.course?.day}
              </Text>
              <Text className="text-white">
                Estado:{" "}
                <Text className={`${getEnrollmentColor(enrollment.status)}`}>
                  {statusTranslations[enrollment.status]}
                </Text>
              </Text>
              <View className="mt-4">
                <Pressable
                  onPress={() => {
                    setImageSelected(enrollment.paymentProofImage || null);
                    setModalVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: enrollment.paymentProofImage || "" }}
                    className=" w-full h-[70%] rounded-md"
                    resizeMode="cover"
                  />
                </Pressable>
              </View>
            </View>
          ))
        }
      </DataLoader>
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View className="bg-black flex-1 justify-center items-center">
          <Pressable
            onPress={() => setModalVisible(false)}
            className="mt-10 rounded-full p-2 z-10 bg-gray-800 absolute top-20 right-4"
          >
            <AntDesign name="close" className="mt-2" size={24} color="white" />
          </Pressable>
          <Image
            source={{ uri: imageSelected || "" }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
      </Modal>
    </ScrollView>
  );
};
export default EnrollmentList;
