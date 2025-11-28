import DataLoader from "@/components/DataLoader";
import ImageModal from "@/components/ImageModal";
import PhotoCard from "@/components/PhotoCard";
import {
  formatCurrency,
  formatDate,
  getEnrollmentColor,
  statusTranslations,
} from "@/constants/helpers";
import { useCourses } from "@/hooks/courses/useCourses";
import { usePaymentsByUser } from "@/hooks/payment/usePaymentsByUser";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";

const History = () => {
  const { user } = useActiveUser();
  const coursesQuery = useCourses();
  const paymentQuery = usePaymentsByUser(user?.uid);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageSelected, setImageSelected] = useState<string>("");

  const onClickImage = (imageUrl: string) => {
    setImageSelected(imageUrl);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const getCourseName = useCallback(
    (cid: string) => {
      if (!coursesQuery.data || coursesQuery.isLoading) return;

      const course = coursesQuery.data.find((course) => course.id === cid);
      return course ? course.title : "";
    },
    [coursesQuery.data, coursesQuery.isLoading]
  );

  return (
    <View className="flex-1 px-4">
      <DataLoader
        query={paymentQuery}
        emptyMessage="No se ha efectuado ningún pago hasta el momento"
      >
        {(data) => (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PhotoCard
                image={item.photoProofURL}
                item={item}
                onClickImage={onClickImage}
                showStatusApprovement={false}
              >
                <View className="gap-3">
                  <View className="flex-row justify-between">
                    <Text
                      className={`{text-white} ${getEnrollmentColor(
                        item.status
                      )}`}
                    >
                      Estado: {statusTranslations[item.status]}
                    </Text>
                    <Text className="text-white">
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white font-bold">Cursos:</Text>
                    <View className="flex-row justify-between">
                      <View>
                        {item.coursesId.map((cid) => (
                          <Text className="text-white ml-2" key={cid}>
                            -{getCourseName(cid)}
                          </Text>
                        ))}
                      </View>
                      <Text className=" text-white">
                        {formatCurrency(item.monthlyFare)}
                      </Text>
                    </View>
                    {item.isLatePayment ? (
                      <View className="flex-row justify-between mt-2">
                        <Text className="text-white ">
                          Monto por {item.daysAfterPayment} día(s) de pago
                          atrasado
                        </Text>
                        <Text className="text-white">
                          {formatCurrency(item.lateFare || 0)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </PhotoCard>
            )}
          />
        )}
      </DataLoader>
      <ImageModal
        isVisible={modalVisible}
        imageSelected={imageSelected}
        toggleVisibility={handleCloseModal}
      />
    </View>
  );
};

export default History;
