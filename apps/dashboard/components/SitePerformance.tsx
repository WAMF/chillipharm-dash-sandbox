'use client';

import { useMemo, useCallback } from 'react';
import { Chart } from './Chart';
import { useDashboard } from '../contexts/DashboardContext';

export function SitePerformance() {
  const {
    sitePerformance,
    filteredRecords,
    isLoading,
    setShowAssetList,
    setAssetListTitle,
    setAssetListRecords
  } = useDashboard();

  const topSites = useMemo(() => sitePerformance.slice(0, 10), [sitePerformance]);

  const chartData = useMemo(() => ({
    labels: topSites.map(s => s.siteName.substring(0, 20)),
    datasets: [
      {
        label: 'Total Assets',
        data: topSites.map(s => s.totalAssets),
        backgroundColor: 'rgba(200, 16, 46, 0.8)',
      },
      {
        label: 'Reviewed',
        data: topSites.map(s => s.reviewedAssets),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      }
    ]
  }), [topSites]);

  const chartOptions = useMemo(() => ({
    plugins: {
      title: {
        display: true,
        text: 'Top Sites by Asset Volume'
      },
      legend: {
        display: true,
        position: 'bottom' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    indexAxis: 'y' as const
  }), []);

  const getTrendColor = useCallback((trend: number): string => {
    if (trend > 10) return '#10b981';
    if (trend < -10) return '#ef4444';
    return '#6b7280';
  }, []);

  const getTrendIcon = useCallback((trend: number): string => {
    if (trend > 0) return '↑';
    if (trend < 0) return '↓';
    return '→';
  }, []);

  const handleSiteClick = useCallback((siteName: string) => {
    const siteAssets = filteredRecords.filter(r => r.siteName === siteName);
    setAssetListTitle(`Assets for Site: ${siteName}`);
    setAssetListRecords(siteAssets);
    setShowAssetList(true);
  }, [filteredRecords, setAssetListTitle, setAssetListRecords, setShowAssetList]);

  const handleChartClick = useCallback((data: { label: string; index: number; value: number }) => {
    const site = topSites[data.index];
    if (site) {
      handleSiteClick(site.siteName);
    }
  }, [topSites, handleSiteClick]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-80"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse">
            <div className="h-full bg-neutral-100 rounded"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse">
            <div className="h-full bg-neutral-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (topSites.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-neutral-500">No site data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-neutral-800 mb-1">Site Performance Analytics</h2>
        <p className="text-neutral-500 text-sm">Clinical site activity and review metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Chart
            type="bar"
            data={chartData}
            options={chartOptions}
            height="450px"
            clickable={true}
            onBarClick={handleChartClick}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Site Performance Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="text-left py-3 px-2 font-semibold text-neutral-700 border-b-2 border-neutral-200">Site Name</th>
                  <th className="text-left py-3 px-2 font-semibold text-neutral-700 border-b-2 border-neutral-200">Assets</th>
                  <th className="text-left py-3 px-2 font-semibold text-neutral-700 border-b-2 border-neutral-200">Review Rate</th>
                  <th className="text-center py-3 px-2 font-semibold text-neutral-700 border-b-2 border-neutral-200">Trend</th>
                </tr>
              </thead>
              <tbody>
                {topSites.map((site, index) => (
                  <tr
                    key={site.siteName}
                    className="cursor-pointer transition-colors hover:bg-neutral-100 focus:outline focus:outline-2 focus:outline-chilli-red"
                    onClick={() => handleSiteClick(site.siteName)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSiteClick(site.siteName)}
                    tabIndex={0}
                    role="button"
                  >
                    <td className="py-3 px-2 border-b border-neutral-200">
                      <div className="flex items-center gap-2 font-medium max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-chilli-red text-white rounded-full text-xs font-semibold">
                          {index + 1}
                        </span>
                        {site.siteName}
                      </div>
                    </td>
                    <td className="py-3 px-2 border-b border-neutral-200 font-semibold text-chilli-red">
                      {site.totalAssets}
                    </td>
                    <td className="py-3 px-2 border-b border-neutral-200">
                      <div className="relative h-6 bg-neutral-100 rounded overflow-hidden min-w-[100px]">
                        <div
                          className="absolute h-full bg-gradient-to-r from-chilli-red to-pink-500 transition-all duration-300"
                          style={{ width: `${site.reviewRate}%` }}
                        />
                        <span className="relative z-10 flex items-center justify-center h-full text-xs font-semibold text-neutral-700">
                          {site.reviewRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 border-b border-neutral-200 text-center">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: getTrendColor(site.uploadTrend) }}
                      >
                        {getTrendIcon(site.uploadTrend)} {Math.abs(site.uploadTrend).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
