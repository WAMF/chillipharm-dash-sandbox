<script lang="ts">
  import Chart from './Chart.svelte';
  import type { ComplianceMetric } from '../types';

  export let complianceData: ComplianceMetric[];

  $: chartData = {
    labels: complianceData.map(c => c.category),
    datasets: [
      {
        label: 'Compliant',
        data: complianceData.map(c => c.compliant),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Non-Compliant',
        data: complianceData.map(c => c.nonCompliant),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
      {
        label: 'Unknown',
        data: complianceData.map(c => c.unknown),
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
      }
    ]
  };

  $: chartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Compliance Status by Category'
      },
      legend: {
        display: true,
        position: 'bottom' as const
      }
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true
      }
    }
  };

  function getComplianceColor(rate: number): string {
    if (rate >= 90) return 'var(--success-green)';
    if (rate >= 70) return 'var(--warning-orange)';
    return 'var(--danger-red)';
  }

  function getComplianceBadge(rate: number): string {
    if (rate >= 90) return 'badge-success';
    if (rate >= 70) return 'badge-warning';
    return 'badge-danger';
  }

  function getComplianceLabel(rate: number): string {
    if (rate >= 90) return 'Excellent';
    if (rate >= 70) return 'Good';
    return 'Needs Attention';
  }
</script>

<div class="compliance-monitoring">
  <div class="section-header">
    <h2>Compliance Monitoring</h2>
    <p class="section-subtitle">Regulatory compliance and data quality metrics</p>
  </div>

  <div class="grid grid-cols-3">
    {#each complianceData as metric}
      <div class="card compliance-card">
        <div class="compliance-header">
          <h3>{metric.category}</h3>
          <span class="badge {getComplianceBadge(metric.complianceRate)}">
            {getComplianceLabel(metric.complianceRate)}
          </span>
        </div>
        <div class="compliance-score" style="color: {getComplianceColor(metric.complianceRate)}">
          {metric.complianceRate.toFixed(1)}%
        </div>
        <div class="compliance-details">
          <div class="detail-row">
            <span class="detail-label">Compliant:</span>
            <span class="detail-value compliant">{metric.compliant}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Non-Compliant:</span>
            <span class="detail-value non-compliant">{metric.nonCompliant}</span>
          </div>
          {#if metric.unknown > 0}
            <div class="detail-row">
              <span class="detail-label">Unknown:</span>
              <span class="detail-value unknown">{metric.unknown}</span>
            </div>
          {/if}
        </div>
        <div class="compliance-bar">
          <div
            class="compliance-bar-fill"
            style="width: {metric.complianceRate}%; background-color: {getComplianceColor(metric.complianceRate)}"
          ></div>
        </div>
      </div>
    {/each}
  </div>

  <div class="card">
    <Chart type="bar" data={chartData} options={chartOptions} height="350px" />
  </div>

  <div class="card info-card">
    <h3>Compliance Overview</h3>
    <div class="info-content">
      <p>
        ChilliPharm ensures regulatory compliance through automated checks and comprehensive monitoring:
      </p>
      <ul>
        <li><strong>Asset Review:</strong> Systematic review process ensuring data quality and protocol adherence</li>
        <li><strong>Processing Status:</strong> Tracking of de-identification and processing workflows</li>
      </ul>
      <p class="info-note">
        <strong>Note:</strong> High compliance rates indicate robust data governance and quality control processes.
      </p>
    </div>
  </div>
</div>

<style>
  .compliance-monitoring {
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

  .compliance-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .compliance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .compliance-header h3 {
    font-size: 1rem;
    margin: 0;
  }

  .compliance-score {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
  }

  .compliance-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .detail-label {
    color: var(--neutral-600);
  }

  .detail-value {
    font-weight: 600;
  }

  .detail-value.compliant {
    color: var(--success-green);
  }

  .detail-value.non-compliant {
    color: var(--danger-red);
  }

  .detail-value.unknown {
    color: var(--neutral-400);
  }

  .compliance-bar {
    height: 8px;
    background-color: var(--neutral-200);
    border-radius: 4px;
    overflow: hidden;
  }

  .compliance-bar-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .info-card {
    background: linear-gradient(135deg, var(--neutral-50) 0%, var(--white) 100%);
  }

  .info-card h3 {
    margin-bottom: 1rem;
  }

  .info-content {
    color: var(--neutral-700);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .info-content ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .info-content li {
    margin-bottom: 0.5rem;
  }

  .info-note {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: var(--neutral-100);
    border-radius: 0.375rem;
    border-left: 3px solid var(--primary-blue);
  }
</style>
