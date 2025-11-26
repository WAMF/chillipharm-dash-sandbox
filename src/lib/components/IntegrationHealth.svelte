<script lang="ts">
  import Chart from './Chart.svelte';
  import WorldMap from './WorldMap.svelte';
  import type { AssetRecord } from '../types';

  export let records: AssetRecord[];
  export let evaluatorStats: Array<{ name: string; count: number }>;
  export let countryDistribution: Array<{ country: string; count: number }>;

  $: recentActivity = records
    .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
    .slice(0, 10);

  $: evaluatorChartData = {
    labels: evaluatorStats.map(e => e.name.substring(0, 20)),
    datasets: [{
      label: 'Assets Evaluated',
      data: evaluatorStats.map(e => e.count),
      backgroundColor: [
        'rgba(200, 16, 46, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(237, 118, 33, 0.8)',
        'rgba(118, 15, 108, 0.8)',
        'rgba(175, 26, 98, 0.8)',
        'rgba(155, 10, 33, 0.8)',
        'rgba(200, 16, 46, 0.6)',
        'rgba(237, 118, 33, 0.6)',
        'rgba(118, 15, 108, 0.6)',
        'rgba(175, 26, 98, 0.6)',
      ]
    }]
  };

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
</script>

<div class="integration-health">
  <div class="section-header">
    <h2>Integration Health & Activity</h2>
    <p class="section-subtitle">System usage, evaluator activity, and geographic distribution</p>
  </div>

  <div class="card">
    <h3>Geographic Distribution</h3>
    <WorldMap countryData={countryDistribution} />
  </div>

  <div class="card">
    <h3>Top Evaluators</h3>
    <Chart type="bar" data={evaluatorChartData} options={{
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      }
    }} height="300px" />
  </div>

  <div class="card">
    <h3>Recent Upload Activity</h3>
    <div class="activity-list">
      {#each recentActivity as activity}
        <div class="activity-item">
          <div class="activity-icon">📹</div>
          <div class="activity-content">
            <div class="activity-title">
              {truncate(activity.assetTitle, 40)}
            </div>
            <div class="activity-meta">
              <span class="meta-item">
                <strong>Site:</strong> {truncate(activity.siteName, 25)}
              </span>
              <span class="meta-item">
                <strong>Subject:</strong> {activity.subjectNumber}
              </span>
              <span class="meta-item">
                <strong>Uploaded by:</strong> {activity.uploadedBy}
              </span>
            </div>
          </div>
          <div class="activity-time">
            {formatDate(activity.uploadDate)}
          </div>
          <div class="activity-status">
            {#if activity.reviewed}
              <span class="badge badge-success">Reviewed</span>
            {:else}
              <span class="badge badge-warning">Pending</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="card system-status">
    <h3>🔗 EDC Integration Status</h3>
    <div class="status-grid">
      <div class="status-item">
        <div class="status-indicator active"></div>
        <div class="status-details">
          <div class="status-name">Upload Service</div>
          <div class="status-description">Active - Processing videos</div>
        </div>
      </div>
      <div class="status-item">
        <div class="status-indicator active"></div>
        <div class="status-details">
          <div class="status-name">De-identification Engine</div>
          <div class="status-description">Operational - {records.filter(r => r.processed === 'Yes').length} processed</div>
        </div>
      </div>
      <div class="status-item">
        <div class="status-indicator active"></div>
        <div class="status-details">
          <div class="status-name">Review Workflow</div>
          <div class="status-description">Active - {records.filter(r => r.reviewed).length} reviews completed</div>
        </div>
      </div>
      <div class="status-item">
        <div class="status-indicator active"></div>
        <div class="status-details">
          <div class="status-name">Data Export API</div>
          <div class="status-description">Connected - Real-time sync</div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .integration-health {
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

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background-color: var(--neutral-50);
    border-radius: 0.375rem;
    border: 1px solid var(--neutral-200);
  }

  .activity-icon {
    font-size: 1.5rem;
  }

  .activity-content {
    flex: 1;
    min-width: 0;
  }

  .activity-title {
    font-weight: 500;
    color: var(--neutral-900);
    font-size: 0.875rem;
  }

  .activity-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--neutral-600);
  }

  .meta-item {
    white-space: nowrap;
  }

  .activity-time {
    font-size: 0.75rem;
    color: var(--neutral-500);
    white-space: nowrap;
  }

  .activity-status {
    white-space: nowrap;
  }

  .system-status h3 {
    margin-bottom: 1rem;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--neutral-50);
    border-radius: 0.375rem;
    border: 1px solid var(--neutral-200);
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-indicator.active {
    background-color: var(--success-green);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  }

  .status-indicator.warning {
    background-color: var(--warning-orange);
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
  }

  .status-indicator.error {
    background-color: var(--danger-red);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  }

  .status-details {
    flex: 1;
  }

  .status-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--neutral-900);
  }

  .status-description {
    font-size: 0.75rem;
    color: var(--neutral-600);
    margin-top: 0.125rem;
  }

  @media (max-width: 768px) {
    .status-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
