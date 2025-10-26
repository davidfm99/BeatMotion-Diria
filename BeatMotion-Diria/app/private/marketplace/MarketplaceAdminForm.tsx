import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useActiveUser } from "@/hooks/UseActiveUser";
import { useMarketplaceItems } from "@/hooks/marketplace/useMarketplaceItems";
import {
  addMarketplaceItem,
  deleteMarketplaceItem,
  updateMarketplaceItem,
} from "@/services/marketplace";

const normalizeMediaUrl = (value: string | null | undefined) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/^['"]+|['"]+$/g, "").trim();
};

const sanitizeGallery = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((entry) => normalizeMediaUrl(entry))
    .filter((entry) => entry.length > 0);

export default function MarketplaceAdminForm() {
  const { user } = useActiveUser();
  const { itemId: rawItemId } = useLocalSearchParams<{ itemId?: string }>();
  const itemId = useMemo(
    () => (Array.isArray(rawItemId) ? rawItemId[0] : rawItemId),
    [rawItemId],
  );
  const isEditing = Boolean(itemId);
  const { data: marketplaceItems, isLoading: isLoadingItems } =
    useMarketplaceItems();
  const existingItem = useMemo(
    () =>
      itemId
        ? marketplaceItems?.find((entry) => entry.id === itemId) ?? null
        : null,
    [itemId, marketplaceItems],
  );
  const hasHydratedFromItem = useRef(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [gallery, setGallery] = useState("");
  const [category, setCategory] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    hasHydratedFromItem.current = false;
  }, [itemId]);

  useEffect(() => {
    if (!existingItem || hasHydratedFromItem.current) return;

    setName(existingItem.name ?? "");
    setPrice(
      existingItem.price != null ? String(existingItem.price) : "",
    );
    setShortDescription(existingItem.shortDescription ?? "");
    setDescription(existingItem.description ?? "");
    setImageUrl(existingItem.imageUrl ?? "");
    setGallery(existingItem.gallery?.join("\n") ?? "");
    setCategory(existingItem.category ?? "");
    setItemCode(existingItem.itemId ?? "");
    setActive(existingItem.active !== false);

    hasHydratedFromItem.current = true;
  }, [existingItem]);

  const handleSubmit = async () => {
    if (user?.role !== "admin") {
      Alert.alert("Permisos", "Solo los administradores pueden gestionar articulos.");
      return;
    }

    if (isEditing && !existingItem) {
      if (isLoadingItems) {
        Alert.alert(
          "Marketplace",
          "Aun estamos cargando el articulo seleccionado. Intenta nuevamente en unos segundos.",
        );
      } else {
        Alert.alert(
          "Marketplace",
          "No encontramos este articulo. Es posible que haya sido eliminado.",
          [
            {
              text: "Aceptar",
              onPress: () => router.back(),
            },
          ],
        );
      }
      return;
    }

    if (!name.trim()) {
      Alert.alert("Campos vacios", "Completa el nombre del articulo.");
      return;
    }

    const parsedPrice = Number(price.replace(/[^\d.-]/g, ""));
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      Alert.alert("Precio invalido", "Ingresa un precio en colones (CRC).");
      return;
    }

    const galleryItems = sanitizeGallery(gallery);
    const primaryImage = normalizeMediaUrl(imageUrl);
    const images = Array.from(
      new Set([...(primaryImage ? [primaryImage] : []), ...galleryItems]),
    );

    const normalizedDescription = description.trim();
    const normalizedShortDescription = shortDescription.trim();
    const normalizedCategory = category.trim();
    const normalizedItemCode = itemCode.trim();

    const payload = {
      name: name.trim(),
      shortDescription: normalizedShortDescription.length
        ? normalizedShortDescription
        : isEditing
          ? null
          : undefined,
      description: normalizedDescription.length
        ? normalizedDescription
        : isEditing
          ? null
          : undefined,
      price: parsedPrice,
      currency: "CRC",
      category: normalizedCategory.length
        ? normalizedCategory
        : isEditing
          ? null
          : undefined,
      active,
      itemId: normalizedItemCode.length
        ? normalizedItemCode
        : isEditing
          ? null
          : undefined,
      images,
    };

    try {
      setIsSaving(true);
      if (isEditing && itemId) {
        await updateMarketplaceItem(itemId, payload);
        Alert.alert("Marketplace", "Articulo actualizado correctamente.", [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ]);
      } else {
        await addMarketplaceItem({
          ...payload,
          createdBy: user?.uid ?? "desconocido",
        });
        Alert.alert("Marketplace", "Articulo agregado correctamente.", [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ]);
        setName("");
        setPrice("");
        setShortDescription("");
        setDescription("");
        setImageUrl("");
        setGallery("");
        setCategory("");
        setItemCode("");
        setActive(true);
      }
    } catch (error) {
      console.error("No se pudo guardar el articulo:", error);
      Alert.alert(
        "Error",
        "No pudimos guardar el articulo. Intenta nuevamente en unos minutos.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!isEditing || !itemId || isDeleting) return;

    Alert.alert(
      "Eliminar articulo",
      "Esta accion no se puede deshacer. Deseas eliminar este articulo del marketplace?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteMarketplaceItem(itemId);
              Alert.alert("Marketplace", "Articulo eliminado correctamente.", [
                {
                  text: "Aceptar",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error("No se pudo eliminar el articulo:", error);
              Alert.alert(
                "Error",
                "No pudimos eliminar el articulo. Intenta nuevamente en unos minutos.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (user?.role !== "admin") {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center px-10">
        <Text className="text-white text-lg font-semibold mb-4">
          Permiso denegado
        </Text>
        <Text className="text-gray-400 text-center mb-6">
          Solo los administradores pueden acceder a este formulario de la tienda.
        </Text>
        <TouchableOpacity
          className="bg-yellow-400 px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="font-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isEditing && isLoadingItems && !existingItem) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#facc15" />
        <Text className="text-white mt-4">Cargando articulo...</Text>
      </SafeAreaView>
    );
  }

  if (isEditing && !isLoadingItems && !existingItem) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center px-10">
        <Text className="text-white text-lg font-semibold mb-4">
          No encontramos este articulo.
        </Text>
        <Text className="text-gray-400 text-center mb-6">
          Puede que haya sido eliminado recientemente. Vuelve a la lista del marketplace.
        </Text>
        <TouchableOpacity
          className="bg-yellow-400 px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="font-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 48 }}
          className="flex-1 px-6"
        >
          <View className="flex-row items-center justify-between pt-8 pb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center"
              accessibilityLabel="Volver"
            >
              <Ionicons name="chevron-back" size={22} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">
              {isEditing ? "Editar articulo" : "Nuevo articulo"}
            </Text>
            {isEditing ? (
              <TouchableOpacity
                onPress={handleDelete}
                className="w-10 h-10 rounded-full bg-red-600 items-center justify-center"
                accessibilityLabel="Eliminar articulo"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="trash" size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            ) : (
              <View className="w-10 h-10" />
            )}
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-white font-semibold mb-2">Nombre</Text>
              <TextInput
                className="bg-gray-900 text-white rounded-2xl px-4 py-3"
                placeholder="Nombre del articulo"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text className="text-white font-semibold mb-2">
                Codigo interno (opcional)
              </Text>
              <TextInput
                className="bg-gray-900 text-white rounded-2xl px-4 py-3"
                placeholder="SKU o referencia"
                placeholderTextColor="#6b7280"
                value={itemCode}
                onChangeText={setItemCode}
                autoCapitalize="characters"
              />
            </View>

            <View>
              <Text className="text-white font-semibold mb-2">Precio</Text>
              <TextInput
                className="bg-gray-900 text-white rounded-2xl px-4 py-3"
                placeholder="00000"
                placeholderTextColor="#6b7280"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text className="text-white font-semibold mb-2">Moneda</Text>
              <View className="bg-gray-900 rounded-2xl px-4 py-3">
                <Text className="text-white font-semibold">CRC</Text>
                <Text className="text-gray-500 text-xs mt-1">
                  El marketplace opera únicamente en colones costarricenses.
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-white font-semibold mb-2">
                Descripcion corta (opcional)
              </Text>
              <TextInput
                className="bg-gray-900 text-white rounded-2xl px-4 py-3"
                placeholder="Resumen del articulo"
                placeholderTextColor="#6b7280"
                value={shortDescription}
                onChangeText={setShortDescription}
              />
            </View>

            <View>
              <Text className="text-white font-semibold mb-2">
                Descripcion completa
              </Text>
              <TextInput
                className="bg-gray-900 text-white rounded-2xl px-4 py-3 min-h-32"
                placeholder="Detalles adicionales, cuidados, tallas, etc."
                placeholderTextColor="#6b7280"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View>
              <Text className="text-white font-semibold mb-2">
                Categoria (opcional)
              </Text>
              <TextInput
                className="bg-gray-900 text-white rounded-2xl px-4 py-3"
                placeholder="Ropa, Accesorios, etc."
                placeholderTextColor="#6b7280"
                value={category}
                onChangeText={setCategory}
              />
            </View>

            <View>
              <Text className="text-white font-semibold mb-2">
                Imagen principal (URL)
              </Text>
              <TextInput
                className="bg-gray-900 text-white rounded-2xl px-4 py-3"
                placeholder="https://..."
                placeholderTextColor="#6b7280"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-white font-semibold mb-2">
                Galeria (una URL por linea)
              </Text>
              <TextInput
                className="bg-gray-900 text-white rounded-2xl px-4 py-3 min-h-32"
                placeholder="https://imagen-1.jpg&#10;https://imagen-2.jpg"
                placeholderTextColor="#6b7280"
                value={gallery}
                onChangeText={setGallery}
                multiline
                autoCapitalize="none"
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row items-center justify-between bg-gray-900 rounded-2xl px-4 py-3">
              <Text className="text-white font-semibold">Articulo activo</Text>
              <Switch
                value={active}
                onValueChange={setActive}
                thumbColor={active ? "#facc15" : "#6b7280"}
                trackColor={{ false: "#374151", true: "#fde68a" }}
              />
            </View>
          </View>

          <TouchableOpacity
            className="bg-yellow-400 rounded-full px-6 py-4 mt-8 items-center"
            onPress={handleSubmit}
            disabled={isSaving}
          >
            <Text className="font-semibold text-black">
              {isSaving ? "Guardando..." : isEditing ? "Actualizar articulo" : "Guardar articulo"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
