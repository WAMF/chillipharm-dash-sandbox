'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { Workflow } from '@cp/types';

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

function WorkflowCard({ workflow }: { workflow: Workflow }) {
    return (
        <Link
            href={`/admin/workflows/${workflow.workflow_id}`}
            className="block rounded-lg border border-neutral-200 bg-white p-6 hover:border-chilli-red/50 hover:shadow-md transition-all"
        >
            <h3 className="text-lg font-medium text-neutral-900">
                {workflow.name}
            </h3>

            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-500">Destinations:</span>
                    <span className="font-medium text-neutral-700">
                        {workflow.destinations.length} site
                        {workflow.destinations.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-400">
                    {workflow.trial_name}
                </p>
            </div>
        </Link>
    );
}

export default function AdminPage() {
    const { workflows, isLoading, error, fetchWorkflows } = useWorkflows();

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    const filteredWorkflows = useMemo(() => {
        return workflows.filter(workflow => {
            const matchesSearch =
                searchQuery === '' ||
                workflow.name.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch;
        });
    }, [workflows, searchQuery]);

    const hasFilters = searchQuery !== '';

    const clearFilters = () => {
        setSearchQuery('');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Workflows
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Configure video processing workflows
                    </p>
                </div>
                <Link
                    href="/admin/workflows/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    New Workflow
                </Link>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search workflows..."
                        value={searchQuery}
                        onChange={event => setSearchQuery(event.target.value)}
                        className="block w-full rounded-md border border-neutral-300 py-2 pl-10 pr-3 text-sm placeholder-neutral-400 focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                    />
                </div>
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

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredWorkflows.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-neutral-200 p-12 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-neutral-900">
                        {hasFilters ? 'No matching workflows' : 'No workflows configured'}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-500">
                        {hasFilters
                            ? 'Try adjusting your filters or search query'
                            : 'Create a workflow to define how video processing tasks operate'}
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
                            href="/admin/workflows/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors"
                        >
                            Create Workflow
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {hasFilters && (
                        <p className="mb-4 text-sm text-neutral-500">
                            Showing {filteredWorkflows.length} of {workflows.length} workflows
                        </p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredWorkflows.map(workflow => (
                            <WorkflowCard
                                key={workflow.workflow_id}
                                workflow={workflow}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
