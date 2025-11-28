'use client';

import { FilterPanel } from '../../../components/FilterPanel';
import { IntegrationHealth } from '../../../components/IntegrationHealth';

export default function IntegrationPage() {
  return (
    <div className="space-y-6">
      <FilterPanel />
      <IntegrationHealth />
    </div>
  );
}
