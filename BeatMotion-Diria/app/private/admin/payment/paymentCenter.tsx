import DataLoader from "@/components/DataLoader";
import FilterPills from "@/components/FilterPills";
import HeaderTitle from "@/components/headerTitle";
import ImageModal from "@/components/ImageModal";
import PhotoCard from "@/components/PhotoCard";
import {
  formatCurrency,
  formatDate,
  getEnrollmentColor,
  statusTranslations,
} from "@/constants/helpers";
import { useCourses } from "@/hooks/courses/useCourses";
import { PaymentType } from "@/hooks/payment/schema";
import { useMarkPayment } from "@/hooks/payment/useMarkPayment";
import { usePayments } from "@/hooks/payment/usePayments";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { useUsers } from "@/hooks/user/useUsers";
import { useCallback, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTER_OPTIONS = [
  { label: "Pendientes", value: "pending" },
  { label: "Aceptadas", value: "approved" },
  { label: "Rechazadas", value: "rejected" },
];

enum StatusType {
  "pending" = "pending",
  "approved" = "approved",
  "rejected" = "rejected",
}

const PaymentCenter = () => {
  const [filterSelected, setFilterSelected] = useState("pending");
  const [image, setImage] = useState("");
  const [isModalImageOpen, setIsModalImageOpen] = useState(false);

  const paymentsQuery = usePayments(filterSelected as StatusType);
  const coursesQuery = useCourses();
  const usersQuery = useUsers();
  const markMutation = useMarkPayment();
  const { user: activeUser } = useActiveUser();

  const handleFilterChange = (value: string) => {
    setFilterSelected(value);
  };

  const handleClickImage = (url: string) => {
    setIsModalImageOpen(true);
    setImage(url);
  };

  const toggleModal = () => {
    setIsModalImageOpen((prev) => !prev);
  };

  const getCourseName = useCallback(
    (cid: string) => {
      if (!coursesQuery.data || coursesQuery.isLoading) return;

      const course = coursesQuery.data.find((course) => course.id === cid);
      return course ? course.title : "";
    },
    [coursesQuery.data, coursesQuery.isLoading]
  );

  const getUser = useCallback(
    (cid: string) => {
      if (!usersQuery.data || usersQuery.isLoading) return;

      const userName = usersQuery.data.find((u) => u.id === cid);
      return userName ? `${userName.name}${userName.lastName}` : "";
    },
    [usersQuery.data, usersQuery.isLoading]
  );

  const handleClickStatusChange = (
    payment: PaymentType,
    action: "approve" | "reject"
  ) => {
    const user = getUser(payment.userId);
    Alert.alert(
      `Confirmar ${action === "approve" ? "aprobar" : "rechazar"}`,
      `¿Estás seguro de que deseas ${
        action === "approve" ? "aprobar" : "rechazar"
      } la matrícula de ${user}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () => handleClickOption(payment, action),
        },
      ]
    );
  };

  const handleClickOption = (
    item: PaymentType,
    action: "approve" | "reject"
  ) => {
    markMutation.mutateAsync({
      paymentId: item.id,
      status: action === "approve" ? "approved" : "rejected",
      reviewedBy: activeUser?.uid || null,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <HeaderTitle title="Centro de cobros" />
      <View className="items-center mb-2">
        <FilterPills
          options={FILTER_OPTIONS}
          onSelect={handleFilterChange}
          selected={filterSelected}
        />
      </View>
      <DataLoader
        query={paymentsQuery}
        emptyMessage="No existen datos disponibles"
      >
        {(data, isRefetching, refetch) => (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#facc15"
              />
            }
            renderItem={({ item }) => (
              <View className="px-3">
                <PhotoCard
                  image={item.photoProofURL}
                  item={item}
                  onClickImage={handleClickImage}
                  showStatusApprovement
                  onConfirmation={(item, status) =>
                    handleClickStatusChange(item, status)
                  }
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
                    <View className="flex-row justify-between">
                      <Text className="text-white ">Realizado por:</Text>
                      <Text className="text-white">{getUser(item.userId)}</Text>
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
              </View>
            )}
          />
        )}
      </DataLoader>
      <ImageModal
        isVisible={isModalImageOpen}
        imageSelected={image}
        toggleVisibility={toggleModal}
      />
    </SafeAreaView>
  );
};

export default PaymentCenter;
