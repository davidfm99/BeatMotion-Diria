import zod from "zod";

const timestampSchema = zod
  .any()
  .nullable()
  .transform((value) => {
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
        return new Date(seconds * 1000 + nanos / 1_000_000);
      }
    }
    return null;
  });

const priceSchema = zod
  .union([zod.number(), zod.string()])
  .transform((value, ctx) => {
    if (typeof value === "number") return value;
    const sanitized = value.replace(/[^\d.-]/g, "");
    const parsed = parseFloat(sanitized);
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: "Precio invalido",
      });
      return zod.NEVER;
    }
    return parsed;
  })
  .pipe(zod.number().nonnegative());

const stringOrNullish = zod
  .union([zod.string(), zod.null(), zod.undefined()])
  .transform((value) => (value ?? undefined ? String(value) : undefined));

const imagesSchema = zod
  .union([
    zod.array(zod.string()),
    zod.record(zod.string(), zod.string()),
    zod.null(),
    zod.undefined(),
  ])
  .transform((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return Object.values(value).filter(Boolean);
  });

export const marketplaceItemSchema = zod
  .object({
    id: zod.string(),
    itemId: stringOrNullish,
    name: zod.string(),
    description: stringOrNullish,
    shortDescription: stringOrNullish,
    category: stringOrNullish,
    currency: stringOrNullish,
    createdBy: stringOrNullish,
    active: zod.union([zod.boolean(), zod.undefined()]).default(true),
    price: priceSchema,
    images: imagesSchema,
    imageUrl: stringOrNullish,
    gallery: zod.array(zod.string()).optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .transform((value) => {
    const imagesCandidate = value.images.length ? value.images : value.gallery ?? [];
    const images = Array.from(new Set(imagesCandidate.filter(Boolean)));
    const imageUrl = value.imageUrl ?? images[0];
    const shortDescription =
      value.shortDescription ??
      (value.description ? value.description.slice(0, 100) : undefined);
    const currency = value.currency ?? "CRC";

    return {
      ...value,
      images,
      imageUrl,
      gallery: images,
      shortDescription,
      currency,
    };
  });

export const marketplaceCollectionSchema = zod.array(marketplaceItemSchema);

export type MarketplaceItem = zod.infer<typeof marketplaceItemSchema>;
