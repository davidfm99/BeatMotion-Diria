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
          (value as { seconds: number; nanoseconds: number }).seconds
        );
        const nanos = Number(
          (value as { seconds: number; nanoseconds: number }).nanoseconds
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

export const eventSignupSchema = zod.object({
  id: zod.string(),
  eventId: zod.string(),
  userId: zod.string(),
  userName: zod.string(),
  userEmail: zod.string(),
  inviteeCount: zod.number(),
  totalAttendees: zod.number(),
  pricePerHead: nullableNumber,
  totalPrice: zod.number(),
  status: zod.enum(["pending", "approved", "rejected", "canceled", "autoApproved"]),
  receiptUrl: zod.string().nullable().optional(),
  isFree: zod.boolean(),
  isPublic: zod.boolean(),
  reviewedBy: zod.string().nullable().optional(),
  reviewedAt: timestampSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const eventSignupCollectionSchema = zod.array(eventSignupSchema);

export type EventSignup = zod.infer<typeof eventSignupSchema>;
export type EventSignupStatus = EventSignup["status"];
