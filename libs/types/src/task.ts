export interface TaskStats {
    total: number;
    completed: number;
    completionRate: number;
}

export interface ProcedureTask {
    id: string;
    studyProcedureTaskDefinitionId: number;
    createdAt: string;
    completedDate: string | null;
    completedById: number | null;
}
