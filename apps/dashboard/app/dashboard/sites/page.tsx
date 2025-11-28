'use client';

import { FilterPanel } from '../../../components/FilterPanel';
import { SitePerformance } from '../../../components/SitePerformance';

export default function SitesPage() {
  return (
    <div className="space-y-6">
      <FilterPanel />
      <SitePerformance />
    </div>
  );
}
