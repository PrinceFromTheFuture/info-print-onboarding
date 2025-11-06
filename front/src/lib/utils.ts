import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  const isSingleWord = name.split(" ").length === 1;
  if (isSingleWord) return `${name.charAt(0) + name.charAt(1)}`.toUpperCase();
  
  return `${name.split(" ")[0].charAt(0) + name.split(" ")[1].charAt(0)}`.toUpperCase();
}
