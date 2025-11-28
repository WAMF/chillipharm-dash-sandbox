'use client';

import { ReviewPerformance } from '../../../components/ReviewPerformance';
import { FilterPanel } from '../../../components/FilterPanel';

export default function ReviewsPage() {
    return (
        <div className="space-y-6">
            <FilterPanel />
            <ReviewPerformance />
        </div>
    );
}
