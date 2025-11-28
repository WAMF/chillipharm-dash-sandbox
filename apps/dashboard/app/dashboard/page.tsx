'use client';

import { FilterPanel } from '../../components/FilterPanel';
import { ExecutiveOverview } from '../../components/ExecutiveOverview';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <FilterPanel />
      <ExecutiveOverview />
    </div>
  );
}
