<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    LineController,
    BarController,
    DoughnutController,
    PieController
  } from 'chart.js';

  Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    LineController,
    BarController,
    DoughnutController,
    PieController
  );

  Chart.defaults.animation = false;

  export let type: 'line' | 'bar' | 'doughnut' | 'pie';
  export let data: any;
  export let options: any = {};
  export let height: string = '300px';

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    }
  };

  onMount(() => {
    if (canvas) {
      chart = new Chart(canvas, {
        type,
        data,
        options: { ...defaultOptions, ...options }
      });
    }
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });

  $: if (chart && data) {
    chart.data = data;
    chart.update('none');
  }
</script>

<div class="chart-container" style="height: {height}">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
  }
</style>
