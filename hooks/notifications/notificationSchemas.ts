import zod from "zod";
import { timestampSchema } from "../enrollment/schema";

export const draftSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  content: zod.string(),
  createdAt: timestampSchema,
  recipients: zod.enum(["all", "user", "teacher"]),
});

export const draftListSchema = zod.array(draftSchema);

export type RequestSchema = {
  title: string;
  content: string;
  recipients: "all" | "user" | "teacher";
};

export const notificationsSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  content: zod.string(),
  createdAt: timestampSchema,
  read: zod.boolean(),
});

export const notificationsList = zod.array(notificationsSchema);

export type Notification = zod.infer<typeof notificationsSchema>;
