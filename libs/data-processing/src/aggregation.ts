import type { AssetRecord } from '@cp/types';

export interface GroupedData<T> {
  key: string;
  label: string;
  items: T[];
  count: number;
}

export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
  labelFn?: (key: string) => string
): GroupedData<T>[] {
  const groups = new Map<string, T[]>();

  items.forEach((item) => {
    const key = keyFn(item);
    const existing = groups.get(key) || [];
    existing.push(item);
    groups.set(key, existing);
  });

  return Array.from(groups.entries()).map(([key, groupItems]) => ({
    key,
    label: labelFn ? labelFn(key) : key,
    items: groupItems,
    count: groupItems.length,
  }));
}

export function sumBy<T>(items: T[], valueFn: (item: T) => number): number {
  return items.reduce((sum, item) => sum + valueFn(item), 0);
}

export function averageBy<T>(items: T[], valueFn: (item: T) => number): number {
  if (items.length === 0) return 0;
  return sumBy(items, valueFn) / items.length;
}

export function countBy<T>(items: T[], predicateFn: (item: T) => boolean): number {
  return items.filter(predicateFn).length;
}

export interface AggregatedMetrics {
  total: number;
  processed: number;
  pending: number;
  reviewed: number;
  processedRate: number;
  reviewedRate: number;
  totalFileSize: number;
  totalDuration: number;
}

export function aggregateAssetMetrics(assets: AssetRecord[]): AggregatedMetrics {
  const total = assets.length;
  const processed = countBy(assets, (a) => a.processed === 'Yes');
  const reviewed = countBy(assets, (a) => a.reviewed === true);
  const pending = total - processed;

  const processedRate = total > 0 ? (processed / total) * 100 : 0;
  const reviewedRate = total > 0 ? (reviewed / total) * 100 : 0;

  const totalFileSize = 0;
  const totalDuration = 0;

  return {
    total,
    processed,
    pending,
    reviewed,
    processedRate,
    reviewedRate,
    totalFileSize,
    totalDuration,
  };
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export function aggregateByDate<T>(
  items: T[],
  dateFn: (item: T) => string,
  valueFn?: (items: T[]) => number
): TimeSeriesPoint[] {
  const grouped = groupBy(items, dateFn);

  return grouped
    .map((group) => ({
      date: group.key,
      value: valueFn ? valueFn(group.items) : group.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
