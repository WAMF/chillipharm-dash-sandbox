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
