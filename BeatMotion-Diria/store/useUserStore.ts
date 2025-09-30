import {create} from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useUserStore = create(
  persist(
    (set: any) => ({
      user: null,
      setUser: (user: any) => set({ user }),
    }),
    {
      name: "user-storage",
      storage:{
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      }
    }
  )
);

export default useUserStore;
