import zod from "zod";
import { timestampSchema } from "../enrollment/schema";

export const draftSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  content: zod.string(),
  createdAt: timestampSchema,
  recipients: zod.array(zod.string()),
});

export const draftListSchema = zod.array(draftSchema);
