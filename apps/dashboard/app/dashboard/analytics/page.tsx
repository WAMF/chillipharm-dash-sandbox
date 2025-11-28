'use client';

import { FilterPanel } from '../../../components/FilterPanel';
import { StudyAnalytics } from '../../../components/StudyAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <FilterPanel />
      <StudyAnalytics />
    </div>
  );
}
