import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatKDA(kills: number, deaths: number, assists: number): string {
  const kda = deaths > 0 ? ((kills + assists) / deaths).toFixed(2) : (kills + assists).toFixed(2);
  return kda;
}

export function getPlacementColor(placement: number): string {
  if (placement === 1) return 'text-yellow-400';
  if (placement === 2) return 'text-gray-300';
  if (placement === 3) return 'text-orange-400';
  if (placement <= 5) return 'text-green-400';
  if (placement <= 10) return 'text-blue-400';
  return 'text-gray-500';
}

export function getRankBadgeColor(rank: number): string {
  if (rank <= 3) return 'bg-yellow-500';
  if (rank <= 10) return 'bg-blue-500';
  if (rank <= 50) return 'bg-green-500';
  return 'bg-gray-500';
}
