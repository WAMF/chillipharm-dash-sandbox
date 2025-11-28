'use client';

import { useMemo } from 'react';
import { MetricCard } from './MetricCard';
import { Chart } from './Chart';
import { useDashboard } from '../contexts/DashboardContext';

export function ExecutiveOverview() {
  const { metrics, timeSeriesData, isLoading } = useDashboard();

  const chartData = useMemo(() => ({
    labels: timeSeriesData.map(d => d.date),
    datasets: [
      {
        label: 'Uploads',
        data: timeSeriesData.map(d => d.uploads),
        borderColor: 'rgb(200, 16, 46)',
        backgroundColor: 'rgba(200, 16, 46, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Reviews',
        data: timeSeriesData.map(d => d.reviews),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Processed',
        data: timeSeriesData.map(d => d.processed),
        borderColor: 'rgb(237, 118, 33)',
        backgroundColor: 'rgba(237, 118, 33, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }), [timeSeriesData]);

  const chartOptions = useMemo(() => ({
    plugins: {
      title: {
        display: true,
        text: 'Asset Activity Over Time'
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
    }
  }), []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-5">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-neutral-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-neutral-500">No data available. Apply filters or check your connection.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-neutral-800 mb-1">Executive Overview</h2>
        <p className="text-neutral-500 text-sm">Key performance indicators and trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Video Assets"
          value={metrics.totalAssets.toLocaleString()}
          subtitle="Across all sites"
          icon="📹"
        />
        <MetricCard
          title="Active Sites"
          value={metrics.totalSites}
          subtitle="Clinical trial locations"
          icon="🏥"
        />
        <MetricCard
          title="Total Subjects"
          value={metrics.totalSubjects}
          subtitle="Enrolled participants"
          icon="👥"
        />
        <MetricCard
          title="Processing Rate"
          value={`${metrics.processingRate.toFixed(1)}%`}
          subtitle={`${metrics.processedCount} of ${metrics.totalAssets} processed`}
          icon="⚡"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Review Completion"
          value={`${metrics.reviewRate.toFixed(1)}%`}
          subtitle={`${metrics.reviewedCount} assets reviewed`}
          icon="✓"
        />
        <MetricCard
          title="Compliance Score"
          value={`${metrics.complianceRate.toFixed(1)}%`}
          subtitle="Overall compliance rating"
          icon="🛡️"
        />
        <MetricCard
          title="Active Trials"
          value={metrics.totalTrials}
          subtitle="Clinical trials with data"
          icon="🔬"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <Chart
          type="line"
          data={chartData}
          options={chartOptions}
          height="350px"
        />
      </div>
    </div>
  );
}
