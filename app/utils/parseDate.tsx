import type { Summary } from "~/types/summaries";

export const parseDate = (createdAt: Summary["createdAt"]) => {
  if (createdAt && typeof createdAt === "object" && "_seconds" in createdAt) {
    return new Date(
      createdAt._seconds * 1000 + Math.floor(createdAt._nanoseconds / 1e6)
    );
  }
  return new Date(createdAt);
};
