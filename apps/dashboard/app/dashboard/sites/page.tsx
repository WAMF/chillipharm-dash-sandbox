'use client';

import { SitePerformance } from '../../../components/SitePerformance';
import { FilterPanel } from '../../../components/FilterPanel';

export default function SitesPage() {
    return (
        <div className="space-y-6">
            <FilterPanel />
            <SitePerformance />
        </div>
    );
}
