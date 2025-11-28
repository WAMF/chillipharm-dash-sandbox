export interface DashboardMetrics {
    totalAssets: number;
    totalSites: number;
    totalSubjects: number;
    totalTrials: number;
    processedCount: number;
    reviewedCount: number;
    processingRate: number;
    reviewRate: number;
    complianceRate: number;
}

export interface SitePerformance {
    siteName: string;
    totalAssets: number;
    reviewedAssets: number;
    processedAssets: number;
    reviewRate: number;
    uploadTrend: number;
}

export interface TimeSeriesData {
    date: string;
    uploads: number;
    reviews: number;
    processed: number;
}

export interface ComplianceMetric {
    category: string;
    compliant: number;
    nonCompliant: number;
    unknown: number;
    complianceRate: number;
}

export interface StudyArmData {
    arm: string;
    count: number;
    percentage: number;
}

export interface StudyEventData {
    event: string;
    count: number;
    reviewedCount: number;
    reviewRate: number;
}

export interface StudyProcedureData {
    procedure: string;
    count: number;
    sites: number;
    avgDuration: string;
}

export interface VideoMetricsData {
    totalDuration: string;
    avgDuration: string;
    totalSize: string;
    avgSize: string;
    durationDistribution: DurationBucket[];
    sizeDistribution: SizeBucket[];
}

export interface DurationBucket {
    range: string;
    count: number;
}

export interface SizeBucket {
    range: string;
    count: number;
    totalSize: number;
}

export interface ReviewPerformanceData {
    avgTurnaroundDays: number;
    reviewerStats: ReviewerStat[];
    turnaroundDistribution: TurnaroundBucket[];
    reviewTrend: ReviewTrendData[];
}

export interface ReviewerStat {
    reviewer: string;
    reviewCount: number;
    avgTurnaroundDays: number;
}

export interface TurnaroundBucket {
    range: string;
    count: number;
}

export interface ReviewTrendData {
    date: string;
    avgTurnaroundDays: number;
    reviewCount: number;
}

export interface ProcedureLagData {
    procedure: string;
    avgLagDays: number;
    count: number;
}

export interface CommentStats {
    totalWithComments: number;
    commentRate: number;
    avgCommentLength: number;
    topCommenters: CommenterStat[];
}

export interface CommenterStat {
    name: string;
    commentCount: number;
}
