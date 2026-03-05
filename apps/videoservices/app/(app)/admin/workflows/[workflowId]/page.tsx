'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { FieldMappingMode, Workflow } from '@cp/types';

import type { Site } from '../../../../../lib/mock/data';
import { useApiClient } from '../../../../../hooks/useApiClient';
import { useWorkflows } from '../../../../../contexts/WorkflowContext';

interface DestinationConfig {
    id: string;
    site_id: string;
    site_name: string;
    is_primary: boolean;
    field_mapping: {
        mode: FieldMappingMode;
        fields?: string[];
    };
}

interface QADestinationConfig {
    site_id: string;
    site_name: string;
    field_mapping: {
        mode: FieldMappingMode;
        fields?: string[];
    };
}

const FIELD_MAPPING_MODES: { value: FieldMappingMode; label: string }[] = [
    { value: 'all', label: 'Copy all fields' },
    { value: 'none', label: 'Copy no fields' },
    { value: 'include', label: 'Include specific fields' },
    { value: 'exclude', label: 'Exclude specific fields' },
];

function ArrowLeftIcon() {
    return (
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            className="h-4 w-4"
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
    );
}

function CloseIcon() {
    return (
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
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    );
}

function FieldMappingEditor({
    fieldMapping,
    onChange,
    site,
}: {
    fieldMapping: { mode: FieldMappingMode; fields?: string[] };
    onChange: (mapping: { mode: FieldMappingMode; fields?: string[] }) => void;
    site?: Site;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
                Field Mapping
            </label>
            <select
                value={fieldMapping.mode}
                onChange={e =>
                    onChange({ mode: e.target.value as FieldMappingMode })
                }
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
            >
                {FIELD_MAPPING_MODES.map(mode => (
                    <option key={mode.value} value={mode.value}>
                        {mode.label}
                    </option>
                ))}
            </select>

            {(fieldMapping.mode === 'include' || fieldMapping.mode === 'exclude') &&
                site && (
                    <div className="mt-3">
                        <p className="text-xs text-neutral-500 mb-2">
                            Available fields:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {site.available_fields.map(field => {
                                const isSelected =
                                    fieldMapping.fields?.includes(field);
                                return (
                                    <button
                                        key={field}
                                        type="button"
                                        onClick={() => {
                                            const fields =
                                                fieldMapping.fields || [];
                                            onChange({
                                                ...fieldMapping,
                                                fields: isSelected
                                                    ? fields.filter(
                                                          f => f !== field
                                                      )
                                                    : [...fields, field],
                                            });
                                        }}
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                            isSelected
                                                ? 'bg-chilli-red text-white'
                                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                        }`}
                                    >
                                        {field}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
        </div>
    );
}

export default function WorkflowDetailPage() {
    const router = useRouter();
    const params = useParams();
    const workflowId = params.workflowId as string;
    const apiClient = useApiClient();
    const { getWorkflow, updateWorkflow, deleteWorkflow, isLoading } = useWorkflows();

    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [sites, setSites] = useState<Site[]>([]);
    const [loadingWorkflow, setLoadingWorkflow] = useState(true);
    const [loadingSites, setLoadingSites] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [name, setName] = useState('');
    const [qaDestination, setQADestination] = useState<QADestinationConfig | null>(null);
    const [destinations, setDestinations] = useState<DestinationConfig[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadWorkflow() {
            try {
                const data = await getWorkflow(workflowId);
                setWorkflow(data);
                setName(data.name);
                if (data.qa_destination) {
                    setQADestination({
                        site_id: data.qa_destination.site_id,
                        site_name: data.qa_destination.site_name,
                        field_mapping: data.qa_destination.field_mapping,
                    });
                }
                setDestinations(
                    data.destinations.map((d, index) => ({
                        id: `dest-${index}`,
                        site_id: d.site_id,
                        site_name: d.site_name,
                        is_primary: d.is_primary,
                        field_mapping: d.field_mapping,
                    }))
                );
            } catch {
                setError('Failed to load workflow');
            } finally {
                setLoadingWorkflow(false);
            }
        }
        loadWorkflow();
    }, [workflowId, getWorkflow]);

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

    const qaSiteId = qaDestination?.site_id;
    const availableDestinationSites = sites.filter(
        s => s.site_id !== qaSiteId
    );
    const availableQASites = sites.filter(
        s => !destinations.some(d => d.site_id === s.site_id)
    );

    const addQADestination = () => {
        const availableSite = availableQASites[0];
        if (!availableSite) return;

        setQADestination({
            site_id: availableSite.site_id,
            site_name: availableSite.name,
            field_mapping: { mode: 'all' },
        });
    };

    const addDestination = () => {
        const availableSite = availableDestinationSites.find(
            s => !destinations.some(d => d.site_id === s.site_id)
        );
        if (!availableSite) return;

        setDestinations([
            ...destinations,
            {
                id: `dest-${Date.now()}`,
                site_id: availableSite.site_id,
                site_name: availableSite.name,
                is_primary: destinations.length === 0,
                field_mapping: { mode: 'all' },
            },
        ]);
    };

    const updateDestinationConfig = (id: string, updates: Partial<DestinationConfig>) => {
        setDestinations(destinations.map(d => (d.id === id ? { ...d, ...updates } : d)));
    };

    const removeDestination = (id: string) => {
        const newDestinations = destinations.filter(d => d.id !== id);
        if (newDestinations.length > 0 && !newDestinations.some(d => d.is_primary)) {
            newDestinations[0].is_primary = true;
        }
        setDestinations(newDestinations);
    };

    const handleSave = async () => {
        setError(null);

        if (!name.trim()) {
            setError('Please enter a workflow name');
            return;
        }
        if (destinations.length === 0) {
            setError('Please add at least one final destination');
            return;
        }

        try {
            const updated = await updateWorkflow(workflowId, {
                name: name.trim(),
                qa_destination: qaDestination
                    ? {
                          site_id: qaDestination.site_id,
                          field_mapping: qaDestination.field_mapping,
                      }
                    : undefined,
                destinations: destinations.map((d, index) => ({
                    site_id: d.site_id,
                    is_primary: d.is_primary,
                    field_mapping: d.field_mapping,
                    display_order: index,
                })),
            });
            setWorkflow(updated);
            setIsEditing(false);
        } catch {
            setError('Failed to update workflow');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteWorkflow(workflowId);
            router.push('/admin');
        } catch {
            setError('Failed to delete workflow');
            setShowDeleteConfirm(false);
        }
    };

    const handleCancel = () => {
        if (workflow) {
            setName(workflow.name);
            if (workflow.qa_destination) {
                setQADestination({
                    site_id: workflow.qa_destination.site_id,
                    site_name: workflow.qa_destination.site_name,
                    field_mapping: workflow.qa_destination.field_mapping,
                });
            } else {
                setQADestination(null);
            }
            setDestinations(
                workflow.destinations.map((d, index) => ({
                    id: `dest-${index}`,
                    site_id: d.site_id,
                    site_name: d.site_name,
                    is_primary: d.is_primary,
                    field_mapping: d.field_mapping,
                }))
            );
        }
        setIsEditing(false);
        setError(null);
    };

    if (loadingWorkflow || loadingSites) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="text-center py-12">
                <h2 className="text-lg font-medium text-neutral-900">Workflow not found</h2>
                <Link
                    href="/admin"
                    className="mt-4 inline-flex items-center gap-2 text-chilli-red hover:text-chilli-red-dark"
                >
                    <ArrowLeftIcon />
                    Back to Workflows
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
                >
                    <ArrowLeftIcon />
                    Back to Workflows
                </Link>
                <div className="flex items-start justify-between">
                    <h1 className="text-2xl font-bold text-neutral-900">
                        {isEditing ? 'Edit Workflow' : workflow.name}
                    </h1>
                    {!isEditing && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700 mb-4">
                        Are you sure you want to delete this workflow? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {isEditing ? (
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleSave();
                    }}
                    className="space-y-8"
                >
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-neutral-700"
                        >
                            Workflow Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700">
                                    QC Destination
                                </label>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    Files are sent here for review before going to final destinations
                                </p>
                            </div>
                            {!qaDestination && (
                                <button
                                    type="button"
                                    onClick={addQADestination}
                                    disabled={availableQASites.length === 0}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-chilli-red hover:text-chilli-red-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PlusIcon />
                                    Add QC Destination
                                </button>
                            )}
                        </div>

                        {!qaDestination ? (
                            <div className="rounded-lg border-2 border-dashed border-neutral-200 p-6 text-center">
                                <p className="text-sm text-neutral-500">
                                    Click &quot;Add QC Destination&quot; to configure a review step
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 mr-4">
                                        <select
                                            value={qaDestination.site_id}
                                            onChange={e => {
                                                const site = sites.find(
                                                    s => s.site_id === e.target.value
                                                );
                                                setQADestination({
                                                    ...qaDestination,
                                                    site_id: e.target.value,
                                                    site_name: site?.name || '',
                                                });
                                            }}
                                            className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                                        >
                                            {availableQASites.map(site => (
                                                <option
                                                    key={site.site_id}
                                                    value={site.site_id}
                                                >
                                                    {site.name} ({site.type})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setQADestination(null)}
                                        className="text-neutral-400 hover:text-red-500"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>

                                <FieldMappingEditor
                                    fieldMapping={qaDestination.field_mapping}
                                    onChange={mapping =>
                                        setQADestination({
                                            ...qaDestination,
                                            field_mapping: mapping,
                                        })
                                    }
                                    site={sites.find(s => s.site_id === qaDestination.site_id)}
                                    />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-neutral-700">
                                Final Destinations
                            </label>
                            <button
                                type="button"
                                onClick={addDestination}
                                disabled={destinations.length >= availableDestinationSites.length}
                                className="inline-flex items-center gap-1 text-sm font-medium text-chilli-red hover:text-chilli-red-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon />
                                Add Destination
                            </button>
                        </div>

                        {destinations.length === 0 ? (
                            <div className="rounded-lg border-2 border-dashed border-neutral-200 p-6 text-center">
                                <p className="text-sm text-neutral-500">
                                    Click &quot;Add Destination&quot; to configure where approved
                                    files go
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {destinations.map(destination => (
                                    <div
                                        key={destination.id}
                                        className="rounded-lg border border-neutral-200 p-4"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 mr-4">
                                                <select
                                                    value={destination.site_id}
                                                    onChange={e => {
                                                        const site = sites.find(
                                                            s => s.site_id === e.target.value
                                                        );
                                                        updateDestinationConfig(destination.id, {
                                                            site_id: e.target.value,
                                                            site_name: site?.name || '',
                                                        });
                                                    }}
                                                    className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                                                >
                                                    {availableDestinationSites.map(site => (
                                                        <option
                                                            key={site.site_id}
                                                            value={site.site_id}
                                                            disabled={
                                                                destination.site_id !==
                                                                    site.site_id &&
                                                                destinations.some(
                                                                    d =>
                                                                        d.site_id ===
                                                                        site.site_id
                                                                )
                                                            }
                                                        >
                                                            {site.name} ({site.type})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeDestination(destination.id)
                                                }
                                                className="text-neutral-400 hover:text-red-500"
                                            >
                                                <CloseIcon />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="primary"
                                                    checked={destination.is_primary}
                                                    onChange={() => {
                                                        setDestinations(
                                                            destinations.map(d => ({
                                                                ...d,
                                                                is_primary:
                                                                    d.id === destination.id,
                                                            }))
                                                        );
                                                    }}
                                                    className="text-chilli-red focus:ring-chilli-red"
                                                />
                                                <span className="text-sm text-neutral-700">
                                                    Primary destination
                                                </span>
                                            </label>
                                        </div>

                                        <FieldMappingEditor
                                            fieldMapping={destination.field_mapping}
                                            onChange={mapping =>
                                                updateDestinationConfig(destination.id, {
                                                    field_mapping: mapping,
                                                })
                                            }
                                            site={sites.find(s => s.site_id === destination.site_id)}
                                                    />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="rounded-lg border border-neutral-200 bg-white p-6">
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-neutral-500">Trial</dt>
                                <dd className="mt-1 text-sm text-neutral-900">
                                    {workflow.trial_name}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {workflow.qa_destination && (
                        <div>
                            <h2 className="text-lg font-medium text-neutral-900 mb-4">
                                QC Destination
                            </h2>
                            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-neutral-900">
                                            {workflow.qa_destination.site_name}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            Field mapping: {workflow.qa_destination.field_mapping.mode}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                        QC Review
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-lg font-medium text-neutral-900 mb-4">
                            Final Destinations ({workflow.destinations.length})
                        </h2>
                        <div className="space-y-3">
                            {workflow.destinations.map((dest, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-neutral-200 bg-white p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-neutral-900">
                                                {dest.site_name}
                                            </p>
                                            <p className="text-sm text-neutral-500">
                                                Field mapping: {dest.field_mapping.mode}
                                            </p>
                                        </div>
                                        {dest.is_primary && (
                                            <span className="inline-flex items-center rounded-full bg-chilli-red/10 px-2.5 py-0.5 text-xs font-medium text-chilli-red">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
