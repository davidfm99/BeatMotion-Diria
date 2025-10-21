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
        return new Date(value);
      }),
    paymentProofUrl: zod.string().url().optional(),
    reviewedBy: zod.string().nullable(),
    reviewedAt: zod
      .any()
      .nullable()
      .transform((value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (value.toDate) return value.toDate();
        return new Date(value);
      }),
    totalAmount: zod.number().min(0),
  })
);

export type Enrollment = zod.infer<typeof enrollmentSchema>[number];
