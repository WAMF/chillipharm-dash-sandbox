'use client';

import {
    createContext,
    useContext,
    useReducer,
    useCallback,
    ReactNode,
} from 'react';
import type {
    VSTask,
    TaskFilters,
    CreateTaskRequest,
    UpdateTaskRequest,
    CompletionResult,
    QASubmissionResult,
    QAReviewResult,
} from '@cp/types';
import { useApiClient } from '../hooks/useApiClient';

interface TaskState {
    tasks: VSTask[];
    selectedTask: VSTask | null;
    isLoading: boolean;
    error: string | null;
    filters: TaskFilters;
}

type TaskAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_TASKS'; payload: VSTask[] }
    | { type: 'SET_SELECTED_TASK'; payload: VSTask | null }
    | { type: 'ADD_TASK'; payload: VSTask }
    | { type: 'UPDATE_TASK'; payload: VSTask }
    | { type: 'REMOVE_TASK'; payload: string }
    | { type: 'SET_FILTERS'; payload: TaskFilters };

const initialState: TaskState = {
    tasks: [],
    selectedTask: null,
    isLoading: false,
    error: null,
    filters: {},
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_TASKS':
            return { ...state, tasks: action.payload };
        case 'SET_SELECTED_TASK':
            return { ...state, selectedTask: action.payload };
        case 'ADD_TASK':
            return { ...state, tasks: [action.payload, ...state.tasks] };
        case 'UPDATE_TASK':
            return {
                ...state,
                tasks: state.tasks.map(t =>
                    t.task_id === action.payload.task_id ? action.payload : t
                ),
                selectedTask:
                    state.selectedTask?.task_id === action.payload.task_id
                        ? action.payload
                        : state.selectedTask,
            };
        case 'REMOVE_TASK':
            return {
                ...state,
                tasks: state.tasks.filter(t => t.task_id !== action.payload),
                selectedTask:
                    state.selectedTask?.task_id === action.payload
                        ? null
                        : state.selectedTask,
            };
        case 'SET_FILTERS':
            return { ...state, filters: action.payload };
        default:
            return state;
    }
}

interface TaskContextValue extends TaskState {
    fetchTasks: (filters?: TaskFilters) => Promise<void>;
    getTask: (id: string) => Promise<VSTask>;
    createTask: (data: CreateTaskRequest) => Promise<VSTask>;
    updateTask: (id: string, data: UpdateTaskRequest) => Promise<VSTask>;
    deleteTask: (id: string) => Promise<void>;
    selectTask: (task: VSTask | null) => void;
    setFilters: (filters: TaskFilters) => void;
    addInputs: (taskId: string, assetIds: string[]) => Promise<void>;
    addInputsFromFiles: (taskId: string, files: Array<{ name: string; size: number }>) => Promise<void>;
    removeInput: (taskId: string, inputId: string) => Promise<void>;
    completeTask: (taskId: string) => Promise<CompletionResult>;
    submitToQA: (taskId: string, file: File) => Promise<QASubmissionResult>;
    approveQA: (taskId: string) => Promise<QAReviewResult>;
    rejectQA: (taskId: string) => Promise<QAReviewResult>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

interface TaskProviderProps {
    children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
    const [state, dispatch] = useReducer(taskReducer, initialState);
    const apiClient = useApiClient();

    const fetchTasks = useCallback(
        async (filters?: TaskFilters) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const response = await apiClient.tasks.list(
                    filters || state.filters
                );
                dispatch({ type: 'SET_TASKS', payload: response.tasks });
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to fetch tasks';
                dispatch({ type: 'SET_ERROR', payload: message });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient, state.filters]
    );

    const getTask = useCallback(
        async (id: string): Promise<VSTask> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const task = await apiClient.tasks.getById(id);
                dispatch({ type: 'SET_SELECTED_TASK', payload: task });
                return task;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to fetch task';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const createTask = useCallback(
        async (data: CreateTaskRequest): Promise<VSTask> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const task = await apiClient.tasks.create(data);
                dispatch({ type: 'ADD_TASK', payload: task });
                return task;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to create task';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const updateTask = useCallback(
        async (id: string, data: UpdateTaskRequest): Promise<VSTask> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const task = await apiClient.tasks.update(id, data);
                dispatch({ type: 'UPDATE_TASK', payload: task });
                return task;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to update task';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const deleteTask = useCallback(
        async (id: string): Promise<void> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                await apiClient.tasks.delete(id);
                dispatch({ type: 'REMOVE_TASK', payload: id });
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to delete task';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const selectTask = useCallback((task: VSTask | null) => {
        dispatch({ type: 'SET_SELECTED_TASK', payload: task });
    }, []);

    const setFilters = useCallback((filters: TaskFilters) => {
        dispatch({ type: 'SET_FILTERS', payload: filters });
    }, []);

    const addInputs = useCallback(
        async (taskId: string, assetIds: string[]): Promise<void> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                await apiClient.tasks.addInputs(taskId, assetIds);
                const task = await apiClient.tasks.getById(taskId);
                dispatch({ type: 'UPDATE_TASK', payload: task });
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to add inputs';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const addInputsFromFiles = useCallback(
        async (taskId: string, files: Array<{ name: string; size: number }>): Promise<void> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                await apiClient.tasks.addInputsFromFiles(taskId, files);
                const task = await apiClient.tasks.getById(taskId);
                dispatch({ type: 'UPDATE_TASK', payload: task });
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to add files';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const removeInput = useCallback(
        async (taskId: string, inputId: string): Promise<void> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                await apiClient.tasks.removeInput(taskId, inputId);
                const task = await apiClient.tasks.getById(taskId);
                dispatch({ type: 'UPDATE_TASK', payload: task });
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to remove input';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const completeTask = useCallback(
        async (taskId: string): Promise<CompletionResult> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const result = await apiClient.tasks.complete(taskId);
                const task = await apiClient.tasks.getById(taskId);
                dispatch({ type: 'UPDATE_TASK', payload: task });
                return result;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to complete task';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const submitToQA = useCallback(
        async (taskId: string, file: File): Promise<QASubmissionResult> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const result = await apiClient.tasks.submitToQA(taskId, file);
                const task = await apiClient.tasks.getById(taskId);
                dispatch({ type: 'UPDATE_TASK', payload: task });
                return result;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to submit to QA';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const approveQA = useCallback(
        async (taskId: string): Promise<QAReviewResult> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const result = await apiClient.tasks.approveQA(taskId);
                const task = await apiClient.tasks.getById(taskId);
                dispatch({ type: 'UPDATE_TASK', payload: task });
                return result;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to approve QA';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const rejectQA = useCallback(
        async (taskId: string): Promise<QAReviewResult> => {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const result = await apiClient.tasks.rejectQA(taskId);
                const task = await apiClient.tasks.getById(taskId);
                dispatch({ type: 'UPDATE_TASK', payload: task });
                return result;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to reject QA';
                dispatch({ type: 'SET_ERROR', payload: message });
                throw error;
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [apiClient]
    );

    const value: TaskContextValue = {
        ...state,
        fetchTasks,
        getTask,
        createTask,
        updateTask,
        deleteTask,
        selectTask,
        setFilters,
        addInputs,
        addInputsFromFiles,
        removeInput,
        completeTask,
        submitToQA,
        approveQA,
        rejectQA,
    };

    return (
        <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
    );
}

export function useTasks(): TaskContextValue {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
