import DataLoader from "@/components/DataLoader";
import { formatDate } from "@/constants/helpers";
import { useNotificationsHistory } from "@/hooks/notifications/useNotificationsHistory";
import { SimpleLineIcons } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";

const DICTIONARY_SENTS = {
  all: "Todos los usuarios",
  teacher: "Instructores",
  user: "Estudiantes",
};

const NotificationsHistory = () => {
  const notificationsQuery = useNotificationsHistory();
  return (
    <DataLoader
      query={notificationsQuery}
      emptyMessage="No hay notificaciones enviadas"
    >
      {(data) => (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="gap-2 p-2.5 bg-gray-800 rounded-xl">
              <View className="flex-row gap-2 items-center">
                <SimpleLineIcons
                  name="envelope-open"
                  size={18}
                  color="#40E0D0"
                />
                <Text className="text-white font-bold text-2xl">
                  {item.title}
                </Text>
              </View>

              <Text className="text-gray-300">{item.content}</Text>
              <Text className="text-gray-300">
                Enviado a: {DICTIONARY_SENTS[item.recipients]}
              </Text>
              <Text className="text-gray-300">
                Creado: {formatDate(item.createdAt)}
              </Text>
            </View>
          )}
        />
      )}
    </DataLoader>
  );
};

export default NotificationsHistory;
