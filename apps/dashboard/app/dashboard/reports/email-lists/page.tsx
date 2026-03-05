'use client';

import { useState } from 'react';
import { useReports } from '../../../../contexts/ReportContext';
import type { EmailList } from '@cp/types';

export default function EmailListsPage() {
    const {
        emailLists,
        isLoading,
        createEmailList,
        updateEmailList,
        deleteEmailList,
    } = useReports();

    const [showModal, setShowModal] = useState(false);
    const [editingList, setEditingList] = useState<EmailList | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this email list? Any associated schedules will be affected.')) return;
        setDeletingId(id);
        try {
            await deleteEmailList(id);
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
                    {emailLists.length} email list{emailLists.length !== 1 ? 's' : ''}
                </p>
                <button
                    onClick={() => { setEditingList(null); setShowModal(true); }}
                    className="rounded-md bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors"
                >
                    Create Email List
                </button>
            </div>

            {emailLists.length === 0 ? (
                <div className="rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
                    <p className="text-sm text-neutral-500">No email lists yet.</p>
                    <p className="mt-1 text-xs text-neutral-400">Create one to use with scheduled reports.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Recipients</th>
                                <th className="px-4 py-3 text-left font-medium text-neutral-600">Created</th>
                                <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {emailLists.map(list => (
                                <tr key={list.id} className="hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium text-neutral-900">{list.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {list.emails.slice(0, 3).map(email => (
                                                <span
                                                    key={email}
                                                    className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                                                >
                                                    {email}
                                                </span>
                                            ))}
                                            {list.emails.length > 3 && (
                                                <span className="text-xs text-neutral-400">
                                                    +{list.emails.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">
                                        {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingList(list); setShowModal(true); }}
                                                className="rounded px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(list.id)}
                                                disabled={deletingId === list.id}
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
                <EmailListModal
                    existingList={editingList}
                    onClose={() => { setShowModal(false); setEditingList(null); }}
                    onSave={async (data) => {
                        if (editingList) {
                            await updateEmailList(editingList.id, data);
                        } else {
                            await createEmailList(data as { name: string; emails: string[] });
                        }
                        setShowModal(false);
                        setEditingList(null);
                    }}
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Email List Modal
// ---------------------------------------------------------------------------

interface EmailListModalProps {
    existingList: EmailList | null;
    onClose: () => void;
    onSave: (data: { name: string; emails: string[] }) => Promise<void>;
}

function EmailListModal({ existingList, onClose, onSave }: EmailListModalProps) {
    const [name, setName] = useState(existingList?.name || '');
    const [emails, setEmails] = useState<string[]>(existingList?.emails || []);
    const [emailInput, setEmailInput] = useState('');
    const [saving, setSaving] = useState(false);

    const addEmail = () => {
        const trimmed = emailInput.trim().toLowerCase();
        if (trimmed && trimmed.includes('@') && !emails.includes(trimmed)) {
            setEmails([...emails, trimmed]);
            setEmailInput('');
        }
    };

    const removeEmail = (email: string) => {
        setEmails(emails.filter(e => e !== email));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEmail();
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({ name, emails });
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
                        {existingList ? 'Edit Email List' : 'Create Email List'}
                    </h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4 px-6 py-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">List Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Trial Reviewers"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">Email Addresses</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={emailInput}
                                onChange={e => setEmailInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter email and press Enter"
                                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-chilli-red focus:outline-none focus:ring-2 focus:ring-chilli-red/10"
                            />
                            <button
                                type="button"
                                onClick={addEmail}
                                className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {emails.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {emails.map(email => (
                                <span
                                    key={email}
                                    className="inline-flex items-center gap-1 rounded-full bg-chilli-red/10 px-3 py-1 text-xs text-chilli-red"
                                >
                                    {email}
                                    <button
                                        type="button"
                                        onClick={() => removeEmail(email)}
                                        className="hover:text-chilli-red-dark"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
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
                        disabled={saving || !name.trim() || emails.length === 0}
                        className="rounded-md bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark disabled:opacity-50 transition-colors"
                    >
                        {saving ? 'Saving...' : existingList ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}
