'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { VSTask } from '@cp/types';

import { useTasks } from '../../../contexts/TaskContext';
import { useWorkflows } from '../../../contexts/WorkflowContext';

function SearchIcon() {
    return (
        <svg
            className="h-5 w-5 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
    );
}

function TaskRow({ task }: { task: VSTask }) {
    return (
        <Link
            href={`/tasks/${task.task_id}`}
            className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 hover:border-chilli-red/50 hover:shadow-md transition-all"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center rounded bg-chilli-red/10 px-1.5 py-0.5 text-[11px] font-medium text-chilli-red">
                        {task.workflow_name}
                    </span>
                    <span className="text-xs text-neutral-400">&bull;</span>
                    <span className="text-xs text-neutral-500">
                        {task.source_site_name}
                    </span>
                </div>
                <h4 className="font-medium text-neutral-900 text-sm truncate">
                    {task.name}
                </h4>
            </div>
            <span className="hidden sm:block text-xs text-neutral-500 truncate max-w-[200px]">
                {task.inputs.length > 0 ? task.inputs[0].asset_name : 'No asset'}
            </span>
            <span className="shrink-0 text-xs text-neutral-400">
                {new Date(task.created_at).toLocaleDateString()}
            </span>
        </Link>
    );
}

export default function TasksPage() {
    const { tasks, isLoading, error, fetchTasks } = useTasks();
    const { workflows, fetchWorkflows } = useWorkflows();

    const [searchQuery, setSearchQuery] = useState('');
    const [workflowFilter, setWorkflowFilter] = useState('');

    useEffect(() => {
        fetchTasks();
        fetchWorkflows();
    }, [fetchTasks, fetchWorkflows]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch =
                searchQuery === '' ||
                task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.workflow_name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesWorkflow = workflowFilter === '' || task.workflow_id === workflowFilter;

            return matchesSearch && matchesWorkflow;
        });
    }, [tasks, searchQuery, workflowFilter]);

    const hasFilters = searchQuery !== '' || workflowFilter !== '';

    const clearFilters = () => {
        setSearchQuery('');
        setWorkflowFilter('');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Tasks</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <Link
                    href="/tasks/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    New Task
                </Link>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={event => setSearchQuery(event.target.value)}
                        className="block w-full rounded-md border border-neutral-300 py-2 pl-10 pr-3 text-sm placeholder-neutral-400 focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={workflowFilter}
                        onChange={event => setWorkflowFilter(event.target.value)}
                        className="rounded-md border border-neutral-300 py-2 pl-3 pr-8 text-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                    >
                        <option value="">All Workflows</option>
                        {workflows.map(workflow => (
                            <option key={workflow.workflow_id} value={workflow.workflow_id}>
                                {workflow.name}
                            </option>
                        ))}
                    </select>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm text-neutral-500 hover:text-neutral-700"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-neutral-200 p-12 text-center">
                    <h3 className="text-lg font-medium text-neutral-900">
                        {hasFilters ? 'No matching tasks' : 'No tasks yet'}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-500">
                        {hasFilters
                            ? 'Try adjusting your filters or search query'
                            : 'Create a task to get started'}
                    </p>
                    {hasFilters ? (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    ) : (
                        <Link
                            href="/tasks/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors"
                        >
                            New Task
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {hasFilters && (
                        <p className="mb-4 text-sm text-neutral-500">
                            Showing {filteredTasks.length} of {tasks.length} tasks
                        </p>
                    )}
                    <div className="space-y-2">
                        {filteredTasks.map(task => (
                            <TaskRow key={task.task_id} task={task} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
