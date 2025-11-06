import FilterPills from "@/components/FilterPills";
import HeaderTitle from "@/components/headerTitle";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DraftHistoryScreen from "./draftHistory";

type TabType = "drafts" | "sent";

const CENTER_OPTIONS = [
  { label: "Borradores", value: "drafts" },
  { label: "Notificaciones Enviadas", value: "sent" },
];

const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState<TabType>("sent");

  const handleTabPress = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <HeaderTitle title="Centro de notificaciones" />
      <View className="flex-col ">
        <FilterPills
          options={CENTER_OPTIONS}
          onSelect={handleTabPress}
          selected={activeTab}
        />
        <View className=" flex-1">
          {activeTab === "drafts" ? <DraftHistoryScreen /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NotificationCenter;
