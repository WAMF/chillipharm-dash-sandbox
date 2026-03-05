export interface ReportTaskStatus {
    name: string;
    completedDate: string | null;
}

export interface StudyProcedureRow {
    trialName: string;
    siteName: string;
    siteNumber: string;
    siteCountry: string;
    trialConfigName: string;
    subjectNumber: string;
    studyEventName: string;
    studyEventArm: string;
    studyEventStatus: string;
    studyEventDate: string;
    studyProcedureName: string;
    studyProcedureDate: string;
    studyProcedureStatus: string;
    clinicalEvaluator: string;
    tasks: ReportTaskStatus[];
    assetLinks: string[];
    studyProcedureLink: string;
    studyProcedureUpdates: string;
}

export interface FormRow {
    trialName: string;
    siteName: string;
    siteNumber: string;
    siteCountry: string;
    subjectNumber: string;
    studyEventName: string;
    studyEventArm: string;
    studyEventStatus: string;
    studyEventDate: string;
    studyProcedureName: string;
    studyProcedureDate: string;
    studyProcedureStatus: string;
    clinicalEvaluator: string;
    formName: string;
    formStatus: string;
    submittedAt: string | null;
    formLink: string;
}

export interface FlaggedTaskRow {
    trialName: string;
    siteName: string;
    siteNumber: string;
    siteCountry: string;
    subjectNumber: string;
    studyEventName: string;
    studyEventArm: string;
    studyEventStatus: string;
    studyEventDate: string;
    studyProcedureName: string;
    studyProcedureDate: string;
    studyProcedureStatus: string;
    clinicalEvaluator: string;
    actionRequiredReason: string;
    actionRequiredCreationDate: string;
    actionRequiredCreator: string;
    flagStatus: string;
    priority: string;
    actionRequiredLink: string;
}

export interface SubjectRow {
    trialName: string;
    siteName: string;
    siteNumber: string;
    siteCountry: string;
    subjectNumber: string;
    subjectStatus: string;
    subjectStatusReason: string;
}

export interface AssetReportRow {
    trialName: string;
    trialId: number;
    siteName: string;
    siteId: number;
    siteNumber: string;
    siteCountry: string;
    subjectNumber: string;
    studyArm: string;
    studyEvent: string;
    studyProcedure: string;
    studyProcedureDate: string;
    evaluator: string;
    assetId: number;
    assetTitle: string;
    uploadDate: string;
    uploadedBy: string;
    processed: string;
    assetDuration: string;
    fileSize: string;
    assetLink: string;
    containsPii: string;
    piiProcessed: string;
    tasks: ReportTaskStatus[];
}
