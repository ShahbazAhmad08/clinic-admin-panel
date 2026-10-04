import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getInitials(name) {
  if (!name) return 'PT';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function getStatusBadge(status) {
  switch (status?.toUpperCase()) {
    case 'WAITING':
      return {
        label: 'Waiting',
        bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        dot: 'bg-amber-500 animate-pulse',
      };
    case 'IN_CONSULTATION':
      return {
        label: 'With Doctor',
        bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        dot: 'bg-blue-500 animate-ping',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        dot: 'bg-emerald-500',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: status || 'Unknown',
        bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        dot: 'bg-gray-400',
      };
  }
}
