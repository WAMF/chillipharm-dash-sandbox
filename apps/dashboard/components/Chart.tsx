'use client';

import { useRef, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
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
  PieController,
  ChartData,
  ChartOptions,
  ChartType
} from 'chart.js';

ChartJS.register(
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

ChartJS.defaults.animation = false;

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  data: ChartData<ChartType>;
  options?: ChartOptions;
  height?: string;
  clickable?: boolean;
  onBarClick?: (data: { label: string; index: number; value: number }) => void;
}

export function Chart({
  type,
  data,
  options = {},
  height = '300px',
  clickable = false,
  onBarClick
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const defaultOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    }
  };

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    if (!clickable || !chartRef.current || !onBarClick) return;

    const elements = chartRef.current.getElementsAtEventForMode(
      event,
      'nearest',
      { intersect: true },
      false
    );

    if (elements.length > 0) {
      const element = elements[0];
      const label = chartRef.current.data.labels?.[element.index] as string;
      const value = chartRef.current.data.datasets[element.datasetIndex].data[element.index] as number;
      onBarClick({ label, index: element.index, value });
    }
  }, [clickable, onBarClick]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new ChartJS(ctx, {
      type,
      data,
      options: { ...defaultOptions, ...options }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type]);

  useEffect(() => {
    if (chartRef.current && data) {
      chartRef.current.data = data;
      chartRef.current.update('none');
    }
  }, [data]);

  useEffect(() => {
    if (chartRef.current && options) {
      chartRef.current.options = { ...defaultOptions, ...options };
      chartRef.current.update('none');
    }
  }, [options]);

  return (
    <div
      className={`relative w-full ${clickable ? 'cursor-pointer' : ''}`}
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        onClick={(e) => handleCanvasClick(e.nativeEvent)}
      />
    </div>
  );
}
