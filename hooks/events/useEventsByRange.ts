import { useMemo } from "react";
import { useEvents } from "./useEvents";
import type { Event } from "./schema";

type Mode = "upcoming" | "recentPast";

const isSameMonth = (date: Date, reference: Date) =>
  date.getFullYear() === reference.getFullYear() &&
  date.getMonth() === reference.getMonth();

const withinPastSixMonths = (date: Date, reference: Date) => {
  const sixMonthsAgo = new Date(reference);
  sixMonthsAgo.setMonth(reference.getMonth() - 6);
  return date >= sixMonthsAgo && date < reference;
};

export const useEventsByRange = (mode: Mode, options?: { includePrivate?: boolean; includeDrafts?: boolean }) => {
  const eventsQuery = useEvents({
    includePrivate: options?.includePrivate,
    includeDrafts: options?.includeDrafts,
  });
  const now = useMemo(() => new Date(), []);

  const data = useMemo(() => {
    if (!eventsQuery.data) return undefined;
    const events = eventsQuery.data as Event[];
    const includePrivate = options?.includePrivate ?? false;
    if (mode === "upcoming") {
      return events
        .filter((event) => (includePrivate ? true : event.isPublic) && event.datetime >= now)
        .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
    }

    // recentPast: past events within the last 6 months
    return events
      .filter(
        (event) =>
          (includePrivate ? true : event.isPublic) &&
          event.datetime < now &&
          withinPastSixMonths(event.datetime, now)
      )
      .sort((a, b) => b.datetime.getTime() - a.datetime.getTime());
  }, [eventsQuery.data, mode, now, options?.includePrivate]);

  return { ...eventsQuery, data };
};
