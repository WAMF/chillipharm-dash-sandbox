import type { AssetRecord } from '@cp/types';
import { groupBy, sumBy } from './aggregation';
import { getCountryName } from './formatting';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

const CHART_COLORS = {
  primary: '#c8102e',
  success: '#10b981',
  warning: '#ed7621',
  error: '#ef4444',
  neutral: '#6b7280',
};

const COLOR_PALETTE = [
  '#c8102e',
  '#10b981',
  '#ed7621',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#6366f1',
  '#84cc16',
];

export function getAssetsByCountry(assets: AssetRecord[]): ChartDataPoint[] {
  const grouped = groupBy(assets, (a) => a.siteCountry || 'Unknown', getCountryName);

  return grouped
    .map((group, index) => ({
      label: group.label,
      value: group.count,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }))
    .sort((a, b) => b.value - a.value);
}

export function getAssetsBySite(assets: AssetRecord[]): ChartDataPoint[] {
  const grouped = groupBy(assets, (a) => a.siteName || 'Unknown');

  return grouped
    .map((group, index) => ({
      label: group.label,
      value: group.count,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }))
    .sort((a, b) => b.value - a.value);
}

export function getProcessingStatusData(processed: number, pending: number): ChartDataPoint[] {
  return [
    { label: 'Processed', value: processed, color: CHART_COLORS.success },
    { label: 'Pending', value: pending, color: CHART_COLORS.warning },
  ];
}

export function getReviewStatusData(reviewed: number, unreviewed: number): ChartDataPoint[] {
  return [
    { label: 'Reviewed', value: reviewed, color: CHART_COLORS.success },
    { label: 'Pending Review', value: unreviewed, color: CHART_COLORS.neutral },
  ];
}

export function getFileSizeByTrial(assets: AssetRecord[]): ChartDataPoint[] {
  const grouped = groupBy(assets, (a) => a.trialName || 'Unknown');

  return grouped
    .map((group, index) => ({
      label: group.label,
      value: 0,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }))
    .sort((a, b) => b.value - a.value);
}

export function getTimelineData(
  dataPoints: Array<{ date: string; value: number }>,
  label: string
): LineChartData {
  return {
    labels: dataPoints.map((d) => d.date),
    datasets: [
      {
        label,
        data: dataPoints.map((d) => d.value),
        borderColor: CHART_COLORS.primary,
        backgroundColor: `${CHART_COLORS.primary}20`,
      },
    ],
  };
}

export function prepareDonutChartData(dataPoints: ChartDataPoint[]): {
  labels: string[];
  data: number[];
  colors: string[];
} {
  return {
    labels: dataPoints.map((d) => d.label),
    data: dataPoints.map((d) => d.value),
    colors: dataPoints.map((d) => d.color || CHART_COLORS.neutral),
  };
}

export function prepareBarChartData(dataPoints: ChartDataPoint[]): {
  labels: string[];
  data: number[];
  colors: string[];
} {
  return {
    labels: dataPoints.map((d) => d.label),
    data: dataPoints.map((d) => d.value),
    colors: dataPoints.map((d) => d.color || CHART_COLORS.primary),
  };
}
