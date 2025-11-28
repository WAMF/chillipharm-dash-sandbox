'use client';

import { useMemo, useCallback } from 'react';
import { WorldMap } from './WorldMap';
import { useDashboard } from '../contexts/DashboardContext';

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

export function IntegrationHealth() {
  const {
    filteredRecords,
    countryDistribution,
    isLoading,
    setSelectedAsset,
    setShowAssetList,
    setAssetListTitle,
    setAssetListRecords
  } = useDashboard();

  const evaluatorStats = useMemo(() => {
    const evaluatorCounts = new Map<string, number>();
    filteredRecords.forEach(record => {
      const evaluator = record.evaluator?.trim();
      if (evaluator) {
        evaluatorCounts.set(evaluator, (evaluatorCounts.get(evaluator) || 0) + 1);
      }
    });
    return Array.from(evaluatorCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRecords]);

  const recentActivity = useMemo(() => {
    return [...filteredRecords]
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
      .slice(0, 10);
  }, [filteredRecords]);

  const processedCount = useMemo(
    () => filteredRecords.filter(r => r.processed === 'Yes').length,
    [filteredRecords]
  );

  const reviewedCount = useMemo(
    () => filteredRecords.filter(r => r.reviewed).length,
    [filteredRecords]
  );

  const handleActivityClick = useCallback((asset: typeof filteredRecords[0]) => {
    setSelectedAsset(asset);
  }, [setSelectedAsset]);

  const handleViewAsset = useCallback((event: React.MouseEvent, asset: typeof filteredRecords[0]) => {
    event.stopPropagation();
    if (asset.assetLink) {
      window.open(asset.assetLink, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleEvaluatorClick = useCallback((evaluatorName: string) => {
    const evaluatorAssets = filteredRecords.filter(r => r.evaluator === evaluatorName);
    setAssetListTitle(`Assets Evaluated by: ${evaluatorName}`);
    setAssetListRecords(evaluatorAssets);
    setShowAssetList(true);
  }, [filteredRecords, setAssetListTitle, setAssetListRecords, setShowAssetList]);

  const handleCountryClick = useCallback((country: string) => {
    const countryAssets = filteredRecords.filter(r => r.siteCountry === country);
    setAssetListTitle(`Assets from: ${country}`);
    setAssetListRecords(countryAssets);
    setShowAssetList(true);
  }, [filteredRecords, setAssetListTitle, setAssetListRecords, setShowAssetList]);

  const maxEvaluatorCount = evaluatorStats.length > 0 ? evaluatorStats[0].count : 1;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-80"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 h-[500px] animate-pulse">
          <div className="h-full bg-neutral-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-neutral-800 mb-1">Integration Health & Activity</h2>
        <p className="text-neutral-500 text-sm">System usage, evaluator activity, and geographic distribution</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Geographic Distribution</h3>
        <WorldMap countryData={countryDistribution} onCountryClick={handleCountryClick} />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Top Evaluators</h3>
        <div className="flex flex-col gap-2">
          {evaluatorStats.slice(0, 10).map((evaluator) => (
            <div
              key={evaluator.name}
              className="flex items-center gap-3 px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200 cursor-pointer transition-all hover:bg-neutral-100 hover:border-chilli-red"
              onClick={() => handleEvaluatorClick(evaluator.name)}
              onKeyDown={(e) => e.key === 'Enter' && handleEvaluatorClick(evaluator.name)}
              tabIndex={0}
              role="button"
            >
              <span className="text-sm text-neutral-700 min-w-[150px] flex-shrink-0">
                {evaluator.name}
              </span>
              <div className="flex-1 h-2 bg-neutral-200 rounded overflow-hidden">
                <div
                  className="h-full bg-chilli-red rounded transition-all duration-300"
                  style={{ width: `${(evaluator.count / maxEvaluatorCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-neutral-600 min-w-[40px] text-right">
                {evaluator.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Upload Activity</h3>
        <div className="flex flex-col gap-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.assetId}
              className="flex items-center gap-4 p-3 bg-neutral-50 rounded-md border border-neutral-200 cursor-pointer transition-all hover:bg-neutral-100 hover:border-chilli-red"
              onClick={() => handleActivityClick(activity)}
              onKeyDown={(e) => e.key === 'Enter' && handleActivityClick(activity)}
              tabIndex={0}
              role="button"
            >
              <div className="text-2xl">📹</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-900 text-sm">
                  {truncate(activity.assetTitle, 40)}
                </div>
                <div className="flex gap-4 flex-wrap mt-1 text-xs text-neutral-600">
                  <span><strong>Site:</strong> {truncate(activity.siteName, 25)}</span>
                  <span><strong>Subject:</strong> {activity.subjectNumber}</span>
                  <span><strong>Uploaded by:</strong> {activity.uploadedBy}</span>
                </div>
              </div>
              <div className="text-xs text-neutral-500 whitespace-nowrap">
                {formatDate(activity.uploadDate)}
              </div>
              <div className="whitespace-nowrap">
                {activity.reviewed ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Reviewed
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Pending
                  </span>
                )}
              </div>
              {activity.assetLink && (
                <button
                  className="px-2 py-1 bg-chilli-red text-white text-sm rounded hover:bg-red-700 transition-colors flex-shrink-0"
                  onClick={(e) => handleViewAsset(e, activity)}
                  title="View Asset"
                >
                  ↗
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">🔗 EDC Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-md border border-neutral-200">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)] flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-neutral-900">Upload Service</div>
              <div className="text-xs text-neutral-600 mt-0.5">Active - Processing videos</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-md border border-neutral-200">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)] flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-neutral-900">De-identification Engine</div>
              <div className="text-xs text-neutral-600 mt-0.5">Operational - {processedCount} processed</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-md border border-neutral-200">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)] flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-neutral-900">Review Workflow</div>
              <div className="text-xs text-neutral-600 mt-0.5">Active - {reviewedCount} reviews completed</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-md border border-neutral-200">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)] flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-neutral-900">Data Export API</div>
              <div className="text-xs text-neutral-600 mt-0.5">Connected - Real-time sync</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
