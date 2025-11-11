import zod from "zod";
import { timestampSchema } from "../enrollment/schema";

const courseMemberSchema = zod.array(
  zod.object({
    id: zod.string(),
    userId: zod.string(),
    courseId: zod.string(),
    enrollmentId: zod.string(),
    joinedAt: timestampSchema,
    active: zod.boolean(),
    paymentStatus: zod.enum(["pending", "late", "ok"]),
    attendanceCount: zod.number().min(0),
    nextPaymentDate: timestampSchema.nullable(),
    createdBy: zod.string().nullable(),
    createdAt: timestampSchema,
  })
);

export type CourseMember = zod.infer<typeof courseMemberSchema>;
export { courseMemberSchema };
