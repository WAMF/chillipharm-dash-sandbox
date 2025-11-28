'use client';

import { IntegrationHealth } from '../../../components/IntegrationHealth';
import { FilterPanel } from '../../../components/FilterPanel';

export default function IntegrationPage() {
    return (
        <div className="space-y-6">
            <FilterPanel />
            <IntegrationHealth />
        </div>
    );
}
