'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import type { Site } from '../../../../lib/mock/data';
import { useApiClient } from '../../../../hooks/useApiClient';
import { useWorkflows } from '../../../../contexts/WorkflowContext';
import { useTasks } from '../../../../contexts/TaskContext';
import { AssetPicker } from '../../../../components/assets';

export default function NewTaskPage() {
    const router = useRouter();
    const apiClient = useApiClient();
    const { createTask, addInputs, isLoading: taskLoading } = useTasks();
    const { workflows, fetchWorkflows, isLoading: workflowsLoading } = useWorkflows();

    const [step, setStep] = useState<'source' | 'assets' | 'details'>('source');
    const [sites, setSites] = useState<Site[]>([]);
    const [loadingSites, setLoadingSites] = useState(true);
    const [sourceSiteId, setSourceSiteId] = useState('');
    const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
    const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    useEffect(() => {
        async function loadSites() {
            try {
                const response = await apiClient.sites.list();
                setSites(response.sites);
            } catch {
                setError('Failed to load sites');
            } finally {
                setLoadingSites(false);
            }
        }
        loadSites();
    }, [apiClient]);

    const selectedWorkflow = workflows.find(w => w.workflow_id === selectedWorkflowId);
    const sourceSite = sites.find(s => s.site_id === sourceSiteId);

    const handleSubmit = async () => {
        setError(null);

        if (!name.trim()) {
            setError('Please enter a task name');
            return;
        }
        if (!selectedWorkflowId) {
            setError('Please select a workflow');
            return;
        }

        try {
            const task = await createTask({
                workflow_id: selectedWorkflowId,
                name: name.trim(),
                description: description.trim() || undefined,
                source_site_id: sourceSiteId,
            });
            if (selectedAssetIds.size > 0) {
                await addInputs(task.task_id, Array.from(selectedAssetIds));
            }
            router.push(`/tasks/${task.task_id}`);
        } catch {
            setError('Failed to create task');
        }
    };

    if (workflowsLoading || loadingSites) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const stepSubtitle =
        step === 'source'
            ? 'Select a source site for the assets'
            : step === 'assets'
              ? 'Select source assets to process'
              : 'Select a workflow and provide task details';

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Create Task
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    {stepSubtitle}
                </p>
            </div>

            <div className="mb-8 flex items-center gap-4">
                <div
                    className={`flex items-center gap-2 ${
                        step === 'source'
                            ? 'text-chilli-red'
                            : 'text-neutral-400'
                    }`}
                >
                    <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                            step === 'source'
                                ? 'bg-chilli-red text-white'
                                : 'bg-green-500 text-white'
                        }`}
                    >
                        {step === 'source' ? '1' : '\u2713'}
                    </div>
                    <span className="text-sm font-medium">Source</span>
                </div>
                <div className="h-px flex-1 bg-neutral-200" />
                <div
                    className={`flex items-center gap-2 ${
                        step === 'assets'
                            ? 'text-chilli-red'
                            : 'text-neutral-400'
                    }`}
                >
                    <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                            step === 'assets'
                                ? 'bg-chilli-red text-white'
                                : step === 'details'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-neutral-200 text-neutral-600'
                        }`}
                    >
                        {step === 'details' ? '\u2713' : '2'}
                    </div>
                    <span className="text-sm font-medium">Assets</span>
                </div>
                <div className="h-px flex-1 bg-neutral-200" />
                <div
                    className={`flex items-center gap-2 ${
                        step === 'details'
                            ? 'text-chilli-red'
                            : 'text-neutral-400'
                    }`}
                >
                    <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                            step === 'details'
                                ? 'bg-chilli-red text-white'
                                : 'bg-neutral-200 text-neutral-600'
                        }`}
                    >
                        3
                    </div>
                    <span className="text-sm font-medium">Details</span>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {step === 'source' && (
                <div className="space-y-6">
                    <div>
                        <label
                            htmlFor="source"
                            className="block text-sm font-medium text-neutral-700"
                        >
                            Source
                        </label>
                        <select
                            id="source"
                            value={sourceSiteId}
                            onChange={e => {
                                setSourceSiteId(e.target.value);
                                setSelectedAssetIds(new Set());
                            }}
                            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                        >
                            <option value="">Select source...</option>
                            {sites.map(site => (
                                <option key={site.site_id} value={site.site_id}>
                                    {site.name} ({site.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={() => setStep('assets')}
                            disabled={!sourceSiteId}
                            className="inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors disabled:opacity-50"
                        >
                            Continue to Assets
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {step === 'assets' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-4">
                            Select source assets from {sourceSite?.name}
                        </label>

                        <AssetPicker
                            siteId={sourceSiteId}
                            selectedAssetIds={selectedAssetIds}
                            onSelectionChange={setSelectedAssetIds}
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={() => setStep('details')}
                            disabled={selectedAssetIds.size === 0}
                            className="inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors disabled:opacity-50"
                        >
                            Continue to Details ({selectedAssetIds.size} selected)
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('source')}
                            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                    </div>
                </div>
            )}

            {step === 'details' && (
                <div className="space-y-6">
                    {workflows.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-neutral-200 p-8 text-center">
                            <p className="text-sm text-neutral-500">
                                No workflows available. Please create a workflow
                                first.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push('/admin/workflows/new')}
                                className="mt-4 text-sm font-medium text-chilli-red hover:text-chilli-red-dark"
                            >
                                Create Workflow
                            </button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label
                                    htmlFor="workflow"
                                    className="block text-sm font-medium text-neutral-700"
                                >
                                    Workflow
                                </label>
                                <select
                                    id="workflow"
                                    value={selectedWorkflowId}
                                    onChange={e =>
                                        setSelectedWorkflowId(e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                                >
                                    <option value="">Select workflow...</option>
                                    {workflows.map(workflow => (
                                        <option
                                            key={workflow.workflow_id}
                                            value={workflow.workflow_id}
                                        >
                                            {workflow.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedWorkflow && (
                                <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                                    <p className="text-sm text-neutral-600">
                                        <span className="font-medium">
                                            Destinations:
                                        </span>{' '}
                                        {selectedWorkflow.destinations
                                            .map(d => d.site_name)
                                            .join(', ')}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-neutral-700"
                                >
                                    Task Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                                    placeholder="Enter task name"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-neutral-700"
                                >
                                    Description{' '}
                                    <span className="text-neutral-400">
                                        (optional)
                                    </span>
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={e =>
                                        setDescription(e.target.value)
                                    }
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                                    placeholder="Describe this task..."
                                />
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={
                                taskLoading ||
                                !selectedWorkflowId ||
                                !name.trim()
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors disabled:opacity-50"
                        >
                            {taskLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Task'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('assets')}
                            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
