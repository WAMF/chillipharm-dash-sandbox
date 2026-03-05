'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { VSAsset } from '@cp/types';

import { useApiClient } from '../../../../hooks/useApiClient';
import { useWorkflows } from '../../../../contexts/WorkflowContext';
import { useTasks } from '../../../../contexts/TaskContext';

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

interface AssetCardProps {
    asset: VSAsset;
    selected: boolean;
    onSelect: () => void;
}

function AssetCard({ asset, selected, onSelect }: AssetCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`relative flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                selected
                    ? 'border-chilli-red bg-chilli-red/5 ring-1 ring-chilli-red'
                    : 'border-neutral-200 hover:border-neutral-300'
            }`}
        >
            <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected
                        ? 'border-chilli-red bg-chilli-red'
                        : 'border-neutral-300'
                }`}
            >
                {selected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                    {asset.name}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                    {asset.duration && <span>{asset.duration}</span>}
                    <span>{formatFileSize(asset.file_size)}</span>
                </div>
            </div>
        </button>
    );
}

export default function NewTaskPage() {
    const router = useRouter();
    const apiClient = useApiClient();
    const { createTask, addInputs, isLoading: taskLoading } = useTasks();
    const { workflows, fetchWorkflows, isLoading: workflowsLoading } = useWorkflows();

    const [step, setStep] = useState<'details' | 'assets'>('details');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
    const [assets, setAssets] = useState<VSAsset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    const selectedWorkflow = workflows.find(w => w.workflow_id === selectedWorkflowId);

    useEffect(() => {
        if (!selectedWorkflow) {
            setAssets([]);
            return;
        }

        async function loadAssets() {
            setLoadingAssets(true);
            try {
                const response = await apiClient.sites.getAssets(
                    selectedWorkflow!.source_site_id
                );
                setAssets(response.assets);
            } catch {
                setError('Failed to load assets');
            } finally {
                setLoadingAssets(false);
            }
        }
        loadAssets();
    }, [selectedWorkflow, apiClient]);

    const handleCreateTask = async () => {
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
            });
            setCreatedTaskId(task.task_id);
            setStep('assets');
        } catch {
            setError('Failed to create task');
        }
    };

    const handleSelectAsset = async () => {
        if (!createdTaskId || !selectedAssetId) return;

        setError(null);
        try {
            await addInputs(createdTaskId, [selectedAssetId]);
            router.push(`/tasks/${createdTaskId}`);
        } catch {
            setError('Failed to select asset');
        }
    };

    const handleSkipAssets = () => {
        if (createdTaskId) {
            router.push(`/tasks/${createdTaskId}`);
        }
    };

    if (workflowsLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Create Task
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    {step === 'details'
                        ? 'Select a workflow and provide task details'
                        : 'Select a source asset to process'}
                </p>
            </div>

            <div className="mb-8 flex items-center gap-4">
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
                                : 'bg-green-500 text-white'
                        }`}
                    >
                        {step === 'details' ? '1' : '✓'}
                    </div>
                    <span className="text-sm font-medium">Details</span>
                </div>
                <div className="h-px flex-1 bg-neutral-200" />
                <div
                    className={`flex items-center gap-2 ${
                        step === 'assets' ? 'text-chilli-red' : 'text-neutral-400'
                    }`}
                >
                    <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                            step === 'assets'
                                ? 'bg-chilli-red text-white'
                                : 'bg-neutral-200 text-neutral-600'
                        }`}
                    >
                        2
                    </div>
                    <span className="text-sm font-medium">Source Asset</span>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {step === 'details' ? (
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
                                            {workflow.name} (
                                            {workflow.source_site_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedWorkflow && (
                                <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                                    <p className="text-sm text-neutral-600">
                                        <span className="font-medium">
                                            Source:
                                        </span>{' '}
                                        {selectedWorkflow.source_site_name}
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-600">
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
                            onClick={handleCreateTask}
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
                                'Continue to Source Asset'
                            )}
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
            ) : (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-4">
                            Select source asset from {selectedWorkflow?.source_site_name}
                        </label>

                        {loadingAssets ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-6 w-6 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : assets.length === 0 ? (
                            <div className="rounded-lg border-2 border-dashed border-neutral-200 p-8 text-center">
                                <p className="text-sm text-neutral-500">
                                    No assets found in this site
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3 max-h-96 overflow-y-auto">
                                {assets.map(asset => (
                                    <AssetCard
                                        key={asset.asset_id}
                                        asset={asset}
                                        selected={selectedAssetId === asset.asset_id}
                                        onSelect={() => setSelectedAssetId(asset.asset_id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={handleSelectAsset}
                            disabled={taskLoading || !selectedAssetId}
                            className="inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors disabled:opacity-50"
                        >
                            {taskLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Selecting...
                                </>
                            ) : (
                                'Select Asset'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleSkipAssets}
                            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
