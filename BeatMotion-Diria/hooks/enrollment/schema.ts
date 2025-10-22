import zod from "zod";

export const enrollmentSchema = zod.array(
  zod.object({
    id: zod.string(),
    userId: zod.string(),
    courseId: zod.string(),
    status: zod.enum(["pending", "accepted", "rejected"]),
    submittedAt: zod
      .any()
      .nullable()
      .transform((value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (value.toDate) return value.toDate();
        if (
          typeof value === "object" &&
          "seconds" in value &&
          "nanoseconds" in value
        ) {
          return new Date(value.seconds * 1000 + value.nanoseconds / 1_000_000);
        }
        if (typeof value === "string") return new Date(value);
        return null;
      }),
    paymentProofImage: zod.string().url().optional(),
    reviewedBy: zod.string().nullable(),
    reviewedAt: zod
      .any()
      .nullable()
      .transform((value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (value.toDate) return value.toDate();
        if (
          typeof value === "object" &&
          "seconds" in value &&
          "nanoseconds" in value
        ) {
          return new Date(value.seconds * 1000 + value.nanoseconds / 1_000_000);
        }
        if (typeof value === "string") return new Date(value);
        return null;
      }),
    totalAmount: zod.number().min(0),
    course: zod
      .object({
        id: zod.string(),
        title: zod.string(),
        description: zod.string(),
        level: zod.string(),
        day: zod.string().nullable(),
        startDate: zod
          .any()
          .nullable()
          .transform((value) => {
            if (!value) return null;
            if (value instanceof Date) return value;
            if (value.toDate) return value.toDate();
            if (
              typeof value === "object" &&
              "seconds" in value &&
              "nanoseconds" in value
            ) {
              return new Date(
                value.seconds * 1000 + value.nanoseconds / 1_000_000
              );
            }
            if (typeof value === "string") return new Date(value);
            return null;
          }),
      })
      .nullish(),
    user: zod
      .object({
        id: zod.string(),
        firstName: zod.string(),
        lastName: zod.string(),
        email: zod.string().email(),
      })
      .nullish(),
  })
);

export type Enrollment = zod.infer<typeof enrollmentSchema>[number];
