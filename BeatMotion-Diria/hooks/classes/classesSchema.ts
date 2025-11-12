import zod from "zod";
import { timestampSchema } from "../enrollment/schema";

export const ClassesSchema = zod.object({
  id: zod.string(),
  title: zod.string().nullable(),
  capacity: zod.number(),
  courseId: zod.string(),
  createdAt: timestampSchema,
  date: zod.string(),
  description: zod.string().nullish(),
  objectives: zod.string().nullish(),
  startTime: zod.string(),
  endTime: zod.string(),
  UpdateAt: timestampSchema,
  content: zod.string().nullish(),
  videoLinks: zod
    .array(
      zod.object({
        title: zod.string(),
        url: zod.string().url(),
        platform: zod.string().nullable(),
      })
    )
    .nullish(),
});

export type ClassesType = zod.infer<typeof ClassesSchema>;

export const ClassesSchemaArray = zod.array(ClassesSchema);
