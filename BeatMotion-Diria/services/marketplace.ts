import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/firebaseConfig";

type NullableString = string | null | undefined;

type MarketplaceUpsertInput = {
  name: string;
  price: number;
  description?: NullableString;
  shortDescription?: NullableString;
  category?: NullableString;
  currency?: string;
  active?: boolean;
  itemId?: NullableString;
  images?: string[];
  createdBy?: string;
};

const normalizeOptionalText = (value: NullableString) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const prepareMarketplacePayload = (data: MarketplaceUpsertInput) => {
  const normalizeMediaUrl = (value: string | null | undefined) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.replace(/^['"]+|['"]+$/g, "").trim();
  };

  const uniqueImages = Array.from(
    new Set(
      data.images
        ?.map((image) => normalizeMediaUrl(image ?? ""))
        .filter((entry) => entry.length > 0) ?? [],
    ),
  );
  const primaryImage = uniqueImages[0] ?? null;

  const payload: Record<string, unknown> = {
    name: data.name,
    price: data.price,
    currency: (data.currency ?? "CRC").toUpperCase(),
    active: data.active ?? true,
    images: uniqueImages,
    imageUrl: primaryImage,
    gallery: uniqueImages,
  };

  const description = normalizeOptionalText(data.description);
  if (description !== undefined) payload.description = description;

  const shortDescriptionInput = normalizeOptionalText(data.shortDescription);
  const resolvedShortDescription =
    shortDescriptionInput !== undefined
      ? shortDescriptionInput
      : typeof description === "string"
        ? description.slice(0, 100)
        : undefined;
  if (resolvedShortDescription !== undefined) {
    payload.shortDescription = resolvedShortDescription;
  }

  const category = normalizeOptionalText(data.category);
  if (category !== undefined) payload.category = category;

  const itemId = normalizeOptionalText(data.itemId);
  if (itemId !== undefined) payload.itemId = itemId;

  if (data.createdBy) payload.createdBy = data.createdBy;

  return payload;
};

export type NewMarketplaceItem = Omit<MarketplaceUpsertInput, "createdBy"> & {
  createdBy: string;
};

export type UpdateMarketplaceItem = MarketplaceUpsertInput;

export const addMarketplaceItem = async (data: NewMarketplaceItem) => {
  const payload = {
    ...prepareMarketplacePayload({ ...data, createdBy: data.createdBy }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(firestore, "marketplace"), payload);
  return docRef.id;
};

export const updateMarketplaceItem = async (
  itemId: string,
  data: UpdateMarketplaceItem,
) => {
  const payload = {
    ...prepareMarketplacePayload(data),
    updatedAt: serverTimestamp(),
  };

  const itemRef = doc(firestore, "marketplace", itemId);
  await updateDoc(itemRef, payload);
};

export const deleteMarketplaceItem = async (itemId: string) => {
  const itemRef = doc(firestore, "marketplace", itemId);
  await deleteDoc(itemRef);
};
