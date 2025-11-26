<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
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
  export let clickable: boolean = false;

  const dispatch = createEventDispatcher<{ barClick: { label: string; index: number; value: number } }>();

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

  function handleCanvasClick(event: MouseEvent) {
    if (!clickable || !chart) return;

    const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
    if (elements.length > 0) {
      const element = elements[0];
      const label = chart.data.labels?.[element.index] as string;
      const value = chart.data.datasets[element.datasetIndex].data[element.index] as number;
      dispatch('barClick', { label, index: element.index, value });
    }
  }

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

<div class="chart-container" class:clickable style="height: {height}">
  <canvas bind:this={canvas} on:click={handleCanvasClick}></canvas>
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
  }

  .chart-container.clickable canvas {
    cursor: pointer;
  }
</style>
