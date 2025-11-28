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
