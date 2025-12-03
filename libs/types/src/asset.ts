export interface AssetRecord {
    trialName: string;
    trialId: number;
    siteName: string;
    siteId: number;
    siteCountry: string;
    subjectNumber: string;
    studyArm: string;
    studyEvent: string;
    studyProcedure: string;
    studyProcedureDate: string;
    evaluator: string;
    assetId: number;
    assetTitle: string;
    uploadDate: Date;
    uploadedBy: string;
    processed: string;
    assetDuration: string;
    reviewed: boolean;
    comments: string;
    reviewedBy: string;
    reviewedDate: string;
    fileSize: string;
    assetLink: string;
    libraryId?: number;
    libraryName?: string;
}
