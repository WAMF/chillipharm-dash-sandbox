export interface Library {
    id: number;
    name: string;
    trialId: number;
    trialName: string;
    assetCount: number;
    createdAt: string;
    updatedAt?: string;
}

export interface LibraryMetrics {
    totalLibraries: number;
    totalAssets: number;
    assetsPerLibrary: number;
}
