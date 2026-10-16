import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "Mar 4, 2025". Fixed to UTC so server and client render the same string. */
export function formatDate(date: string | null | undefined) {
  return date ? dateFormat.format(new Date(date)) : null;
}
