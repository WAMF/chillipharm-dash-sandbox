import type {
    CompletionResult,
    CreateTaskRequest,
    QAReviewResult,
    QASubmissionResult,
    TaskFilters,
    TaskInput,
    TaskMember,
    UpdateTaskRequest,
    VSTask,
} from '@cp/types';

import { BaseApi } from './base';

export interface TaskListResponse {
    tasks: VSTask[];
    total: number;
}

export class TasksApi extends BaseApi {
    async list(filters?: TaskFilters): Promise<TaskListResponse> {
        return this.client.get<TaskListResponse, TaskFilters>(
            '/api/v1/tasks',
            filters
        );
    }

    async getById(id: string): Promise<VSTask> {
        return this.client.get<VSTask>(`/api/v1/tasks/${id}`);
    }

    async create(data: CreateTaskRequest): Promise<VSTask> {
        return this.client.post<VSTask>('/api/v1/tasks', data);
    }

    async update(id: string, data: UpdateTaskRequest): Promise<VSTask> {
        return this.client.put<VSTask>(`/api/v1/tasks/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        return this.client.delete(`/api/v1/tasks/${id}`);
    }

    async addInputs(taskId: string, assetIds: string[]): Promise<TaskInput[]> {
        return this.client.post<TaskInput[]>(`/api/v1/tasks/${taskId}/inputs`, {
            asset_ids: assetIds,
        });
    }

    async addInputsFromFiles(
        taskId: string,
        files: Array<{ name: string; size: number }>
    ): Promise<TaskInput[]> {
        const response = await this.client.post<{ inputs: TaskInput[] }>(
            `/api/v1/tasks/${taskId}/inputs/files`,
            { files }
        );
        return response.inputs;
    }

    async removeInput(taskId: string, inputId: string): Promise<void> {
        return this.client.delete(
            `/api/v1/tasks/${taskId}/inputs/${inputId}`
        );
    }

    async reorderInputs(
        taskId: string,
        inputIds: string[]
    ): Promise<TaskInput[]> {
        return this.client.put<TaskInput[]>(
            `/api/v1/tasks/${taskId}/inputs/reorder`,
            { input_ids: inputIds }
        );
    }

    async listMembers(taskId: string): Promise<TaskMember[]> {
        return this.client.get<TaskMember[]>(`/api/v1/tasks/${taskId}/members`);
    }

    async addMember(taskId: string, userId: string): Promise<TaskMember> {
        return this.client.post<TaskMember>(
            `/api/v1/tasks/${taskId}/members`,
            { user_id: userId }
        );
    }

    async removeMember(taskId: string, userId: string): Promise<void> {
        return this.client.delete(
            `/api/v1/tasks/${taskId}/members/${userId}`
        );
    }

    async complete(taskId: string): Promise<CompletionResult> {
        return this.client.post<CompletionResult>(
            `/api/v1/tasks/${taskId}/complete`
        );
    }

    async submitToQA(taskId: string, file: File): Promise<QASubmissionResult> {
        const formData = new FormData();
        formData.append('file', file);

        return this.client.requestFormData<QASubmissionResult>(
            `/api/v1/tasks/${taskId}/submit-qa`,
            formData
        );
    }

    async approveQA(taskId: string): Promise<QAReviewResult> {
        return this.client.post<QAReviewResult>(
            `/api/v1/tasks/${taskId}/qa/approve`
        );
    }

    async rejectQA(taskId: string): Promise<QAReviewResult> {
        return this.client.post<QAReviewResult>(
            `/api/v1/tasks/${taskId}/qa/reject`
        );
    }
}
