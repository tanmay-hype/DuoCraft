import clsx, { type ClassValue } from "clsx";


export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}


export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}