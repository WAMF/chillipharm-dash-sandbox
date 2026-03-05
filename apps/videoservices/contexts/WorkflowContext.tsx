'use client';

import {
    createContext,
    useContext,
    useReducer,
    useCallback,
    ReactNode,
} from 'react';
import type {
    Workflow,
    WorkflowFilters,
    CreateWorkflowRequest,
    UpdateWorkflowRequest,
} from '@cp/types';
import { useApiClient } from '../hooks/useApiClient';

interface WorkflowState {
    workflows: Workflow[];
    selectedWorkflow: Workflow | null;
    isLoading: boolean;
    error: string | null;
    filters: WorkflowFilters;
}

type WorkflowAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_WORKFLOWS'; payload: Workflow[] }
    | { type: 'SET_SELECTED_WORKFLOW'; payload: Workflow | null }
    | { type: 'ADD_WORKFLOW'; payload: Workflow }
    | { type: 'UPDATE_WORKFLOW'; payload: Workflow }
    | { type: 'REMOVE_WORKFLOW'; payload: string }
    | { type: 'SET_FILTERS'; payload: WorkflowFilters };

const initialState: WorkflowState = {
    workflows: [],
    selectedWorkflow: null,
    isLoading: false,
    error: null,
    filters: {},
};

function workflowReducer(
    state: WorkflowState,
    action: WorkflowAction
): WorkflowState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_WORKFLOWS':
            return { ...state, workflows: action.payload };
        case 'SET_SELECTED_WORKFLOW':
            return { ...state, selectedWorkflow: action.payload };
        case 'ADD_WORKFLOW':
            return { ...state, workflows: [...state.workflows, action.payload] };
        case 'UPDATE_WORKFLOW':
            return {
                ...state,
                workflows: state.workflows.map(w =>
                    w.workflow_id === action.payload.workflow_id
                        ? action.payload
                        : w
                ),
                selectedWorkflow:
                    state.selectedWorkflow?.workflow_id ===
                    action.payload.workflow_id
                        ? action.payload
                        : state.selectedWorkflow,
            };
        case 'REMOVE_WORKFLOW':
            return {
                ...state,
                workflows: state.workflows.filter(
                    w => w.workflow_id !== action.payload
                ),
                selectedWorkflow:
                    state.selectedWorkflow?.workflow_id === action.payload
                        ? null
                        : state.selectedWorkflow,
            };
        case 'SET_FILTERS':
            return { ...state, filters: action.payload };
        default:
            return state;
    }
}

interface WorkflowContextValue extends WorkflowState {
    fetchWorkflows: (filters?: WorkflowFilters) => Promise<void>;
    getWorkflow: (id: string) => Promise<Workflow>;
    createWorkflow: (data: CreateWorkflowRequest) => Promise<Workflow>;
    updateWorkflow: (
        id: string,
        data: UpdateWorkflowRequest
    ) => Promise<Workflow>;
    deleteWorkflow: (id: string) => Promise<void>;
    selectWorkflow: (workflow: Workflow | null) => void;
    setFilters: (filters: WorkflowFilters) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | undefined>(
    undefined
);

interface WorkflowProviderProps {
    children: ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
    const [state, dispatch] = useReducer(workflowReducer, initialState);
    const apiClient = useApiClient();

    const fetchWorkflows = useCallback(
        async (filters?: WorkflowFilters) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const response = await apiClient.workflows.list(
                    filters || state.filters
                );
                dispatch({ type: 'SET_WORKFLOWS', payload: response.workflows });
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to fetch workflows';
                dispatch({ type: 'SET_ERROR', payload: message });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient, state.filters]
    );

    const getWorkflow = useCallback(
        async (id: string): Promise<Workflow> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const workflow = await apiClient.workflows.getById(id);
                dispatch({ type: 'SET_SELECTED_WORKFLOW', payload: workflow });
                return workflow;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to fetch workflow';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const createWorkflow = useCallback(
        async (data: CreateWorkflowRequest): Promise<Workflow> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const workflow = await apiClient.workflows.create(data);
                dispatch({ type: 'ADD_WORKFLOW', payload: workflow });
                return workflow;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to create workflow';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const updateWorkflow = useCallback(
        async (id: string, data: UpdateWorkflowRequest): Promise<Workflow> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const workflow = await apiClient.workflows.update(id, data);
                dispatch({ type: 'UPDATE_WORKFLOW', payload: workflow });
                return workflow;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to update workflow';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const deleteWorkflow = useCallback(
        async (id: string): Promise<void> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                await apiClient.workflows.delete(id);
                dispatch({ type: 'REMOVE_WORKFLOW', payload: id });
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to delete workflow';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const selectWorkflow = useCallback((workflow: Workflow | null) => {
        dispatch({ type: 'SET_SELECTED_WORKFLOW', payload: workflow });
    }, []);

    const setFilters = useCallback((filters: WorkflowFilters) => {
        dispatch({ type: 'SET_FILTERS', payload: filters });
    }, []);

    const value: WorkflowContextValue = {
        ...state,
        fetchWorkflows,
        getWorkflow,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        selectWorkflow,
        setFilters,
    };

    return (
        <WorkflowContext.Provider value={value}>
            {children}
        </WorkflowContext.Provider>
    );
}

export function useWorkflows(): WorkflowContextValue {
    const context = useContext(WorkflowContext);
    if (context === undefined) {
        throw new Error('useWorkflows must be used within a WorkflowProvider');
    }
    return context;
}
