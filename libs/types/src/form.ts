export type FormStatus = 'complete' | 'pending' | 'not_started';

export interface FormRecord {
    formId: string;
    formName: string;
    formStatus: FormStatus;
    submittedAt: string | null;
    siteName: string;
    siteId: number;
    siteCountry: string;
    subjectNumber: string;
    studyArm: string;
    eventName: string;
    procedureName: string;
    procedureDate: string;
}

export interface FormQueryFilter {
    sites?: string[];
    procedures?: string[];
    formStatus?: 'all' | FormStatus;
    dateRange?: {
        start?: string;
        end?: string;
    };
    page?: number;
    limit?: number;
}

export interface FormStats {
    total: number;
    complete: number;
    pending: number;
    notStarted: number;
    completionRate: number;
    byProcedureType: Array<{
        procedure: string;
        total: number;
        complete: number;
    }>;
    bySite: Array<{
        siteId: number;
        siteName: string;
        total: number;
        complete: number;
    }>;
}
