import { format, parseISO, startOfMonth } from 'date-fns';
import type {
    AssetRecord,
    DashboardMetrics,
    TimeSeriesData,
} from '@cp/types';

export function calculateDashboardMetrics(
    records: AssetRecord[]
): DashboardMetrics {
    const totalAssets = records.length;
    const uniqueSites = new Set(records.map(r => r.siteName).filter(Boolean))
        .size;
    const uniqueSubjects = new Set(
        records.map(r => r.subjectNumber).filter(Boolean)
    ).size;
    const uniqueTrials = new Set(records.map(r => r.trialName).filter(Boolean))
        .size;
    const processedCount = records.filter(r => r.processed === 'Yes').length;

    const processingRate =
        totalAssets > 0 ? (processedCount / totalAssets) * 100 : 0;
    const complianceRate = calculateComplianceRate(records);

    return {
        totalAssets,
        totalSites: uniqueSites,
        totalSubjects: uniqueSubjects,
        totalTrials: uniqueTrials,
        processedCount,
        completedTasksCount: 0,
        totalTasksCount: 0,
        processingRate,
        taskCompletionRate: 0,
        complianceRate,
    };
}

function calculateComplianceRate(records: AssetRecord[]): number {
    if (records.length === 0) return 0;
    const processed = records.filter(
        r => r.processed === 'Yes'
    ).length;
    return (processed / records.length) * 100;
}

export function calculateTimeSeriesData(
    records: AssetRecord[]
): TimeSeriesData[] {
    const monthMap = new Map<
        string,
        { uploads: number; tasksCompleted: number; processed: number }
    >();

    records.forEach(record => {
        const monthKey = format(startOfMonth(record.uploadDate), 'yyyy-MM');
        const data = monthMap.get(monthKey) || {
            uploads: 0,
            tasksCompleted: 0,
            processed: 0,
        };

        data.uploads++;
        if (record.processed === 'Yes') data.processed++;

        monthMap.set(monthKey, data);
    });

    return Array.from(monthMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, data]) => ({
            date: format(parseISO(date + '-01'), 'MMM yyyy'),
            ...data,
        }))
        .slice(-12);
}

export function getCountryDistribution(records: AssetRecord[]) {
    const countryMap = new Map<string, number>();

    records.forEach(record => {
        if (record.siteCountry && record.siteCountry.trim()) {
            countryMap.set(
                record.siteCountry,
                (countryMap.get(record.siteCountry) || 0) + 1
            );
        }
    });

    return Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);
}

export function parseDurationToSeconds(duration: string): number {
    if (!duration || typeof duration !== 'string') return 0;
    const parts = duration.split(':');
    if (parts.length === 3) {
        return (
            parseInt(parts[0]) * 3600 +
            parseInt(parts[1]) * 60 +
            parseInt(parts[2])
        );
    } else if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return parseInt(duration) || 0;
}

export function formatDurationFromSeconds(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function parseFileSizeToBytes(size: string): number {
    if (!size || typeof size !== 'string') return 0;
    const match = size.match(/^([\d.]+)\s*(KB|MB|GB|B)?$/i);
    if (!match) return parseFloat(size) || 0;
    const value = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();
    const multipliers: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
    };
    return value * (multipliers[unit] || 1);
}

export function formatFileSizeFromBytes(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
}

export function getUniqueValues(
    records: AssetRecord[],
    field: keyof AssetRecord
): string[] {
    const values = new Set<string>();

    records.forEach(record => {
        const value = record[field];
        if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if (trimmed) values.add(trimmed);
            } else if (
                typeof value === 'number' ||
                typeof value === 'boolean'
            ) {
                values.add(String(value));
            }
        }
    });

    return Array.from(values).sort();
}

export function getFilterOptions(records: AssetRecord[]) {
    return {
        trials: getUniqueValues(records, 'trialName'),
        sites: getUniqueValues(records, 'siteName'),
        countries: getUniqueValues(records, 'siteCountry'),
        studyArms: [
            ...getUniqueValues(records, 'studyArm'),
            'Unassigned',
        ].filter((v, i, a) => a.indexOf(v) === i),
        procedures: [
            ...getUniqueValues(records, 'studyProcedure'),
            'Unknown',
        ].filter((v, i, a) => a.indexOf(v) === i),
        evaluators: getUniqueValues(records, 'evaluator'),
        uploaders: getUniqueValues(records, 'uploadedBy'),
    };
}
