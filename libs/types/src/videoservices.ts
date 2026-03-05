export type TaskStatus = 'todo' | 'in_progress' | 'qa' | 'approved' | 'done';
export type FieldMappingMode = 'all' | 'none' | 'include' | 'exclude';

export interface FieldMapping {
    mode: FieldMappingMode;
    fields?: string[];
}

export interface WorkflowDestination {
    destination_id: string;
    workflow_id: string;
    site_id: string;
    site_name: string;
    is_primary: boolean;
    field_mapping: FieldMapping;
    display_order: number;
    created_at: string;
}

export interface Workflow {
    workflow_id: string;
    name: string;
    trial_id: string;
    trial_name: string;
    qa_destination?: WorkflowDestination;
    destinations: WorkflowDestination[];
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface TaskMember {
    task_member_id: string;
    task_id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    is_creator: boolean;
    added_by: string;
    created_at: string;
}

export interface TaskInput {
    task_input_id: string;
    task_id: string;
    asset_id: string;
    site_id: string;
    asset_name: string;
    duration?: string;
    file_size?: number;
    thumbnail_url?: string;
    sequence_order: number;
    created_at: string;
}

export interface VSTask {
    task_id: string;
    workflow_id: string;
    workflow_name: string;
    name: string;
    description?: string;
    reference_url?: string;
    status: TaskStatus;
    error_message?: string;
    members: TaskMember[];
    inputs: TaskInput[];
    source_site_id: string;
    source_site_name: string;
    assigned_to?: string;
    assigned_to_name?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    output_file_name?: string;
    output_file_size?: number;
    qa_submitted_at?: string;
    qa_submitted_by?: string;
    qa_approved_at?: string;
    qa_approved_by?: string;
    qa_rejected_at?: string;
    qa_rejected_by?: string;
    completed_at?: string;
    completed_by?: string;
    deleted_at?: string;
    deleted_by?: string;
}

export interface AssetCorrelation {
    correlation_id: string;
    task_id: string;
    job_id: string;
    source_asset_id: string;
    source_site_id: string;
    output_asset_id: string;
    output_site_id: string;
    fields_copied?: string[];
    processed_by: string;
    processed_at: string;
    created_at: string;
}

export interface StagedFile {
    file: File;
    name: string;
    size: number;
    type: string;
}

export interface DestinationOutput {
    site_id: string;
    site_name: string;
    asset_id?: string;
    fields_copied?: string[];
    status: 'pending' | 'uploading' | 'success' | 'failed';
    error?: string;
    progress?: number;
}

export interface CompletionResult {
    status: 'complete' | 'failed';
    job_id: string;
    completed_at?: string;
    error?: string;
    outputs: DestinationOutput[];
}

export interface CreateWorkflowRequest {
    name: string;
    trial_id: string;
    qa_destination?: CreateDestinationRequest;
    destinations: CreateDestinationRequest[];
}

export interface CreateDestinationRequest {
    site_id: string;
    is_primary?: boolean;
    field_mapping: FieldMapping;
    display_order?: number;
}

export interface UpdateWorkflowRequest {
    name?: string;
    qa_destination?: CreateDestinationRequest;
    destinations?: CreateDestinationRequest[];
}

export interface UpdateDestinationRequest {
    is_primary?: boolean;
    field_mapping?: FieldMapping;
    display_order?: number;
}

export interface CreateTaskRequest {
    workflow_id: string;
    name: string;
    description?: string;
    reference_url?: string;
    assigned_to?: string;
    source_site_id: string;
}

export interface UpdateTaskRequest {
    name?: string;
    description?: string;
    reference_url?: string;
    status?: TaskStatus;
    assigned_to?: string | null;
}

export interface WorkflowFilters {
    trial_id?: string;
}

export interface TaskFilters {
    workflow_id?: string;
    status?: TaskStatus;
    search?: string;
}

export interface CorrelationFilters {
    task_id?: string;
    job_id?: string;
    source_asset_id?: string;
    output_asset_id?: string;
}

export interface VSAsset {
    asset_id: string;
    site_id: string;
    name: string;
    file_type: string;
    file_size: number;
    duration?: string;
    thumbnail_url?: string;
    created_at: string;
    metadata?: Record<string, unknown>;
}

export type AssetSortField = 'name' | 'created_at' | 'file_size' | 'duration';
export type SortDirection = 'asc' | 'desc';

export interface AssetFilters {
    search?: string;
    file_type?: string;
    visit_type?: string;
    assessment?: string;
    subject_id?: string;
    visit_date_from?: string;
    visit_date_to?: string;
    sort_by?: AssetSortField;
    sort_dir?: SortDirection;
}

export interface QASubmissionResult {
    status: 'submitted' | 'failed';
    job_id: string;
    submitted_at?: string;
    error?: string;
    output: DestinationOutput;
}

export interface QAReviewResult {
    status: 'approved' | 'rejected';
    task: VSTask;
    outputs?: DestinationOutput[];
}
