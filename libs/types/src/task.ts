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

export interface Task {
    id: string;
    name: string;
    completed: boolean;
    completedDate: string | null;
    completedById: number | null;
}

export interface TaskSummary {
    items: Task[];
    total: number;
    completed: number;
    completionRate: number;
}

export type FlaggedTaskStatus = 'open' | 'resolved';
export type FlaggedTaskPriority = 'high' | 'medium' | 'low';

export interface FlaggedTask {
    id: string;
    name: string;
    status: FlaggedTaskStatus;
    priority: FlaggedTaskPriority;
    createdAt: string | null;
    resolvedAt: string | null;
}

export interface FlaggedTaskSummary {
    items: FlaggedTask[];
    total: number;
    open: number;
    resolved: number;
}

export type FormStatus = 'complete' | 'pending' | 'not_started';

export interface Form {
    id: string;
    name: string;
    status: FormStatus;
    submittedAt: string | null;
}

export interface FormSummary {
    items: Form[];
    total: number;
    complete: number;
    pending: number;
}

export interface StudyArm {
    id: number;
    name: string;
    identifier: string;
    createdAt: string;
    stats: {
        subjectCount: number;
    };
}

export interface EventDefinition {
    id: number;
    name: string;
    identifier: string;
    createdAt: string;
    stats: {
        eventCount: number;
    };
}

export interface ProcedureDefinition {
    id: number;
    name: string;
    identifier: string;
    createdAt: string;
    stats: {
        procedureCount: number;
    };
}

export interface TaskDefinition {
    id: number;
    name: string;
    identifier: string;
    required: boolean;
    createdAt: string;
}

export interface ProcedureDetail {
    id: number;
    identifier: string;
    name: string;
    date: string;
    status: number;
    locked: boolean;
    definition: {
        id: number;
        name: string;
    } | null;
    evaluator: {
        id: number;
        name: string;
        email: string;
    } | null;
    context: {
        site: string;
        subject: string;
        event: string;
    };
    tasks: TaskSummary;
    flaggedTasks: FlaggedTaskSummary;
    forms: FormSummary;
    stats: {
        assetCount: number;
    };
    createdAt: string;
    updatedAt: string;
}
