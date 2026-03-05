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

export interface TimeSeriesData {
    date: string;
    uploads: number;
    tasksCompleted: number;
    processed: number;
}
