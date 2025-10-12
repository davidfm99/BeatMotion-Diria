import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import type { UseQueryResult } from "@tanstack/react-query";

type DataLoaderProps<T> = {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
  emptyMessage?: string;
};

export default function DataLoader<T>({
  query,
  children,
  emptyMessage = "No data available",
}: DataLoaderProps<T>) {
  const { data, isLoading, isError, error, isFetching } = query;

  if (isLoading || isFetching) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text style={{ color: "red", fontWeight: "bold" }}>Error</Text>
        <Text>{(error as Error)?.message ?? "Something went wrong"}</Text>
      </View>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text>{emptyMessage}</Text>
      </View>
    );
  }

  return <>{children(data)}</>;
}
