'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useReports } from '../../../../contexts/ReportContext';
import { ColumnPicker } from '../../../../components/ColumnPicker';
import { ReportPreviewTable } from '../../../../components/ReportPreviewTable';
import {
    REPORT_TEMPLATES,
    type ReportTemplate,
    type ReportRowEntity,
    type SavedReportTemplate,
    type SavedReportFilters,
    type TaskStatusFilter,
} from '@cp/types';
import { getColumnDefinitionsForEntity } from '@cp/data-processing';

const ROW_ENTITY_LABELS: Record<ReportRowEntity, string> = {
    studyProcedure: 'Study Procedure',
    form: 'Form',
    actionRequired: 'Action Required',
    asset: 'Asset',
    subject: 'Subject',
};

export default function ReportTemplatesPage() {
    const {
        savedTemplates,
        isLoading,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        runReport,
        isRunning,
    } = useReports();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<SavedReportTemplate | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this template? Any associated schedules will also be removed.')) return;
        setDeletingId(id);
        try {
            await deleteTemplate(id);
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-chilli-red border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                    {savedTemplates.length} template{savedTemplates.length !== 1 ? 's' : ''}
                </p>
                <button
                    onClick={() => { setEditingTemplate(null); setShowCreateModal(true); }}
                    className="rounded-md bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors"
                >
                    Create Template
                </button>
            </div>

            {savedTemplates.length === 0 ? (
                <div className="rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
                    <p className="text-sm text-neutral-500">No report templates yet.</p>
                    <p className="mt-1 text-xs text-neutral-400">Create one to get started with reporting.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Type</th>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Columns</th>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Created</th>
                                <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {savedTemplates.map(template => (
                                <tr key={template.id} className="hover:bg-neutral-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-neutral-900">{template.name}</div>
                                        {template.description && (
                                            <div className="mt-0.5 text-xs text-neutral-400">{template.description}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                                            {ROW_ENTITY_LABELS[template.rowEntity]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">
                                        {template.columns.length}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">
                                        {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => runReport(template)}
                                                disabled={isRunning}
                                                className="rounded px-3 py-1.5 text-xs font-medium text-white bg-chilli-red hover:bg-chilli-red-dark disabled:opacity-50 transition-colors"
                                            >
                                                {isRunning ? 'Running...' : 'Run'}
                                            </button>
                                            <button
                                                onClick={() => { setEditingTemplate(template); setShowCreateModal(true); }}
                                                className="rounded px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template.id)}
                                                disabled={deletingId === template.id}
                                                className="rounded px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreateModal && (
                <CreateTemplateModal
                    existingTemplate={editingTemplate}
                    onClose={() => { setShowCreateModal(false); setEditingTemplate(null); }}
                    onSave={async (data) => {
                        if (editingTemplate) {
                            await updateTemplate(editingTemplate.id, data);
                        } else {
                            await createTemplate(data as Parameters<typeof createTemplate>[0]);
                        }
                        setShowCreateModal(false);
                        setEditingTemplate(null);
                    }}
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Create/Edit Template Modal
// ---------------------------------------------------------------------------

interface CreateTemplateModalProps {
    existingTemplate: SavedReportTemplate | null;
    onClose: () => void;
    onSave: (data: {
        name: string;
        description: string;
        baseTemplateId: string;
        rowEntity: ReportRowEntity;
        columns: string[];
        filters: SavedReportFilters;
    }) => Promise<void>;
}

function CreateTemplateModal({ existingTemplate, onClose, onSave }: CreateTemplateModalProps) {
    const { fetchPreviewData } = useReports();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
    const [previewTotalRows, setPreviewTotalRows] = useState(0);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const [baseTemplate, setBaseTemplate] = useState<ReportTemplate | null>(
        existingTemplate?.baseTemplateId
            ? REPORT_TEMPLATES.find(t => t.id === existingTemplate.baseTemplateId) || null
            : null
    );
    const [name, setName] = useState(existingTemplate?.name || '');
    const [description, setDescription] = useState(existingTemplate?.description || '');
    const [rowEntity, setRowEntity] = useState<ReportRowEntity>(
        existingTemplate?.rowEntity || 'studyProcedure'
    );
    const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
        new Set(existingTemplate?.columns || [])
    );
    const [filters, setFilters] = useState<SavedReportFilters>(
        existingTemplate?.filters || {}
    );
    const [taskStatusFilters, setTaskStatusFilters] = useState<TaskStatusFilter[]>(
        existingTemplate?.filters?.taskStatusFilters || []
    );

    const columnDefs = useMemo(() => {
        return getColumnDefinitionsForEntity(rowEntity);
    }, [rowEntity]);

    const handleSelectBaseTemplate = (template: ReportTemplate) => {
        setBaseTemplate(template);
        setRowEntity(template.rowEntity);
        if (!name) setName(template.name);
        if (!description) setDescription(template.description);
        const { columns } = getColumnDefinitionsForEntity(template.rowEntity);
        const validColumns = template.defaultColumns.filter(col =>
            columns.some(c => c.key === col)
        );
        setSelectedColumns(new Set(validColumns.length > 0 ? validColumns : columns.map(c => c.key)));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({
                name,
                description,
                baseTemplateId: baseTemplate?.id || 'custom',
                rowEntity,
                columns: Array.from(selectedColumns),
                filters: { ...filters, taskStatusFilters },
            });
        } finally {
            setSaving(false);
        }
    };

    const addTaskStatusFilter = () => {
        setTaskStatusFilters([...taskStatusFilters, { taskName: '', status: 'complete' }]);
    };

    const updateTaskStatusFilter = (index: number, field: keyof TaskStatusFilter, value: string) => {
        const updated = [...taskStatusFilters];
        updated[index] = { ...updated[index], [field]: value };
        setTaskStatusFilters(updated);
    };

    const removeTaskStatusFilter = (index: number) => {
        setTaskStatusFilters(taskStatusFilters.filter((_, i) => i !== index));
    };

    const loadPreview = useCallback(async () => {
        setPreviewLoading(true);
        setPreviewError(null);
        try {
            const result = await fetchPreviewData(rowEntity, { ...filters, taskStatusFilters });
            setPreviewData(result.data as Record<string, unknown>[]);
            setPreviewTotalRows(result.totalRows);
        } catch {
            setPreviewError('Failed to load preview data.');
            setPreviewData([]);
            setPreviewTotalRows(0);
        } finally {
            setPreviewLoading(false);
        }
    }, [fetchPreviewData, rowEntity, filters, taskStatusFilters]);

    useEffect(() => {
        if (step === 5) {
            loadPreview();
        }
    }, [step, loadPreview]);

    const canProceed = () => {
        switch (step) {
            case 1: return baseTemplate !== null || existingTemplate !== null;
            case 2: return name.trim().length > 0;
            case 3: return selectedColumns.size > 0;
            case 4: return true;
            case 5: return true;
            default: return false;
        }
    };

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-[800px] flex-col rounded-lg bg-white shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-neutral-900">
                        {existingTemplate ? 'Edit Template' : 'Create Template'}
                    </h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress */}
                <div className="border-b border-neutral-100 px-6 py-3">
                    <div className="flex gap-2 text-xs">
                        {['Base Type', 'Details', 'Columns', 'Filters', 'Preview'].map((label, i) => (
                            <button
                                key={label}
                                onClick={() => setStep(i + 1)}
                                className={`rounded-full px-3 py-1 ${
                                    step === i + 1
                                        ? 'bg-chilli-red text-white'
                                        : step > i + 1
                                            ? 'bg-chilli-red/10 text-chilli-red'
                                            : 'bg-neutral-100 text-neutral-400'
                                }`}
                            >
                                {i + 1}. {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {step === 1 && (
                        <div className="space-y-3">
                            <p className="text-sm text-neutral-500">Choose a base report type to start from.</p>
                            <div className="grid grid-cols-2 gap-3">
                                {REPORT_TEMPLATES.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleSelectBaseTemplate(template)}
                                        className={`rounded-lg border p-4 text-left transition-colors ${
                                            baseTemplate?.id === template.id
                                                ? 'border-chilli-red bg-chilli-red/5'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                        }`}
                                    >
                                        <div className="text-sm font-medium text-neutral-900">{template.name}</div>
                                        <div className="mt-1 text-xs text-neutral-500">{template.description}</div>
                                        <span className="mt-2 inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                                            {ROW_ENTITY_LABELS[template.rowEntity]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">Report Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Daily Review Queue"
                                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Describe what this report is for..."
                                    rows={3}
                                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <ColumnPicker
                            columns={columnDefs.columns}
                            categories={columnDefs.categories}
                            selectedColumns={selectedColumns}
                            onSelectionChange={setSelectedColumns}
                        />
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <p className="text-sm text-neutral-500">
                                Configure default filters for this report. Users can override these at run time.
                            </p>

                            {/* Exception threshold (studyProcedure only) */}
                            {rowEntity === 'studyProcedure' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                                        Exception Threshold (days)
                                    </label>
                                    <p className="mb-2 text-xs text-neutral-400">
                                        Only show procedures older than N days with incomplete tasks.
                                        Leave empty to disable.
                                    </p>
                                    <input
                                        type="number"
                                        value={filters.exceptionDaysThreshold || ''}
                                        onChange={e => setFilters({
                                            ...filters,
                                            exceptionDaysThreshold: e.target.value ? parseInt(e.target.value) : undefined,
                                        })}
                                        placeholder="e.g. 3"
                                        className="w-32 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                                    />
                                </div>
                            )}

                            {/* Include resolved (actionRequired only) */}
                            {rowEntity === 'actionRequired' && (
                                <label className="flex items-center gap-2 text-sm text-neutral-700">
                                    <input
                                        type="checkbox"
                                        checked={filters.includeResolved || false}
                                        onChange={e => setFilters({ ...filters, includeResolved: e.target.checked })}
                                    />
                                    Include resolved flags
                                </label>
                            )}

                            {/* Form status (form only) */}
                            {rowEntity === 'form' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                                        Form Status
                                    </label>
                                    <select
                                        value={filters.formStatus || ''}
                                        onChange={e => setFilters({ ...filters, formStatus: e.target.value || undefined })}
                                        className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                                    >
                                        <option value="">All statuses</option>
                                        <option value="pending">Awaiting Acknowledgement</option>
                                        <option value="complete">Complete</option>
                                        <option value="not_started">Not Started</option>
                                    </select>
                                </div>
                            )}

                            {/* Task status filters (studyProcedure and asset) */}
                            {(rowEntity === 'studyProcedure' || rowEntity === 'asset') && (
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-sm font-medium text-neutral-700">
                                            Task Status Filters
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addTaskStatusFilter}
                                            className="text-xs text-chilli-red hover:text-chilli-red-dark"
                                        >
                                            + Add condition
                                        </button>
                                    </div>
                                    {taskStatusFilters.length === 0 && (
                                        <p className="text-xs text-neutral-400">
                                            No task filters. Add conditions to filter by task completion status.
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        {taskStatusFilters.map((tsf, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={tsf.taskName}
                                                    onChange={e => updateTaskStatusFilter(i, 'taskName', e.target.value)}
                                                    placeholder="Task name (e.g. All Video Uploaded)"
                                                    className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                                                />
                                                <select
                                                    value={tsf.status}
                                                    onChange={e => updateTaskStatusFilter(i, 'status', e.target.value)}
                                                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                                                >
                                                    <option value="complete">= Complete</option>
                                                    <option value="incomplete">= Incomplete</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTaskStatusFilter(i)}
                                                    className="text-neutral-400 hover:text-red-500"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <h4 className="mb-2 text-sm font-medium text-neutral-700">Template Summary</h4>
                                <dl className="space-y-1 text-xs text-neutral-600">
                                    <div className="flex justify-between">
                                        <dt>Name</dt>
                                        <dd className="font-medium">{name || '—'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt>Type</dt>
                                        <dd>{ROW_ENTITY_LABELS[rowEntity]}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt>Columns</dt>
                                        <dd>{selectedColumns.size}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt>Task Filters</dt>
                                        <dd>{taskStatusFilters.length}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6">
                            <p className="text-sm text-neutral-500">
                                Preview how data will look with this template configuration.
                            </p>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="rounded-md bg-neutral-50 p-4 text-center">
                                    <div className="text-xl font-semibold text-chilli-red">
                                        {previewLoading ? '...' : previewTotalRows.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-neutral-500">Total Records</div>
                                </div>
                                <div className="rounded-md bg-neutral-50 p-4 text-center">
                                    <div className="text-xl font-semibold text-chilli-red">
                                        {selectedColumns.size}
                                    </div>
                                    <div className="text-xs text-neutral-500">Columns</div>
                                </div>
                                <div className="rounded-md bg-neutral-50 p-4 text-center">
                                    <div className="text-xl font-semibold text-chilli-red">
                                        {ROW_ENTITY_LABELS[rowEntity]}
                                    </div>
                                    <div className="text-xs text-neutral-500">Report Type</div>
                                </div>
                            </div>

                            {previewLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-chilli-red border-t-transparent" />
                                </div>
                            ) : previewError ? (
                                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center">
                                    <p className="text-sm text-red-600">{previewError}</p>
                                    <button
                                        onClick={loadPreview}
                                        className="mt-2 text-xs text-chilli-red hover:text-chilli-red-dark"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <ReportPreviewTable
                                    rows={previewData}
                                    columns={columnDefs.columns}
                                    selectedColumnKeys={selectedColumns}
                                    totalRows={previewTotalRows}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4">
                    <button
                        onClick={step > 1 ? () => setStep(step - 1) : onClose}
                        className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>
                    {step < 5 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="rounded-md bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={saving || !name.trim() || selectedColumns.size === 0}
                            className="rounded-md bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Saving...' : existingTemplate ? 'Update Template' : 'Create Template'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
