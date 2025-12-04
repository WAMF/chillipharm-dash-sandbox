import { format, parseISO, startOfMonth, subMonths } from 'date-fns';
import type {
    AssetRecord,
    DashboardMetrics,
    SitePerformance,
    TimeSeriesData,
    ComplianceMetric,
    StudyArmData,
    StudyEventData,
    StudyProcedureData,
    VideoMetricsData,
    ProcedureLagData,
    CommentStats,
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

const UNKNOWN_SITE = 'Unknown';

export function calculateSitePerformance(
    records: AssetRecord[]
): SitePerformance[] {
    const siteMap = new Map<string, AssetRecord[]>();

    records.forEach(record => {
        const siteName = record.siteName?.trim() || UNKNOWN_SITE;
        const assets = siteMap.get(siteName) || [];
        assets.push(record);
        siteMap.set(siteName, assets);
    });

    return Array.from(siteMap.entries())
        .map(([siteName, assets]) => {
            const processedAssets = assets.filter(
                a => a.processed === 'Yes'
            ).length;
            return {
                siteName,
                totalAssets: assets.length,
                completedTasks: 0,
                totalTasks: 0,
                processedAssets,
                taskCompletionRate: 0,
                uploadTrend: calculateUploadTrend(assets),
            };
        })
        .sort((a, b) => b.totalAssets - a.totalAssets)
        .slice(0, 15);
}

function calculateUploadTrend(assets: AssetRecord[]): number {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const recentUploads = assets.filter(a => a.uploadDate >= lastMonth).length;
    const olderUploads = assets.filter(a => a.uploadDate < lastMonth).length;

    if (olderUploads === 0) return 100;
    return ((recentUploads - olderUploads) / olderUploads) * 100;
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

export function calculateComplianceMetrics(
    records: AssetRecord[]
): ComplianceMetric[] {
    const totalRecords = records.length;
    if (totalRecords === 0) return [];

    return [
        {
            category: 'Processing Status',
            compliant: records.filter(r => r.processed === 'Yes').length,
            nonCompliant: records.filter(r => r.processed === 'No').length,
            unknown: 0,
            complianceRate:
                (records.filter(r => r.processed === 'Yes').length /
                    totalRecords) *
                100,
        },
    ];
}

export function getEvaluatorStats(records: AssetRecord[]) {
    const evaluatorMap = new Map<string, number>();

    records.forEach(record => {
        if (record.evaluator && record.evaluator.trim()) {
            evaluatorMap.set(
                record.evaluator,
                (evaluatorMap.get(record.evaluator) || 0) + 1
            );
        }
    });

    return Array.from(evaluatorMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
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

export function getStudyArmDistribution(
    records: AssetRecord[]
): StudyArmData[] {
    const armMap = new Map<string, number>();
    const total = records.length;

    records.forEach(record => {
        const arm = record.studyArm?.trim() || 'Unassigned';
        armMap.set(arm, (armMap.get(arm) || 0) + 1);
    });

    return Array.from(armMap.entries())
        .map(([arm, count]) => ({
            arm,
            count,
            percentage: (count / total) * 100,
        }))
        .sort((a, b) => b.count - a.count);
}

export function getStudyEventBreakdown(
    records: AssetRecord[]
): StudyEventData[] {
    const eventMap = new Map<string, number>();

    records.forEach(record => {
        const event = record.studyEvent?.trim() || 'Unknown';
        eventMap.set(event, (eventMap.get(event) || 0) + 1);
    });

    return Array.from(eventMap.entries())
        .map(([event, count]) => ({
            event,
            count,
            completedTasksCount: 0,
            taskCompletionRate: 0,
        }))
        .sort((a, b) => b.count - a.count);
}

export function getStudyProcedureBreakdown(
    records: AssetRecord[]
): StudyProcedureData[] {
    const procedureMap = new Map<
        string,
        { count: number; sites: Set<string>; durations: number[] }
    >();

    records.forEach(record => {
        const procedure = record.studyProcedure?.trim() || 'Unknown';
        const current = procedureMap.get(procedure) || {
            count: 0,
            sites: new Set<string>(),
            durations: [],
        };
        current.count++;
        if (record.siteName) current.sites.add(record.siteName);
        const durationSeconds = parseDurationToSeconds(record.assetDuration);
        if (durationSeconds > 0) current.durations.push(durationSeconds);
        procedureMap.set(procedure, current);
    });

    return Array.from(procedureMap.entries())
        .map(([procedure, data]) => ({
            procedure,
            count: data.count,
            sites: data.sites.size,
            avgDuration:
                data.durations.length > 0
                    ? formatDurationFromSeconds(
                          data.durations.reduce((a, b) => a + b, 0) /
                              data.durations.length
                      )
                    : 'N/A',
        }))
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

export function getVideoMetrics(records: AssetRecord[]): VideoMetricsData {
    const durations = records
        .map(r => parseDurationToSeconds(r.assetDuration))
        .filter(d => d > 0);
    const sizes = records
        .map(r => parseFileSizeToBytes(r.fileSize))
        .filter(s => s > 0);

    const totalDurationSecs = durations.reduce((a, b) => a + b, 0);
    const avgDurationSecs =
        durations.length > 0 ? totalDurationSecs / durations.length : 0;
    const totalSizeBytes = sizes.reduce((a, b) => a + b, 0);
    const avgSizeBytes = sizes.length > 0 ? totalSizeBytes / sizes.length : 0;

    const durationBuckets = [
        { range: '0-30s', min: 0, max: 30 },
        { range: '30s-1m', min: 30, max: 60 },
        { range: '1-2m', min: 60, max: 120 },
        { range: '2-5m', min: 120, max: 300 },
        { range: '5-10m', min: 300, max: 600 },
        { range: '10m+', min: 600, max: Infinity },
    ];

    const durationDistribution = durationBuckets.map(bucket => ({
        range: bucket.range,
        count: durations.filter(d => d >= bucket.min && d < bucket.max).length,
    }));

    const sizeBuckets = [
        { range: '0-1MB', min: 0, max: 1024 * 1024 },
        { range: '1-5MB', min: 1024 * 1024, max: 5 * 1024 * 1024 },
        { range: '5-10MB', min: 5 * 1024 * 1024, max: 10 * 1024 * 1024 },
        { range: '10-50MB', min: 10 * 1024 * 1024, max: 50 * 1024 * 1024 },
        { range: '50-100MB', min: 50 * 1024 * 1024, max: 100 * 1024 * 1024 },
        { range: '100MB+', min: 100 * 1024 * 1024, max: Infinity },
    ];

    const sizeDistribution = sizeBuckets.map(bucket => {
        const matchingSizes = sizes.filter(
            s => s >= bucket.min && s < bucket.max
        );
        return {
            range: bucket.range,
            count: matchingSizes.length,
            totalSize: matchingSizes.reduce((a, b) => a + b, 0),
        };
    });

    return {
        totalDuration: formatDurationFromSeconds(totalDurationSecs),
        avgDuration: formatDurationFromSeconds(avgDurationSecs),
        totalSize: formatFileSizeFromBytes(totalSizeBytes),
        avgSize: formatFileSizeFromBytes(avgSizeBytes),
        durationDistribution,
        sizeDistribution,
    };
}

function parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
        return parseISO(dateStr.replace(' UTC', ''));
    } catch {
        return null;
    }
}

export function getProcedureLagAnalysis(
    records: AssetRecord[]
): ProcedureLagData[] {
    const procedureMap = new Map<string, number[]>();

    records.forEach(record => {
        if (record.studyProcedureDate && record.uploadDate) {
            const procedureDate = parseDateString(record.studyProcedureDate);
            if (procedureDate) {
                const lagDays =
                    (record.uploadDate.getTime() - procedureDate.getTime()) /
                    (1000 * 60 * 60 * 24);
                const procedure = record.studyProcedure?.trim() || 'Unknown';
                const lags = procedureMap.get(procedure) || [];
                lags.push(lagDays);
                procedureMap.set(procedure, lags);
            }
        }
    });

    return Array.from(procedureMap.entries())
        .map(([procedure, lags]) => ({
            procedure,
            avgLagDays: lags.reduce((a, b) => a + b, 0) / lags.length,
            count: lags.length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}

export function getCommentStats(records: AssetRecord[]): CommentStats {
    const withComments = records.filter(
        r => r.comments && r.comments.trim().length > 0
    );
    const commenterMap = new Map<string, number>();

    withComments.forEach(record => {
        const commenter = record.uploadedBy?.trim() || 'Unknown';
        commenterMap.set(commenter, (commenterMap.get(commenter) || 0) + 1);
    });

    const totalCommentLength = withComments.reduce(
        (sum, r) => sum + r.comments.length,
        0
    );

    return {
        totalWithComments: withComments.length,
        commentRate:
            records.length > 0
                ? (withComments.length / records.length) * 100
                : 0,
        avgCommentLength:
            withComments.length > 0
                ? totalCommentLength / withComments.length
                : 0,
        topCommenters: Array.from(commenterMap.entries())
            .map(([name, commentCount]) => ({ name, commentCount }))
            .sort((a, b) => b.commentCount - a.commentCount)
            .slice(0, 10),
    };
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
