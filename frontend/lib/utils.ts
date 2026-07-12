import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard utility to merge Tailwind CSS classes cleanly, preventing conflicts.
 * Essential for building reusable Shadcn-like components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
