'use client';

import { FilterPanel } from '../../../components/FilterPanel';
import { ReviewPerformance } from '../../../components/ReviewPerformance';

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <FilterPanel />
      <ReviewPerformance />
    </div>
  );
}
