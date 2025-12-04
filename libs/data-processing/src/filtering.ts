import type { FilterState, AssetRecord } from '@cp/types';

export function filterRecords(
    records: AssetRecord[],
    filters: FilterState
): AssetRecord[] {
    return records.filter(record => {
        if (
            filters.selectedTrials.length > 0 &&
            !filters.selectedTrials.includes(record.trialName)
        ) {
            return false;
        }

        if (
            filters.selectedSites.length > 0 &&
            !filters.selectedSites.includes(record.siteName)
        ) {
            return false;
        }

        if (
            filters.selectedCountries.length > 0 &&
            !filters.selectedCountries.includes(record.siteCountry)
        ) {
            return false;
        }

        if (filters.selectedStudyArms.length > 0) {
            const arm = record.studyArm?.trim() || 'Unassigned';
            if (!filters.selectedStudyArms.includes(arm)) {
                return false;
            }
        }

        if (filters.selectedProcedures.length > 0) {
            const procedure = record.studyProcedure?.trim() || 'Unknown';
            if (!filters.selectedProcedures.includes(procedure)) {
                return false;
            }
        }

        if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start);
            if (record.uploadDate < startDate) {
                return false;
            }
        }

        if (filters.dateRange.end) {
            const endDate = new Date(filters.dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (record.uploadDate > endDate) {
                return false;
            }
        }

        if (filters.processedStatus === 'yes' && record.processed !== 'Yes') {
            return false;
        }
        if (filters.processedStatus === 'no' && record.processed !== 'No') {
            return false;
        }

        if (filters.searchTerm.trim()) {
            const search = filters.searchTerm.toLowerCase();
            const searchFields = [
                record.assetTitle,
                record.siteName,
                record.subjectNumber,
                record.studyArm,
                record.studyEvent,
                record.studyProcedure,
                record.evaluator,
                record.uploadedBy,
                record.comments,
            ];
            const matches = searchFields.some(
                field => field && field.toLowerCase().includes(search)
            );
            if (!matches) {
                return false;
            }
        }

        return true;
    });
}

export function sortRecords(
    records: AssetRecord[],
    sortBy: keyof AssetRecord | '',
    sortOrder: 'asc' | 'desc'
): AssetRecord[] {
    if (!sortBy) return records;

    return [...records].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        let comparison = 0;

        if (aVal instanceof Date && bVal instanceof Date) {
            comparison = aVal.getTime() - bVal.getTime();
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
            comparison = aVal - bVal;
        } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
            comparison = (aVal ? 1 : 0) - (bVal ? 1 : 0);
        } else {
            comparison = String(aVal || '').localeCompare(String(bVal || ''));
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });
}

export function paginateArray<T>(
    items: T[],
    page: number,
    pageSize: number
): T[] {
    const startIndex = (page - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
}

export function getActiveFilterCount(filters: FilterState): number {
    let count = 0;

    if (filters.selectedTrials.length > 0) count++;
    if (filters.selectedSites.length > 0) count++;
    if (filters.selectedCountries.length > 0) count++;
    if (filters.selectedStudyArms.length > 0) count++;
    if (filters.selectedProcedures.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.processedStatus !== 'all') count++;
    if (filters.searchTerm.trim()) count++;

    return count;
}
