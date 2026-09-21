import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount).replace('INR', 'Rs.');
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(timeString: string): string {
  if (!timeString) return '-';
  if (timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
  }
  return timeString;
}

export function calculateProgramDays(duration: string, customDays?: number): number {
  switch (duration) {
    case '3 Day Trial': return 3;
    case '15 Days': return 15;
    case '21 Days': return 21;
    case '30 Days': return 30;
    case '60 Days': return 60;
    case 'Custom': return customDays || 30;
    default: return 30;
  }
}

export function calculateTotalPlanCost(durationInDays: number, pricePerDay: number): number {
  return durationInDays * pricePerDay;
}

export function generateCustomerId(existingCount: number): string {
  const num = (existingCount + 1).toString().padStart(4, '0');
  return `AF-${new Date().getFullYear()}-${num}`;
}

export function generateOrderId(existingCount: number): string {
  const num = (existingCount + 1001).toString();
  return `ORD-${num}`;
}

export function generateInvoiceNumber(existingCount: number): string {
  const num = (existingCount + 1).toString().padStart(4, '0');
  return `INV-${new Date().getFullYear()}-${num}`;
}
