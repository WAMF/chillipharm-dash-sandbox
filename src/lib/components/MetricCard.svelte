<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let subtitle: string = '';
  export let trend: number | null = null;
  export let icon: string = '';
</script>

<div class="metric-card card">
  <div class="metric-header">
    <h3 class="metric-title">{title}</h3>
    {#if icon}
      <span class="metric-icon">{icon}</span>
    {/if}
  </div>
  <div class="metric-value">{value}</div>
  {#if subtitle}
    <div class="metric-subtitle">{subtitle}</div>
  {/if}
  {#if trend !== null}
    <div class="metric-trend" class:positive={trend > 0} class:negative={trend < 0}>
      {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
    </div>
  {/if}
</div>

<style>
  .metric-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .metric-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--neutral-600);
    margin: 0;
  }

  .metric-icon {
    font-size: 1.5rem;
    opacity: 0.5;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--chilli-red);
    line-height: 1;
  }

  .metric-subtitle {
    font-size: 0.75rem;
    color: var(--neutral-500);
  }

  .metric-trend {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .metric-trend.positive {
    color: var(--success-green);
  }

  .metric-trend.negative {
    color: var(--danger-red);
  }
</style>
