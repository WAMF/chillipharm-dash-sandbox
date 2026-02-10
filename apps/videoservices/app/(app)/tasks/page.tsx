'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { VSTask, TaskStatus } from '@cp/types';

import { useTasks } from '../../../contexts/TaskContext';
import { useWorkflows } from '../../../contexts/WorkflowContext';

interface KanbanColumn {
    id: TaskStatus;
    label: string;
    color: string;
    bgColor: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
    { id: 'todo', label: 'LIVE', color: 'text-neutral-700', bgColor: 'bg-neutral-100' },
    { id: 'in_progress', label: 'WITH VIDEO SOLUTIONS', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    { id: 'qa', label: 'IN QC', color: 'text-red-700', bgColor: 'bg-red-100' },
    { id: 'approved', label: 'PASSED QC', color: 'text-green-700', bgColor: 'bg-green-100' },
    { id: 'done', label: 'DELIVERED', color: 'text-emerald-800', bgColor: 'bg-emerald-100' },
];

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

function KanbanCard({ task }: { task: VSTask }) {
    return (
        <Link
            href={`/tasks/${task.task_id}`}
            className="block relative bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow flex flex-col min-h-[140px]"
        >
            <div className="p-3 pb-0 flex-1">
                <div className="mb-2">
                    <span className="inline-flex items-center rounded bg-chilli-red/10 px-1.5 py-0.5 text-[11px] font-medium text-chilli-red">
                        {task.workflow_name}
                    </span>
                </div>
                <h4 className="font-medium text-neutral-900 text-sm line-clamp-1">
                    {task.name}
                </h4>
                <p className="mt-1 text-xs text-neutral-600 line-clamp-2 h-8 overflow-hidden">
                    {task.description || '\u00A0'}
                </p>
            </div>

            <div className="px-3 pt-3 flex items-center flex-shrink-0">
                <span className="text-xs text-neutral-500">
                    {task.inputs.length > 0 ? task.inputs[0].asset_name : 'No asset'}
                </span>
            </div>

            <div className="mx-3 mt-2 mb-3 pt-2 border-t border-neutral-100 flex items-center justify-between flex-shrink-0">
                <span className="text-xs text-neutral-400">
                    {new Date(task.created_at).toLocaleDateString()}
                </span>
                {task.members.length > 0 && (
                    <div className="flex -space-x-1">
                        {task.members.slice(0, 2).map(member => (
                            <div
                                key={member.task_member_id}
                                className="h-5 w-5 rounded-full bg-chilli-red text-white flex items-center justify-center text-[10px] font-medium ring-1 ring-white"
                                title={member.user_name}
                            >
                                {member.user_name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {task.members.length > 2 && (
                            <div className="h-5 w-5 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-[10px] font-medium ring-1 ring-white">
                                +{task.members.length - 2}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}

function KanbanColumnComponent({
    column,
    tasks,
}: {
    column: KanbanColumn;
    tasks: VSTask[];
}) {
    return (
        <div className="flex-shrink-0 w-72 md:w-auto md:flex-1 md:min-w-[240px] md:max-w-[320px] border border-neutral-200 rounded-lg overflow-hidden flex flex-col h-full">
            <div className={`px-3 py-2 ${column.bgColor} border-b border-neutral-200 flex-shrink-0`}>
                <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-sm ${column.color}`}>{column.label}</h3>
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 ${column.color}`}
                    >
                        {tasks.length}
                    </span>
                </div>
            </div>
            <div className="bg-neutral-50 p-2 flex-1 overflow-y-auto space-y-2">
                {tasks.map(task => (
                    <KanbanCard key={task.task_id} task={task} />
                ))}
                {tasks.length === 0 && (
                    <div className="text-center py-8 text-neutral-400 text-sm">No tasks</div>
                )}
            </div>
        </div>
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

    const tasksByStatus = useMemo(() => {
        const grouped: Record<TaskStatus, VSTask[]> = {
            todo: [],
            in_progress: [],
            qa: [],
            approved: [],
            done: [],
        };

        filteredTasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            }
        });

        return grouped;
    }, [filteredTasks]);

    const hasFilters = searchQuery !== '' || workflowFilter !== '';

    const clearFilters = () => {
        setSearchQuery('');
        setWorkflowFilter('');
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
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

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center flex-shrink-0">
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
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex-shrink-0">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 min-h-0">
                    <div className="flex gap-4 md:gap-6 pb-4 h-full">
                        {KANBAN_COLUMNS.map(column => (
                            <KanbanColumnComponent
                                key={column.id}
                                column={column}
                                tasks={tasksByStatus[column.id]}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
