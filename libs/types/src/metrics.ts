export interface DashboardMetrics {
    totalAssets: number;
    totalSites: number;
    totalSubjects: number;
    totalTrials: number;
    processedCount: number;
    completedTasksCount: number;
    totalTasksCount: number;
    processingRate: number;
    taskCompletionRate: number;
    complianceRate: number;
}

export interface SitePerformance {
    siteName: string;
    totalAssets: number;
    completedTasks: number;
    totalTasks: number;
    processedAssets: number;
    taskCompletionRate: number;
    uploadTrend: number;
}

export interface TimeSeriesData {
    date: string;
    uploads: number;
    tasksCompleted: number;
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
    completedTasksCount: number;
    taskCompletionRate: number;
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

export interface TaskPerformanceData {
    avgCompletionDays: number;
    completedByStats: TaskCompletedByStat[];
    completionDistribution: CompletionBucket[];
    taskTrend: TaskTrendData[];
}

export interface TaskCompletedByStat {
    completedBy: string;
    taskCount: number;
    avgCompletionDays: number;
}

export interface CompletionBucket {
    range: string;
    count: number;
}

export interface TaskTrendData {
    date: string;
    avgCompletionDays: number;
    taskCount: number;
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
