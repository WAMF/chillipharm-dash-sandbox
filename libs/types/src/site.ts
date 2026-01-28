export interface SiteReportRecord {
    siteId: number;
    siteName: string;
    country: string;
    subjectCount: number;
    assetCount: number;
    totalForms: number;
    completeForms: number;
    formCompletionRate: number;
    totalTasks: number;
    completedTasks: number;
    taskCompletionRate: number;
    openFlags: number;
    resolvedFlags: number;
}
