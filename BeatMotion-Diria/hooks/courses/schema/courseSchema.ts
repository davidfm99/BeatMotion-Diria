import zod from "zod";

export const courseSchema = zod.array(
  zod.object({
    id: zod.string(),
    title: zod.string().min(2).max(200),
    teacher: zod.string().min(2).max(100),
    description: zod.string().min(10).max(1000),
    isActive: zod.boolean(),
    level: zod.enum(["Inicial", "Intermedio", "Avanzado"]),
    createdBy: zod.string().min(2).max(100).nullable(),
    day: zod.string().min(2).max(50).nullable(),
    startDate: zod
      .any()
      .nullable()
      .transform((value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (value.toDate) return value.toDate();
        return new Date(value);
      }),
  })
);

export type CourseType = zod.infer<typeof courseSchema>[number];
