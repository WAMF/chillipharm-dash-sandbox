import type {
    CreateDestinationRequest,
    CreateWorkflowRequest,
    UpdateDestinationRequest,
    UpdateWorkflowRequest,
    Workflow,
    WorkflowDestination,
    WorkflowFilters,
} from '@cp/types';

import { BaseApi } from './base';

export interface WorkflowListResponse {
    workflows: Workflow[];
    total: number;
}

export class WorkflowsApi extends BaseApi {
    async list(filters?: WorkflowFilters): Promise<WorkflowListResponse> {
        return this.client.get<WorkflowListResponse, WorkflowFilters>(
            '/api/v1/workflows',
            filters
        );
    }

    async getById(id: string): Promise<Workflow> {
        return this.client.get<Workflow>(`/api/v1/workflows/${id}`);
    }

    async create(data: CreateWorkflowRequest): Promise<Workflow> {
        return this.client.post<Workflow>('/api/v1/workflows', data);
    }

    async update(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
        return this.client.put<Workflow>(`/api/v1/workflows/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        return this.client.delete(`/api/v1/workflows/${id}`);
    }

    async addDestination(
        workflowId: string,
        data: CreateDestinationRequest
    ): Promise<WorkflowDestination> {
        return this.client.post<WorkflowDestination>(
            `/api/v1/workflows/${workflowId}/destinations`,
            data
        );
    }

    async updateDestination(
        workflowId: string,
        destinationId: string,
        data: UpdateDestinationRequest
    ): Promise<WorkflowDestination> {
        return this.client.put<WorkflowDestination>(
            `/api/v1/workflows/${workflowId}/destinations/${destinationId}`,
            data
        );
    }

    async removeDestination(
        workflowId: string,
        destinationId: string
    ): Promise<void> {
        return this.client.delete(
            `/api/v1/workflows/${workflowId}/destinations/${destinationId}`
        );
    }
}
