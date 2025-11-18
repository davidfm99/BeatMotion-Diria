import zod from "zod";
import { timestampSchema } from "../enrollment/schema";

export const draftSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  content: zod.string(),
  createdAt: timestampSchema,
  recipients: zod.enum(["all", "student", "teacher"]),
});

export const draftListSchema = zod.array(draftSchema);

export type RequestSchema = {
  title: string;
  content: string;
  recipients: "all" | "student" | "teacher";
};
