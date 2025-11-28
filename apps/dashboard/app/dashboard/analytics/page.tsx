'use client';

import { StudyAnalytics } from '../../../components/StudyAnalytics';
import { FilterPanel } from '../../../components/FilterPanel';

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <FilterPanel />
            <StudyAnalytics />
        </div>
    );
}
