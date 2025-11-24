import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import DataLoader from "@/components/DataLoader";
import { useEvents } from "@/hooks/events/useEvents";
import type { Event } from "@/hooks/events/schema";
import {
  formatEventAudience,
  formatEventCapacity,
  formatEventDateTime,
  formatEventPrice,
} from "@/hooks/events/utils";
import { useMemo, useState } from "react";

const INTEREST_MESSAGE =
  "Gracias por tu interes. Por favor ponte en contacto con el director de la academia para que te agreguen al grupo de integrantes.";

type Tab = "mes" | "proximos" | "pasados";

const EventsList = () => {
  const router = useRouter();
  const eventsQuery = useEvents(); // published + public by default
  const [tab, setTab] = useState<Tab>("proximos");
  const now = useMemo(() => new Date(), []);
  const sixMonthsAgo = useMemo(() => {
    const d = new Date(now);
    d.setMonth(now.getMonth() - 6);
    return d;
  }, [now]);

  const categorized = useMemo(() => {
    if (!eventsQuery.data) return { proximos: [], mes: [], pasados: [] as Event[] };
    const events = eventsQuery.data as Event[];
    return {
      proximos: events
        .filter((evt) => evt.datetime >= now)
        .sort((a, b) => a.datetime.getTime() - b.datetime.getTime()),
      mes: events.filter(
        (evt) =>
          evt.datetime.getFullYear() === now.getFullYear() &&
          evt.datetime.getMonth() === now.getMonth()
      ),
      pasados: events
        .filter((evt) => evt.datetime < now && evt.datetime >= sixMonthsAgo)
        .sort((a, b) => b.datetime.getTime() - a.datetime.getTime()),
    };
  }, [eventsQuery.data, now, sixMonthsAgo]);

  const renderCard = (item: Event) => (
    <View className="bg-gray-900 rounded-2xl overflow-hidden">
      {item.bannerUrl ? (
        <Image
          source={{ uri: item.bannerUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-48 items-center justify-center bg-gray-800">
          <Icon name="image-outline" size={32} color="#6b7280" />
          <Text className="text-gray-400 mt-2">Sin imagen</Text>
        </View>
      )}

      <View className="p-4 gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-lg font-semibold flex-1">
            {item.title}
          </Text>
          <View
            className={`px-2 py-1 rounded-full ${
              item.isPublic ? "bg-blue-700" : "bg-purple-700"
            }`}
          >
            <Text className="text-white text-xs">
              {item.isPublic ? "Publico" : "Miembros"}
            </Text>
          </View>
          {item.datetime < new Date() && (
            <View className="ml-2 px-2 py-1 rounded-full bg-red-700">
              <Text className="text-white text-xs">Evento finalizado</Text>
            </View>
          )}
        </View>

        <Text className="text-gray-300">{formatEventDateTime(item.datetime)}</Text>
        <Text className="text-gray-300">{item.location || "Sin ubicacion"}</Text>
        <Text className="text-gray-300">
          {formatEventPrice(item.price)} - {formatEventCapacity(item.capacity)}
        </Text>
        <Text className="text-gray-400 text-sm">
          {formatEventAudience(item.isPublic)}
        </Text>
        <Text className="text-gray-400 text-sm" numberOfLines={3}>
          {item.description || "Sin descripcion"}
        </Text>

        <TouchableOpacity
          className="mt-2 bg-yellow-400 rounded-full px-4 py-3 flex-row items-center justify-center gap-2 active:opacity-80"
          onPress={() => Alert.alert("Gracias!", INTEREST_MESSAGE)}
        >
          <Icon name="heart-outline" size={18} color="#000" />
          <Text className="text-black font-semibold">Quiero ir!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View className="flex-row gap-2 px-5 pb-4">
      {[
        { key: "proximos", label: "Eventos proximos" },
        { key: "mes", label: "Eventos este mes" },
        { key: "pasados", label: "Eventos pasados" },
      ].map((item) => {
        const active = tab === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            className={`px-3 py-2 rounded-full border ${
              active ? "bg-yellow-400 border-yellow-400" : "border-gray-700"
            }`}
            onPress={() => setTab(item.key as Tab)}
          >
            <Text className={active ? "text-black font-semibold" : "text-white text-sm"}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-5 pt-6 pb-2 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.push("/private/home")}
          className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center"
        >
          <Icon name="home-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-2xl font-bold">Eventos</Text>
          <Text className="text-gray-400 mt-1">Explora eventos publicados</Text>
        </View>
      </View>

      {renderTabs()}

      <DataLoader query={eventsQuery} emptyMessage="No hay eventos disponibles">
        {(data, isRefetching, refetch) => (
          <FlatList
            data={categorized[tab]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
            renderItem={({ item }) => renderCard(item)}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#facc15"
              />
            }
          />
        )}
      </DataLoader>
    </SafeAreaView>
  );
};

export default EventsList;
