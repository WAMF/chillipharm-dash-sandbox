<script lang="ts">
  import Chart from './Chart.svelte';
  import MetricCard from './MetricCard.svelte';
  import type { VideoMetricsData, AssetRecord } from '../types';
  import { assetModalStore } from '../stores/assetModalStore';

  export let videoMetrics: VideoMetricsData;
  export let records: AssetRecord[] = [];

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

  const durationBuckets: Record<string, { min: number; max: number }> = {
    '0-30s': { min: 0, max: 30 },
    '30s-1m': { min: 30, max: 60 },
    '1-2m': { min: 60, max: 120 },
    '2-5m': { min: 120, max: 300 },
    '5-10m': { min: 300, max: 600 },
    '10m+': { min: 600, max: Infinity }
  };

  const sizeBuckets: Record<string, { min: number; max: number }> = {
    '0-1MB': { min: 0, max: 1024 * 1024 },
    '1-5MB': { min: 1024 * 1024, max: 5 * 1024 * 1024 },
    '5-10MB': { min: 5 * 1024 * 1024, max: 10 * 1024 * 1024 },
    '10-50MB': { min: 10 * 1024 * 1024, max: 50 * 1024 * 1024 },
    '50-100MB': { min: 50 * 1024 * 1024, max: 100 * 1024 * 1024 },
    '100MB+': { min: 100 * 1024 * 1024, max: Infinity }
  };

  function handleDurationClick(range: string) {
    const bucket = durationBuckets[range];
    if (!bucket) return;

    const matchingAssets = records.filter(r => {
      const seconds = parseDurationToSeconds(r.assetDuration);
      return seconds >= bucket.min && seconds < bucket.max;
    });
    assetModalStore.openAssetList(`Videos: ${range} Duration`, matchingAssets);
  }

  function handleSizeClick(range: string) {
    const bucket = sizeBuckets[range];
    if (!bucket) return;

    const matchingAssets = records.filter(r => {
      const bytes = parseFileSizeToBytes(r.fileSize);
      return bytes >= bucket.min && bytes < bucket.max;
    });
    assetModalStore.openAssetList(`Videos: ${range} Size`, matchingAssets);
  }

  $: durationChartData = {
    labels: videoMetrics.durationDistribution.map(d => d.range),
    datasets: [{
      label: 'Videos',
      data: videoMetrics.durationDistribution.map(d => d.count),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(52, 211, 153, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(237, 118, 33, 0.8)',
        'rgba(200, 16, 46, 0.8)'
      ]
    }]
  };

  $: sizeChartData = {
    labels: videoMetrics.sizeDistribution.map(s => s.range),
    datasets: [{
      label: 'Videos',
      data: videoMetrics.sizeDistribution.map(s => s.count),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(52, 211, 153, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(237, 118, 33, 0.8)',
        'rgba(200, 16, 46, 0.8)'
      ]
    }]
  };

  $: totalVideos = videoMetrics.durationDistribution.reduce((sum, d) => sum + d.count, 0);
</script>

