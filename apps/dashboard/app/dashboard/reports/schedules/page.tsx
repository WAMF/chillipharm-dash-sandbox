'use client';

import { useState } from 'react';
import { useReports } from '../../../../contexts/ReportContext';
import type { ReportCadence, ReportSchedule } from '@cp/types';

const CADENCE_LABELS: Record<ReportCadence, string> = {
    hourly: 'Hourly',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
};

export default function SchedulesPage() {
    const {
        schedules,
        savedTemplates,
        emailLists,
        isLoading,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        runSchedule,
    } = useReports();

    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [runningId, setRunningId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this schedule?')) return;
        setDeletingId(id);
        try {
            await deleteSchedule(id);
        } finally {
            setDeletingId(null);
        }
    };

    const handleRun = async (id: string) => {
        setRunningId(id);
        try {
            await runSchedule(id);
        } finally {
            setRunningId(null);
        }
    };

    const handleToggle = async (schedule: ReportSchedule) => {
        await updateSchedule(schedule.id, { enabled: !schedule.enabled });
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
            {/* Stub banner */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-800">
                    Email delivery is currently being configured — schedules will be tracked but emails will not be sent yet.
                </p>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                    {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}
                </p>
                <button
                    onClick={() => { setEditingSchedule(null); setShowModal(true); }}
                    disabled={savedTemplates.length === 0 || emailLists.length === 0}
                    className="rounded-md bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark disabled:opacity-50 transition-colors"
                    title={savedTemplates.length === 0 ? 'Create a template first' : emailLists.length === 0 ? 'Create an email list first' : ''}
                >
                    Create Schedule
                </button>
            </div>

            {schedules.length === 0 ? (
                <div className="rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
                    <p className="text-sm text-neutral-500">No schedules yet.</p>
                    <p className="mt-1 text-xs text-neutral-400">
                        {savedTemplates.length === 0
                            ? 'Create a report template first, then set up a schedule.'
                            : emailLists.length === 0
                                ? 'Create an email list first, then set up a schedule.'
                                : 'Create one to automate report delivery.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Template</th>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Email List</th>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Cadence</th>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Last Run</th>
                                <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {schedules.map(schedule => (
                                <tr key={schedule.id} className="hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium text-neutral-900">
                                        {schedule.templateName || schedule.savedTemplateId}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">
                                        {schedule.emailListName || schedule.emailListId}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                                            {CADENCE_LABELS[schedule.cadence]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggle(schedule)}
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                schedule.enabled
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-neutral-100 text-neutral-500'
                                            }`}
                                        >
                                            {schedule.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs">
                                        {schedule.lastRunAt
                                            ? new Date(schedule.lastRunAt).toLocaleString()
                                            : 'Never'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleRun(schedule.id)}
                                                disabled={runningId === schedule.id}
                                                className="rounded px-3 py-1.5 text-xs font-medium text-white bg-chilli-red hover:bg-chilli-red-dark disabled:opacity-50 transition-colors"
                                            >
                                                {runningId === schedule.id ? 'Running...' : 'Run Now'}
                                            </button>
                                            <button
                                                onClick={() => { setEditingSchedule(schedule); setShowModal(true); }}
                                                className="rounded px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule.id)}
                                                disabled={deletingId === schedule.id}
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

            {showModal && (
                <ScheduleModal
                    existingSchedule={editingSchedule}
                    templates={savedTemplates}
                    emailLists={emailLists}
                    onClose={() => { setShowModal(false); setEditingSchedule(null); }}
                    onSave={async (data) => {
                        if (editingSchedule) {
                            await updateSchedule(editingSchedule.id, data);
                        } else {
                            await createSchedule(data);
                        }
                        setShowModal(false);
                        setEditingSchedule(null);
                    }}
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Schedule Modal (Create / Edit)
// ---------------------------------------------------------------------------

interface ScheduleModalProps {
    existingSchedule: ReportSchedule | null;
    templates: { id: string; name: string }[];
    emailLists: { id: string; name: string }[];
    onClose: () => void;
    onSave: (data: {
        savedTemplateId: string;
        emailListId: string;
        cadence: ReportCadence;
        enabled?: boolean;
    }) => Promise<void>;
}

function ScheduleModal({ existingSchedule, templates, emailLists, onClose, onSave }: ScheduleModalProps) {
    const [templateId, setTemplateId] = useState(existingSchedule?.savedTemplateId || '');
    const [emailListId, setEmailListId] = useState(existingSchedule?.emailListId || '');
    const [cadence, setCadence] = useState<ReportCadence>(existingSchedule?.cadence || 'daily');
    const [enabled, setEnabled] = useState(existingSchedule?.enabled ?? true);
    const [saving, setSaving] = useState(false);

    const isEditing = !!existingSchedule;

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({ savedTemplateId: templateId, emailListId, cadence, enabled });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[500px] rounded-lg bg-white shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-neutral-900">
                        {isEditing ? 'Edit Schedule' : 'Create Schedule'}
                    </h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4 px-6 py-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">Report Template</label>
                        <select
                            value={templateId}
                            onChange={e => setTemplateId(e.target.value)}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                        >
                            <option value="">Select a template...</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">Email List</label>
                        <select
                            value={emailListId}
                            onChange={e => setEmailListId(e.target.value)}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                        >
                            <option value="">Select an email list...</option>
                            {emailLists.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">Cadence</label>
                        <select
                            value={cadence}
                            onChange={e => setCadence(e.target.value as ReportCadence)}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                        >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={e => setEnabled(e.target.checked)}
                        />
                        {isEditing ? 'Enabled' : 'Enable immediately'}
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !templateId || !emailListId}
                        className="rounded-md bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark disabled:opacity-50 transition-colors"
                    >
                        {saving ? 'Saving...' : isEditing ? 'Update Schedule' : 'Create Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
}
