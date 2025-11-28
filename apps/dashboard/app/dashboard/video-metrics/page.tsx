'use client';

import { VideoMetrics } from '../../../components/VideoMetrics';
import { FilterPanel } from '../../../components/FilterPanel';

export default function VideoMetricsPage() {
    return (
        <div className="space-y-6">
            <FilterPanel />
            <VideoMetrics />
        </div>
    );
}
