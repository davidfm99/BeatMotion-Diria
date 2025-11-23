import DataLoader from "@/components/DataLoader";
import HeaderTitle from "@/components/headerTitle";
import { formatDate } from "@/constants/helpers";
import { Notification } from "@/hooks/notifications/notificationSchemas";
import { useMarkNotificationAsSeen } from "@/hooks/notifications/useMarkNotificationAsSeen";
import { useMyNotifications } from "@/hooks/notifications/useMyNotifications";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { SimpleLineIcons } from "@expo/vector-icons";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyNotifications = () => {
  const { user } = useActiveUser();
  const markNotification = useMarkNotificationAsSeen(user?.uid);
  const notificationsQuery = useMyNotifications(user?.uid);

  const handleMarkNotification = (item: Notification) => {
    if (item.read) return;
    markNotification.mutate(item.id);
  };
  return (
    <SafeAreaView>
      <HeaderTitle
        title="Mis Notificaciones"
        subtitle="Toca la notificación para marcar como visto"
      />
      <DataLoader
        query={notificationsQuery}
        emptyMessage="No hay notificaciones disponibles"
      >
        {(data) => (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator
            renderItem={({ item }) => (
              <Pressable
                className={`px-4 py-2 ${
                  item.read ? "bg-gray-900" : "bg-gray-700"
                } active:bg-secondary rounded-xl`}
                onPress={() => handleMarkNotification(item)}
              >
                <View className="flex-row gap-2 items-center">
                  <SimpleLineIcons
                    name={`${item.read ? "envelope-open" : "envelope"}`}
                    size={18}
                    color="#40E0D0"
                  />
                  <Text className="text-white font-bold text-2xl">
                    {item.title}
                  </Text>
                </View>

                <Text className="text-gray-300">{item.content}</Text>
                <Text className="text-white text-right">
                  {formatDate(item.createdAt)}
                </Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <hr color="" />}
          />
        )}
      </DataLoader>
    </SafeAreaView>
  );
};

export default MyNotifications;
