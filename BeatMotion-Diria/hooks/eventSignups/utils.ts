import type { EventSignup } from "./schema";

export const ACTIVE_SIGNUP_STATUSES = ["pending", "approved", "autoApproved"] as const;

export const isActiveSignup = (status: string) =>
  ACTIVE_SIGNUP_STATUSES.includes(status as (typeof ACTIVE_SIGNUP_STATUSES)[number]);

export const sumActiveAttendees = (signups: EventSignup[]) =>
  signups.reduce((total, signup) => {
    if (!isActiveSignup(signup.status)) return total;
    return total + Number(signup.totalAttendees ?? 0);
  }, 0);

export const computeTotals = ({
  inviteeCount,
  pricePerHead,
}: {
  inviteeCount: number;
  pricePerHead: number | null | undefined;
}) => {
  const safeInvitees = Number.isFinite(inviteeCount) ? Math.max(0, Math.floor(inviteeCount)) : 0;
  const totalAttendees = safeInvitees + 1;
  const perHead = pricePerHead ?? 0;
  const totalPrice = perHead * totalAttendees;
  return { totalAttendees, totalPrice, pricePerHead: perHead };
};
