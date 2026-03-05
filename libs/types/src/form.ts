export interface FormRecord {
    formId: string;
    formName: string;
    formStatus: string;
    submittedAt: string | null;
    siteName: string;
    siteId: number;
    siteCountry: string;
    subjectNumber: string;
    studyArm: string;
    eventName: string;
    procedureName: string;
    procedureDate: string | null;
}

export interface FormQueryFilter {
    sites?: number[];
    formStatus?: string;
    dateRange?: {
        start?: string;
        end?: string;
    };
    page?: number;
    limit?: number;
}
