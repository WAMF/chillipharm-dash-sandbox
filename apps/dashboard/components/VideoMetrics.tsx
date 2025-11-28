'use client';

import { useMemo, useCallback } from 'react';
import { Chart } from './Chart';
import { MetricCard } from './MetricCard';
import { useDashboard } from '../contexts/DashboardContext';

const DURATION_BUCKETS: Record<string, { min: number; max: number }> = {
  '0-30s': { min: 0, max: 30 },
  '30s-1m': { min: 30, max: 60 },
  '1-2m': { min: 60, max: 120 },
  '2-5m': { min: 120, max: 300 },
  '5-10m': { min: 300, max: 600 },
  '10m+': { min: 600, max: Infinity }
};

const SIZE_BUCKETS: Record<string, { min: number; max: number }> = {
  '0-1MB': { min: 0, max: 1024 * 1024 },
  '1-5MB': { min: 1024 * 1024, max: 5 * 1024 * 1024 },
  '5-10MB': { min: 5 * 1024 * 1024, max: 10 * 1024 * 1024 },
  '10-50MB': { min: 10 * 1024 * 1024, max: 50 * 1024 * 1024 },
  '50-100MB': { min: 50 * 1024 * 1024, max: 100 * 1024 * 1024 },
  '100MB+': { min: 100 * 1024 * 1024, max: Infinity }
};

const CHART_COLORS = [
  'rgba(16, 185, 129, 0.8)',
  'rgba(52, 211, 153, 0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(139, 92, 246, 0.8)',
  'rgba(237, 118, 33, 0.8)',
  'rgba(200, 16, 46, 0.8)'
];

function parseDurationToSeconds(duration: string): number {
  if (!duration || typeof duration !== 'string') return 0;
  const parts = duration.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  } else if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return parseInt(duration) || 0;
}

function parseFileSizeToBytes(size: string): number {
  if (!size || typeof size !== 'string') return 0;
  const match = size.match(/^([\d.]+)\s*(KB|MB|GB|B)?$/i);
  if (!match) return parseFloat(size) || 0;
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'B').toUpperCase();
  const multipliers: Record<string, number> = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  return value * (multipliers[unit] || 1);
}

