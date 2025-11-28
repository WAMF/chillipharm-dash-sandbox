'use client';

import { FilterPanel } from '../../../components/FilterPanel';
import { ComplianceMonitoring } from '../../../components/ComplianceMonitoring';

export default function CompliancePage() {
    return (
        <div className="space-y-6">
            <FilterPanel />
            <ComplianceMonitoring />
        </div>
    );
}
