import zod from "zod";

const timestampSchema = zod.any().transform((value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && value !== null) {
    if (typeof (value as { toDate?: () => Date }).toDate === "function") {
      return (value as { toDate: () => Date }).toDate();
    }
    if ("seconds" in value && "nanoseconds" in value) {
      const seconds = Number(
        (value as { seconds: number; nanoseconds: number }).seconds,
      );
      const nanos = Number(
        (value as { seconds: number; nanoseconds: number }).nanoseconds,
      );
      const date = new Date(seconds * 1000 + nanos / 1_000_000);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }
  return null;
});

const nullableNumber = zod
  .union([zod.number(), zod.null(), zod.undefined(), zod.string()])
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  });

export const eventSchema = zod
  .object({
    id: zod.string(),
    title: zod.string(),
    description: zod.string().optional().default(""),
    bannerUrl: zod.string().optional().nullable().default(""),
    datetime: timestampSchema,
    capacity: nullableNumber,
    isPublic: zod.boolean().default(true),
    price: nullableNumber,
    status: zod.enum(["draft", "published"]).default("draft"),
    category: zod.string().optional().default("general"),
    location: zod.string().optional().default(""),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
    createdBy: zod.string().optional().default(""),
  })
  .transform((value) => {
    const datetime = value.datetime ?? new Date();
    const createdAt = value.createdAt ?? datetime;
    const updatedAt = value.updatedAt ?? datetime;
    const capacity = value.capacity ?? null;
    const price = value.price ?? null;
    const bannerUrl = value.bannerUrl ?? "";
    const description = value.description ?? "";
    const category = value.category ?? "general";
    const location = value.location ?? "";

    return {
      ...value,
      datetime,
      createdAt,
      updatedAt,
      capacity,
      price,
      bannerUrl,
      description,
      category,
      location,
    };
  });

export const eventCollectionSchema = zod.array(eventSchema);

export type Event = zod.infer<typeof eventSchema>;