<div class="video-metrics">
  <div class="section-header">
    <h2>Video Metrics</h2>
    <p class="section-subtitle">Duration and storage analytics for video assets</p>
  </div>

  <div class="grid grid-cols-4">
    <MetricCard
      title="Total Duration"
      value={videoMetrics.totalDuration}
      subtitle="Combined video length"
      icon="⏱️"
    />
    <MetricCard
      title="Avg Duration"
      value={videoMetrics.avgDuration}
      subtitle="Per video asset"
      icon="📊"
    />
    <MetricCard
      title="Total Storage"
      value={videoMetrics.totalSize}
      subtitle="All video files"
      icon="💾"
    />
    <MetricCard
      title="Avg File Size"
      value={videoMetrics.avgSize}
      subtitle="Per video asset"
      icon="📁"
    />
  </div>

  <div class="grid grid-cols-2">
    <div class="card">
      <h3>Duration Distribution</h3>
      <p class="card-subtitle">Number of videos by duration range</p>
      <Chart type="bar" data={durationChartData} height="300px" options={{
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Videos' }
          },
          x: {
            title: { display: true, text: 'Duration Range' }
          }
        }
      }} />
      <div class="distribution-table">
        <table>
          <thead>
            <tr>
              <th>Duration</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {#each videoMetrics.durationDistribution as bucket}
              <tr
                class="clickable-row"
                on:click={() => handleDurationClick(bucket.range)}
                on:keydown={(e) => e.key === 'Enter' && handleDurationClick(bucket.range)}
                role="button"
                tabindex="0"
              >
                <td>{bucket.range}</td>
                <td>{bucket.count}</td>
                <td>{totalVideos > 0 ? ((bucket.count / totalVideos) * 100).toFixed(1) : 0}%</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <h3>File Size Distribution</h3>
      <p class="card-subtitle">Number of videos by file size range</p>
      <Chart type="bar" data={sizeChartData} height="300px" options={{
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Videos' }
          },
          x: {
            title: { display: true, text: 'Size Range' }
          }
        }
      }} />
      <div class="distribution-table">
        <table>
          <thead>
            <tr>
              <th>Size Range</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {#each videoMetrics.sizeDistribution as bucket}
              <tr
                class="clickable-row"
                on:click={() => handleSizeClick(bucket.range)}
                on:keydown={(e) => e.key === 'Enter' && handleSizeClick(bucket.range)}
                role="button"
                tabindex="0"
              >
                <td>{bucket.range}</td>
                <td>{bucket.count}</td>
                <td>{totalVideos > 0 ? ((bucket.count / totalVideos) * 100).toFixed(1) : 0}%</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="card insights-card">
    <h3>Storage Insights</h3>
    <div class="insights-grid">
      <div class="insight">
        <div class="insight-icon">📹</div>
        <div class="insight-content">
          <div class="insight-title">Video Count</div>
          <div class="insight-value">{totalVideos.toLocaleString()} videos</div>
        </div>
      </div>
      <div class="insight">
        <div class="insight-icon">⏰</div>
        <div class="insight-content">
          <div class="insight-title">Most Common Duration</div>
          <div class="insight-value">
            {#if videoMetrics.durationDistribution.length > 0}
              {videoMetrics.durationDistribution.reduce((max, d) => d.count > max.count ? d : max, videoMetrics.durationDistribution[0]).range}
            {:else}
              N/A
            {/if}
          </div>
        </div>
      </div>
      <div class="insight">
        <div class="insight-icon">📊</div>
        <div class="insight-content">
          <div class="insight-title">Most Common Size</div>
          <div class="insight-value">
            {#if videoMetrics.sizeDistribution.length > 0}
              {videoMetrics.sizeDistribution.reduce((max, s) => s.count > max.count ? s : max, videoMetrics.sizeDistribution[0]).range}
            {:else}
              N/A
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .video-metrics {
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

  .card {
    background: var(--white);
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
  }

  .card h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--neutral-800);
    margin-bottom: 0.5rem;
  }

  .card-subtitle {
    font-size: 0.75rem;
    color: var(--neutral-500);
    margin-bottom: 1rem;
  }

  .distribution-table {
    margin-top: 1.5rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }

  th, td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid var(--neutral-200);
  }

  th {
    font-weight: 600;
    color: var(--neutral-600);
    background: var(--neutral-50);
  }

  td {
    color: var(--neutral-700);
  }

  .clickable-row {
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .clickable-row:hover {
    background-color: var(--neutral-100);
  }

  .clickable-row:focus {
    outline: 2px solid var(--chilli-red);
    outline-offset: -2px;
  }

  .insights-card {
    margin-top: 0.5rem;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .insight {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--neutral-50);
    border-radius: 0.5rem;
  }

  .insight-icon {
    font-size: 2rem;
  }

  .insight-title {
    font-size: 0.75rem;
    color: var(--neutral-500);
    margin-bottom: 0.25rem;
  }

  .insight-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--neutral-800);
  }

  @media (max-width: 768px) {
    .insights-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
