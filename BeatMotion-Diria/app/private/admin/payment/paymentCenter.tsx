import DataLoader from "@/components/DataLoader";
import FilterPills from "@/components/FilterPills";
import HeaderTitle from "@/components/headerTitle";
import { usePayments } from "@/hooks/payment/usePayments";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTER_OPTIONS = [
  { label: "Pendientes", value: "pending" },
  { label: "Aceptadas", value: "approved" },
  { label: "Rechazadas", value: "rejected" },
];

const PaymentCenter = () => {
  const [filterSelected, setFilterSelected] = useState("pending");

  const paymentsQuery = usePayments(filterSelected);

  const handleFilterChange = (value: string) => {
    setFilterSelected(value);
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
            
        )}
      </DataLoader>
    </SafeAreaView>
  );
};

export default PaymentCenter;
