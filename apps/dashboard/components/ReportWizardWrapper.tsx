'use client';

import { useDashboard } from '../contexts/DashboardContext';
import { ReportWizard } from './ReportWizard';

export function ReportWizardWrapper() {
  const {
    showReportWizard,
    setShowReportWizard,
    filteredRecords,
    filterOptions
  } = useDashboard();

  if (!showReportWizard) return null;

  return (
    <ReportWizard
      records={filteredRecords}
      sites={filterOptions.sites}
      trials={filterOptions.trials}
      countries={filterOptions.countries}
      onClose={() => setShowReportWizard(false)}
    />
  );
}
