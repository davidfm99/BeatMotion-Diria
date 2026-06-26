import zod from "zod";
import { timestampSchema } from "../enrollment/schema";

export const userSchema = zod
  .object({
    id: zod.string(),
    email: zod.string().email(),
    name: zod.string().min(2).max(100),
    lastName: zod.string().min(2).max(100),
    phone: zod.string().optional(),
    role: zod.enum(["user", "admin", "teacher"]),
    photoURL: zod.string().url().optional(),
    isActive: zod.boolean(),
    createdAt: timestampSchema,
  })
  .transform((user) => ({
    ...user,
    fullName: `${user.name} ${user.lastName}`,
  }));

export const userListSchema = zod.array(userSchema);

export type ProfilePayload = {
  uid: string;
  body: {
    phone: string;
    name: string;
    lastName: string;
    role?: string;
  };
};
