import { clsx, type ClassValue } from 'clsx';

// Lightweight clsx reimplementation (no extra dep needed)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a date relative to now (e.g. "hace 2 horas")
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHrs < 24) return `hace ${diffHrs}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return past.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

/**
 * Format minutes into "Xh Ym"
 */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Calculate progress percentage
 */
export function progressPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Project status labels in Spanish
 */
export const STATUS_LABELS: Record<string, string> = {
  planificado: 'Planificado',
  en_progreso: 'En Progreso',
  completado: 'Completado',
  pausado: 'Pausado',
};

/**
 * Get days until deadline (negative = overdue)
 */
export function daysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Export data to a JSON file download
 */
export function exportToJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