export function VideoMetrics() {
  const {
    videoMetrics,
    filteredRecords,
    isLoading,
    setShowAssetList,
    setAssetListTitle,
    setAssetListRecords
  } = useDashboard();

  const durationChartData = useMemo(() => {
    if (!videoMetrics) return { labels: [], datasets: [] };
    return {
      labels: videoMetrics.durationDistribution.map(d => d.range),
      datasets: [{
        label: 'Videos',
        data: videoMetrics.durationDistribution.map(d => d.count),
        backgroundColor: CHART_COLORS
      }]
    };
  }, [videoMetrics]);

  const sizeChartData = useMemo(() => {
    if (!videoMetrics) return { labels: [], datasets: [] };
    return {
      labels: videoMetrics.sizeDistribution.map(s => s.range),
      datasets: [{
        label: 'Videos',
        data: videoMetrics.sizeDistribution.map(s => s.count),
        backgroundColor: CHART_COLORS
      }]
    };
  }, [videoMetrics]);

  const { totalDurationVideos, totalSizeVideos, mostCommonDuration, mostCommonSize } = useMemo(() => {
    if (!videoMetrics) {
      return { totalDurationVideos: 0, totalSizeVideos: 0, mostCommonDuration: 'N/A', mostCommonSize: 'N/A' };
    }
    const durationTotal = videoMetrics.durationDistribution.reduce((sum, d) => sum + d.count, 0);
    const sizeTotal = videoMetrics.sizeDistribution.reduce((sum, s) => sum + s.count, 0);
    const commonDuration = videoMetrics.durationDistribution.length > 0
      ? videoMetrics.durationDistribution.reduce((max, d) => d.count > max.count ? d : max, videoMetrics.durationDistribution[0]).range
      : 'N/A';
    const commonSize = videoMetrics.sizeDistribution.length > 0
      ? videoMetrics.sizeDistribution.reduce((max, s) => s.count > max.count ? s : max, videoMetrics.sizeDistribution[0]).range
      : 'N/A';
    return { totalDurationVideos: durationTotal, totalSizeVideos: sizeTotal, mostCommonDuration: commonDuration, mostCommonSize: commonSize };
  }, [videoMetrics]);

  const handleDurationClick = useCallback((range: string) => {
    const bucket = DURATION_BUCKETS[range];
    if (!bucket) return;
    const matchingAssets = filteredRecords.filter(r => {
      const seconds = parseDurationToSeconds(r.assetDuration);
      return seconds >= bucket.min && seconds < bucket.max;
    });
    setAssetListTitle(`Videos: ${range} Duration`);
    setAssetListRecords(matchingAssets);
    setShowAssetList(true);
  }, [filteredRecords, setAssetListTitle, setAssetListRecords, setShowAssetList]);

  const handleSizeClick = useCallback((range: string) => {
    const bucket = SIZE_BUCKETS[range];
    if (!bucket) return;
    const matchingAssets = filteredRecords.filter(r => {
      const bytes = parseFileSizeToBytes(r.fileSize);
      return bytes >= bucket.min && bytes < bucket.max;
    });
    setAssetListTitle(`Videos: ${range} Size`);
    setAssetListRecords(matchingAssets);
    setShowAssetList(true);
  }, [filteredRecords, setAssetListTitle, setAssetListRecords, setShowAssetList]);

  const handleDurationChartClick = useCallback((data: { label: string; index: number; value: number }) => {
    handleDurationClick(data.label);
  }, [handleDurationClick]);

  const handleSizeChartClick = useCallback((data: { label: string; index: number; value: number }) => {
    handleSizeClick(data.label);
  }, [handleSizeClick]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-80"></div>
        </div>
      </div>
    );
  }

  if (!videoMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-neutral-500">No video metrics available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-neutral-800 mb-1">Video Metrics</h2>
        <p className="text-neutral-500 text-sm">Duration and storage analytics for video assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Duration"
          value={videoMetrics.totalDuration}
          subtitle="Combined video length"
        />
        <MetricCard
          title="Avg Duration"
          value={videoMetrics.avgDuration}
          subtitle="Per video asset"
        />
        <MetricCard
          title="Total Storage"
          value={videoMetrics.totalSize}
          subtitle="All video files"
        />
        <MetricCard
          title="Avg File Size"
          value={videoMetrics.avgSize}
          subtitle="Per video asset"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-1">Duration Distribution</h3>
          <p className="text-xs text-neutral-500 mb-4">Number of videos by duration range</p>
          <Chart
            type="bar"
            data={durationChartData}
            height="300px"
            clickable={true}
            onBarClick={handleDurationChartClick}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Videos' } },
                x: { title: { display: true, text: 'Duration Range' } }
              }
            }}
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">Duration</th>
                  <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">Count</th>
                  <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {videoMetrics.durationDistribution.map((bucket) => (
                  <tr
                    key={bucket.range}
                    className="cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleDurationClick(bucket.range)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDurationClick(bucket.range)}
                    tabIndex={0}
                    role="button"
                  >
                    <td className="py-2 px-2 border-b border-neutral-200">{bucket.range}</td>
                    <td className="py-2 px-2 border-b border-neutral-200">{bucket.count}</td>
                    <td className="py-2 px-2 border-b border-neutral-200">
                      {totalDurationVideos > 0 ? ((bucket.count / totalDurationVideos) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-1">File Size Distribution</h3>
          <p className="text-xs text-neutral-500 mb-4">Number of videos by file size range</p>
          <Chart
            type="bar"
            data={sizeChartData}
            height="300px"
            clickable={true}
            onBarClick={handleSizeChartClick}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Videos' } },
                x: { title: { display: true, text: 'Size Range' } }
              }
            }}
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">Size Range</th>
                  <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">Count</th>
                  <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {videoMetrics.sizeDistribution.map((bucket) => (
                  <tr
                    key={bucket.range}
                    className="cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleSizeClick(bucket.range)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSizeClick(bucket.range)}
                    tabIndex={0}
                    role="button"
                  >
                    <td className="py-2 px-2 border-b border-neutral-200">{bucket.range}</td>
                    <td className="py-2 px-2 border-b border-neutral-200">{bucket.count}</td>
                    <td className="py-2 px-2 border-b border-neutral-200">
                      {totalSizeVideos > 0 ? ((bucket.count / totalSizeVideos) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Storage Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
            <div className="text-3xl">📹</div>
            <div>
              <div className="text-xs text-neutral-500">Video Count</div>
              <div className="text-lg font-semibold text-neutral-800">{totalDurationVideos.toLocaleString()} videos</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
            <div className="text-3xl">⏰</div>
            <div>
              <div className="text-xs text-neutral-500">Most Common Duration</div>
              <div className="text-lg font-semibold text-neutral-800">{mostCommonDuration}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
            <div className="text-3xl">📊</div>
            <div>
              <div className="text-xs text-neutral-500">Most Common Size</div>
              <div className="text-lg font-semibold text-neutral-800">{mostCommonSize}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
