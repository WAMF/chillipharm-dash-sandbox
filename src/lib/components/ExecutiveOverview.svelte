<script lang="ts">
  import MetricCard from './MetricCard.svelte';
  import Chart from './Chart.svelte';
  import type { DashboardMetrics, TimeSeriesData } from '../types';

  export let metrics: DashboardMetrics;
  export let timeSeriesData: TimeSeriesData[];

  $: chartData = {
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
  };

  $: chartOptions = {
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
  };
</script>

<div class="executive-overview">
  <div class="section-header">
    <h2>Executive Overview</h2>
    <p class="section-subtitle">Key performance indicators and trends</p>
  </div>

  <div class="grid grid-cols-4">
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
      value="{metrics.processingRate.toFixed(1)}%"
      subtitle="{metrics.processedCount} of {metrics.totalAssets} processed"
      icon="⚡"
    />
  </div>

  <div class="grid grid-cols-3">
    <MetricCard
      title="Review Completion"
      value="{metrics.reviewRate.toFixed(1)}%"
      subtitle="{metrics.reviewedCount} assets reviewed"
      icon="✓"
    />
    <MetricCard
      title="Compliance Score"
      value="{metrics.complianceRate.toFixed(1)}%"
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

  <div class="card chart-card">
    <Chart type="line" data={chartData} options={chartOptions} height="350px" />
  </div>
</div>

<style>
  .executive-overview {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section-header {
    margin-bottom: 0.5rem;
  }

  .section-header h2 {
    margin-bottom: 0.25rem;
  }

  .section-subtitle {
    color: var(--neutral-500);
    font-size: 0.875rem;
  }

  .chart-card {
    padding: 1.5rem;
  }
</style>
