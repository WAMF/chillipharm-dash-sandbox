<script lang="ts">
  import Chart from './Chart.svelte';
  import type { StudyArmData, StudyEventData, StudyProcedureData, ProcedureLagData, CommentStats } from '../types';

  export let studyArms: StudyArmData[];
  export let studyEvents: StudyEventData[];
  export let studyProcedures: StudyProcedureData[];
  export let procedureLag: ProcedureLagData[];
  export let commentStats: CommentStats;

  $: armChartData = {
    labels: studyArms.map(a => a.arm),
    datasets: [{
      data: studyArms.map(a => a.count),
      backgroundColor: [
        'rgba(200, 16, 46, 0.8)',
        'rgba(237, 118, 33, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ]
    }]
  };

  $: eventChartData = {
    labels: studyEvents.slice(0, 10).map(e => e.event),
    datasets: [
      {
        label: 'Total Assets',
        data: studyEvents.slice(0, 10).map(e => e.count),
        backgroundColor: 'rgba(200, 16, 46, 0.8)'
      },
      {
        label: 'Reviewed',
        data: studyEvents.slice(0, 10).map(e => e.reviewedCount),
        backgroundColor: 'rgba(16, 185, 129, 0.8)'
      }
    ]
  };

  $: procedureChartData = {
    labels: studyProcedures.slice(0, 8).map(p => p.procedure),
    datasets: [{
      label: 'Asset Count',
      data: studyProcedures.slice(0, 8).map(p => p.count),
      backgroundColor: 'rgba(59, 130, 246, 0.8)'
    }]
  };

  $: lagChartData = {
    labels: procedureLag.map(p => p.procedure),
    datasets: [{
      label: 'Avg Days to Upload',
      data: procedureLag.map(p => p.avgLagDays),
      backgroundColor: procedureLag.map(p =>
        p.avgLagDays <= 1 ? 'rgba(16, 185, 129, 0.8)' :
        p.avgLagDays <= 7 ? 'rgba(237, 118, 33, 0.8)' :
        'rgba(200, 16, 46, 0.8)'
      )
    }]
  };
</script>

<div class="study-analytics">
  <div class="section-header">
    <h2>Study Analytics</h2>
    <p class="section-subtitle">Treatment arms, study events, and procedure analysis</p>
  </div>

  <div class="grid grid-cols-2">
    <div class="card">
      <h3>Treatment Arm Distribution</h3>
      <Chart type="doughnut" data={armChartData} height="300px" options={{
        plugins: {
          legend: { position: 'bottom' }
        }
      }} />
      <div class="arm-legend">
        {#each studyArms as arm}
          <div class="legend-item">
            <span class="arm-name">{arm.arm}</span>
            <span class="arm-stats">{arm.count} ({arm.percentage.toFixed(1)}%)</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="card">
      <h3>Assets by Study Event</h3>
      <Chart type="bar" data={eventChartData} height="300px" options={{
        indexAxis: 'y',
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }} />
    </div>
  </div>

  <div class="grid grid-cols-2">
    <div class="card">
      <h3>Procedure Breakdown</h3>
      <Chart type="bar" data={procedureChartData} height="280px" options={{
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }} />
      <div class="procedure-table">
        <table>
          <thead>
            <tr>
              <th>Procedure</th>
              <th>Assets</th>
              <th>Sites</th>
              <th>Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {#each studyProcedures.slice(0, 6) as proc}
              <tr>
                <td>{proc.procedure}</td>
                <td>{proc.count}</td>
                <td>{proc.sites}</td>
                <td>{proc.avgDuration}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <h3>Upload Lag Analysis</h3>
      <p class="card-subtitle">Days between procedure date and video upload</p>
      <Chart type="bar" data={lagChartData} height="250px" options={{
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Days' }
          }
        }
      }} />
      <div class="lag-legend">
        <span class="lag-good">Same day</span>
        <span class="lag-warning">1-7 days</span>
        <span class="lag-bad">7+ days</span>
      </div>
    </div>
  </div>

  <div class="card comments-section">
    <h3>Comments Analysis</h3>
    <div class="comments-grid">
      <div class="comment-stat">
        <div class="stat-value">{commentStats.totalWithComments}</div>
        <div class="stat-label">Assets with Comments</div>
      </div>
      <div class="comment-stat">
        <div class="stat-value">{commentStats.commentRate.toFixed(1)}%</div>
        <div class="stat-label">Comment Rate</div>
      </div>
      <div class="comment-stat">
        <div class="stat-value">{Math.round(commentStats.avgCommentLength)}</div>
        <div class="stat-label">Avg Comment Length</div>
      </div>
      <div class="top-commenters">
        <h4>Top Commenters</h4>
        {#each commentStats.topCommenters.slice(0, 5) as commenter}
          <div class="commenter-row">
            <span class="commenter-name">{commenter.name}</span>
            <span class="commenter-count">{commenter.commentCount}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .study-analytics {
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
    margin-bottom: 1rem;
  }

  .card-subtitle {
    font-size: 0.75rem;
    color: var(--neutral-500);
    margin-top: -0.5rem;
    margin-bottom: 1rem;
  }

  .arm-legend {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .legend-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .arm-name {
    color: var(--neutral-700);
  }

  .arm-stats {
    color: var(--neutral-500);
    font-weight: 500;
  }

  .procedure-table {
    margin-top: 1rem;
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

  .lag-legend {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
    font-size: 0.75rem;
  }

  .lag-good::before,
  .lag-warning::before,
  .lag-bad::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 2px;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  .lag-good::before {
    background: rgba(16, 185, 129, 0.8);
  }

  .lag-warning::before {
    background: rgba(237, 118, 33, 0.8);
  }

  .lag-bad::before {
    background: rgba(200, 16, 46, 0.8);
  }

  .comments-section {
    margin-top: 0.5rem;
  }

  .comments-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr) 2fr;
    gap: 1.5rem;
    align-items: start;
  }

  .comment-stat {
    text-align: center;
    padding: 1rem;
    background: var(--neutral-50);
    border-radius: 0.5rem;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--chilli-red);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--neutral-500);
    margin-top: 0.25rem;
  }

  .top-commenters h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--neutral-700);
  }

  .commenter-row {
    display: flex;
    justify-content: space-between;
    padding: 0.375rem 0;
    border-bottom: 1px solid var(--neutral-100);
    font-size: 0.8rem;
  }

  .commenter-name {
    color: var(--neutral-700);
  }

  .commenter-count {
    color: var(--neutral-500);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .comments-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .top-commenters {
      grid-column: 1 / -1;
    }
  }
</style>
