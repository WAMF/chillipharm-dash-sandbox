<script lang="ts">
  import Chart from './Chart.svelte';
  import type { SitePerformance } from '../types';

  export let siteData: SitePerformance[];

  $: topSites = siteData.slice(0, 10);

  $: chartData = {
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
  };

  $: chartOptions = {
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
  };

  function getTrendColor(trend: number): string {
    if (trend > 10) return 'var(--success-green)';
    if (trend < -10) return 'var(--danger-red)';
    return 'var(--neutral-500)';
  }

  function getTrendIcon(trend: number): string {
    if (trend > 0) return '↑';
    if (trend < 0) return '↓';
    return '→';
  }
</script>

<div class="site-performance">
  <div class="section-header">
    <h2>Site Performance Analytics</h2>
    <p class="section-subtitle">Clinical site activity and review metrics</p>
  </div>

  <div class="grid grid-cols-2">
    <div class="card">
      <Chart type="bar" data={chartData} options={chartOptions} height="450px" />
    </div>

    <div class="card">
      <h3>Site Performance Table</h3>
      <div class="table-container">
        <table class="performance-table">
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Assets</th>
              <th>Review Rate</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {#each topSites as site, index}
              <tr>
                <td class="site-name">
                  <span class="rank">{index + 1}</span>
                  {site.siteName}
                </td>
                <td class="assets-count">{site.totalAssets}</td>
                <td>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: {site.reviewRate}%"></div>
                    <span class="progress-text">{site.reviewRate.toFixed(0)}%</span>
                  </div>
                </td>
                <td class="trend-cell">
                  <span
                    class="trend-indicator"
                    style="color: {getTrendColor(site.uploadTrend)}"
                  >
                    {getTrendIcon(site.uploadTrend)} {Math.abs(site.uploadTrend).toFixed(0)}%
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<style>
  .site-performance {
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

  .table-container {
    overflow-x: auto;
    margin-top: 1rem;
  }

  .performance-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .performance-table th {
    text-align: left;
    padding: 0.75rem 0.5rem;
    border-bottom: 2px solid var(--neutral-200);
    font-weight: 600;
    color: var(--neutral-700);
    background-color: var(--neutral-50);
  }

  .performance-table td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--neutral-200);
  }

  .performance-table tbody tr:hover {
    background-color: var(--neutral-50);
  }

  .site-name {
    font-weight: 500;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank {
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: var(--chilli-red);
    color: white;
    border-radius: 50%;
    text-align: center;
    line-height: 24px;
    font-size: 0.75rem;
    margin-right: 0.5rem;
    font-weight: 600;
  }

  .assets-count {
    font-weight: 600;
    color: var(--chilli-red);
  }

  .progress-bar {
    position: relative;
    height: 24px;
    background-color: var(--neutral-100);
    border-radius: 4px;
    overflow: hidden;
    min-width: 100px;
  }

  .progress-fill {
    position: absolute;
    height: 100%;
    background: linear-gradient(90deg, var(--chilli-red), var(--chilli-fuschia));
    transition: width 0.3s ease;
  }

  .progress-text {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--neutral-700);
    z-index: 1;
  }

  .trend-cell {
    text-align: center;
  }

  .trend-indicator {
    font-weight: 600;
    font-size: 0.875rem;
  }
</style>
