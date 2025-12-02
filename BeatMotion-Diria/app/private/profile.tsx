import HeaderTitle from "@/components/headerTitle";
import { UserProfileValidationSchema } from "@/constants/validationForms";
import { auth } from "@/firebaseConfig";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import { useUserInfo } from "@/hooks/user/useUserInfo";
import { QueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { object } from "yup";

export default function ProfileScreen() {
  const { user: activeUser } = useActiveUser();
  const userInfo = useUserInfo(activeUser?.uid as string);
  const updateProfile = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");

  const [formErrors, setFormErrors] = useState({
    name: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    if (userInfo.data) {
      console.log(userInfo.data);
      setName(userInfo.data.name);
      setLastName(userInfo.data.lastName);
      setPhone(userInfo.data.phone || "");
      setPhotoUrl(userInfo.data?.photoURL || null);
      setEmail(userInfo.data.email);
    }
  }, [userInfo.data]);

  const validation = () => {
    try {
      object(UserProfileValidationSchema).validateSync(
        {
          name,
          lastName,
          phone,
        },
        {
          abortEarly: false,
        }
      );
      setFormErrors({
        name: "",
        lastName: "",
        phone: "",
      });
    } catch (err: any) {
      const errors = {
        name: "",
        lastName: "",
        phone: "",
      };
      err.inner.reduce((acc: any, curr: any) => {
        acc[curr.path] = curr.message;
        return acc;
      }, errors);
      setFormErrors(errors);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (validation()) {
      updateProfile.mutate({
        uid: activeUser?.uid || "",
        body: {
          name,
          lastName,
          phone,
        },
      });
      setEditing(false);
    }
  };

  // Cerrar sesion y volver a login publico
  const handleLogout = async () => {
    try {
      await signOut(auth);
      const queryClient = new QueryClient();
      queryClient.invalidateQueries({ queryKey: ["activeUser"] });
      router.replace("/public/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const resetState = () => {
    if (userInfo.data) {
      setName(userInfo.data.name);
      setLastName(userInfo.data.lastName);
      setPhone(userInfo.data.phone || "");
      setPhotoUrl(userInfo.data?.photoURL || null);
      setEmail(userInfo.data.email);
    }
  };

  if (userInfo.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-white text-lg">Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <HeaderTitle title="Mi Perfil" />

      <ScrollView className="px-4">
        <View className="items-center mb-8">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-28 h-28 rounded-full mb-4"
            />
          ) : (
            <View className="w-28 h-28 rounded-full bg-gray-800 mb-4 items-center justify-center">
              <Text className="text-white text-xl">
                {(name?.[0] ?? email?.[0] ?? "U").toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-white text-xl font-semibold">
            {`${name} ${lastName}`.trim() || "Sin nombre"}
          </Text>
          <Text className="text-gray-400">{email || "Sin correo"}</Text>
        </View>

        {!editing ? (
          <View className="bg-gray-900 rounded-2xl p-4 mb-8">
            <Text className="text-white font-semibold mb-3">Datos</Text>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Nombre</Text>
              <Text className="text-white">{name || "—"}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Apellido</Text>
              <Text className="text-white">{lastName || "—"}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Teléfono</Text>
              <Text className="text-white">{phone || "—"}</Text>
            </View>

            <View className="gap-3 mt-2">
              <TouchableOpacity
                className="bg-white rounded-2xl px-5 py-4 active:opacity-80"
                onPress={() => setEditing(true)}
              >
                <Text className="text-center font-semibold">Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="bg-gray-900 rounded-2xl p-4 mb-8">
            <Text className="text-white font-semibold mb-3">Editar datos</Text>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Nombre</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 text-white rounded-xl px-3 py-3"
              />
              {formErrors.name && (
                <Text className="text-red-500">{formErrors.name}</Text>
              )}
            </View>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Apellido</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Tu apellido"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 text-white rounded-xl px-3 py-3"
              />
              {formErrors.name && (
                <Text className="text-red-500">{formErrors.lastName}</Text>
              )}
            </View>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Teléfono</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Tu teléfono"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 text-white rounded-xl px-3 py-3"
              />
              {formErrors.name && (
                <Text className="text-red-500">{formErrors.phone}</Text>
              )}
            </View>

            <View className="gap-3 mt-2">
              <TouchableOpacity
                className="bg-primary rounded-2xl px-5 py-4 active:opacity-80"
                onPress={handleSave}
              >
                <Text className="text-center font-semibold">Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-700 rounded-2xl px-5 py-4 active:opacity-80"
                onPress={() => {
                  setEditing(false);
                  resetState();
                }}
              >
                <Text className="text-center font-semibold text-white">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          className="bg-red-500 rounded-2xl px-5 py-4 active:opacity-80"
          onPress={handleLogout}
          accessibilityLabel="Cerrar sesión"
        >
          <Text className="text-center font-semibold text-white">
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
