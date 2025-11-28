'use client';

import { FilterPanel } from '../../../components/FilterPanel';
import { VideoMetrics } from '../../../components/VideoMetrics';

export default function VideoMetricsPage() {
  return (
    <div className="space-y-6">
      <FilterPanel />
      <VideoMetrics />
    </div>
  );
}
