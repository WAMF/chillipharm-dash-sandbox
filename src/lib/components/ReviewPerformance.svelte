<script lang="ts">
  import Chart from './Chart.svelte';
  import MetricCard from './MetricCard.svelte';
  import type { ReviewPerformanceData } from '../types';

  export let reviewData: ReviewPerformanceData;

  $: turnaroundChartData = {
    labels: reviewData.turnaroundDistribution.map(t => t.range),
    datasets: [{
      label: 'Reviews',
      data: reviewData.turnaroundDistribution.map(t => t.count),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(52, 211, 153, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(237, 118, 33, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(200, 16, 46, 0.8)'
      ]
    }]
  };

  $: reviewerChartData = {
    labels: reviewData.reviewerStats.map(r => r.reviewer),
    datasets: [{
      label: 'Reviews Completed',
      data: reviewData.reviewerStats.map(r => r.reviewCount),
      backgroundColor: 'rgba(200, 16, 46, 0.8)'
    }]
  };

  $: trendChartData = {
    labels: reviewData.reviewTrend.map(t => t.date),
    datasets: [
      {
        label: 'Avg Turnaround (days)',
        data: reviewData.reviewTrend.map(t => t.avgTurnaroundDays),
        borderColor: 'rgb(200, 16, 46)',
        backgroundColor: 'rgba(200, 16, 46, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Review Count',
        data: reviewData.reviewTrend.map(t => t.reviewCount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  $: totalReviewed = reviewData.turnaroundDistribution.reduce((sum, t) => sum + t.count, 0);
  $: sameDayRate = totalReviewed > 0
    ? (reviewData.turnaroundDistribution.find(t => t.range === 'Same day')?.count || 0) / totalReviewed * 100
    : 0;
</script>

<div class="review-performance">
  <div class="section-header">
    <h2>Review Performance</h2>
    <p class="section-subtitle">Turnaround times, reviewer workload, and review trends</p>
  </div>

  <div class="grid grid-cols-4">
    <MetricCard
      title="Avg Turnaround"
      value="{reviewData.avgTurnaroundDays.toFixed(1)} days"
      subtitle="Upload to review"
      icon="⏱️"
    />
    <MetricCard
      title="Same Day Reviews"
      value="{sameDayRate.toFixed(1)}%"
      subtitle="Reviewed within 24h"
      icon="⚡"
    />
    <MetricCard
      title="Total Reviewed"
      value={totalReviewed.toLocaleString()}
      subtitle="Completed reviews"
      icon="✓"
    />
    <MetricCard
      title="Active Reviewers"
      value={reviewData.reviewerStats.length.toString()}
      subtitle="Team members"
      icon="👥"
    />
  </div>

  <div class="grid grid-cols-2">
    <div class="card">
      <h3>Turnaround Distribution</h3>
      <p class="card-subtitle">Time from upload to review completion</p>
      <Chart type="doughnut" data={turnaroundChartData} height="280px" options={{
        plugins: {
          legend: { position: 'right' }
        }
      }} />
      <div class="distribution-summary">
        {#each reviewData.turnaroundDistribution as bucket}
          <div class="summary-row">
            <span class="range-label">{bucket.range}</span>
            <div class="bar-container">
              <div
                class="bar"
                style="width: {totalReviewed > 0 ? (bucket.count / totalReviewed) * 100 : 0}%"
              ></div>
            </div>
            <span class="count-label">{bucket.count}</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="card">
      <h3>Top Reviewers</h3>
      <p class="card-subtitle">Review volume by team member</p>
      <Chart type="bar" data={reviewerChartData} height="280px" options={{
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Reviews Completed' }
          }
        }
      }} />
    </div>
  </div>

  <div class="card trend-card">
    <h3>Review Trend Over Time</h3>
    <p class="card-subtitle">Monthly turnaround time and review volume</p>
    <Chart type="line" data={trendChartData} height="300px" options={{
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Avg Days' },
          beginAtZero: true
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Review Count' },
          beginAtZero: true,
          grid: { drawOnChartArea: false }
        }
      }
    }} />
  </div>

  <div class="card reviewer-details">
    <h3>Reviewer Performance Details</h3>
    <table>
      <thead>
        <tr>
          <th>Reviewer</th>
          <th>Reviews</th>
          <th>Avg Turnaround</th>
          <th>Performance</th>
        </tr>
      </thead>
      <tbody>
        {#each reviewData.reviewerStats as reviewer}
          <tr>
            <td class="reviewer-name">{reviewer.reviewer}</td>
            <td>{reviewer.reviewCount}</td>
            <td>{reviewer.avgTurnaroundDays.toFixed(1)} days</td>
            <td>
              <span class="performance-badge" class:fast={reviewer.avgTurnaroundDays < 1} class:medium={reviewer.avgTurnaroundDays >= 1 && reviewer.avgTurnaroundDays < 7} class:slow={reviewer.avgTurnaroundDays >= 7}>
                {#if reviewer.avgTurnaroundDays < 1}
                  Excellent
                {:else if reviewer.avgTurnaroundDays < 7}
                  Good
                {:else}
                  Needs Attention
                {/if}
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .review-performance {
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

  .distribution-summary {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-row {
    display: grid;
    grid-template-columns: 100px 1fr 50px;
    align-items: center;
    gap: 0.75rem;
  }

  .range-label {
    font-size: 0.75rem;
    color: var(--neutral-600);
  }

  .bar-container {
    height: 8px;
    background: var(--neutral-100);
    border-radius: 4px;
    overflow: hidden;
  }

  .bar {
    height: 100%;
    background: var(--chilli-red);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .count-label {
    font-size: 0.75rem;
    color: var(--neutral-500);
    text-align: right;
  }

  .trend-card {
    margin-top: 0.5rem;
  }

  .reviewer-details table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  .reviewer-details th,
  .reviewer-details td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--neutral-200);
  }

  .reviewer-details th {
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--neutral-600);
    background: var(--neutral-50);
  }

  .reviewer-details td {
    font-size: 0.875rem;
    color: var(--neutral-700);
  }

  .reviewer-name {
    font-weight: 500;
  }

  .performance-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .performance-badge.fast {
    background: rgba(16, 185, 129, 0.1);
    color: rgb(16, 185, 129);
  }

  .performance-badge.medium {
    background: rgba(59, 130, 246, 0.1);
    color: rgb(59, 130, 246);
  }

  .performance-badge.slow {
    background: rgba(200, 16, 46, 0.1);
    color: rgb(200, 16, 46);
  }

  @media (max-width: 768px) {
    .reviewer-details {
      overflow-x: auto;
    }

    .reviewer-details table {
      min-width: 500px;
    }
  }
</style>
