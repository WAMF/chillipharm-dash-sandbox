'use client';

import { useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { useDashboard } from '../contexts/DashboardContext';

function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    try {
        const d = typeof date === 'string' ? parseISO(date) : date;
        return format(d, 'dd/MM/yyyy HH:mm');
    } catch {
        return '-';
    }
}

function formatDateOnly(date: string | null | undefined): string {
    if (!date) return '-';
    try {
        return format(parseISO(date), 'dd/MM/yyyy');
    } catch {
        return date;
    }
}

export function AssetDetailModal() {
    const { selectedAsset, setSelectedAsset } = useDashboard();

    const handleClose = useCallback(() => {
        setSelectedAsset(null);
    }, [setSelectedAsset]);

    const handleViewAsset = useCallback(() => {
        if (selectedAsset?.assetLink) {
            window.open(
                selectedAsset.assetLink,
                '_blank',
                'noopener,noreferrer'
            );
        }
    }, [selectedAsset]);

    useEffect(() => {
        function handleKeydown(e: KeyboardEvent) {
            if (e.key === 'Escape' && selectedAsset) {
                handleClose();
            }
        }
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [selectedAsset, handleClose]);

    if (!selectedAsset) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-white rounded-lg w-full max-w-[800px] max-h-[90vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start p-5 border-b border-neutral-200 bg-neutral-50 rounded-t-lg">
                    <div className="flex-1 min-w-0">
                        <h2
                            id="modal-title"
                            className="text-lg font-semibold text-neutral-800 break-words"
                        >
                            {selectedAsset.assetTitle || 'Asset Details'}
                        </h2>
                        <span className="text-xs text-neutral-500 mt-1 block">
                            ID: {selectedAsset.assetId}
                        </span>
                    </div>
                    <button
                        className="text-neutral-500 hover:text-neutral-700 text-3xl leading-none ml-4 flex-shrink-0"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-neutral-50 rounded-md p-4">
                            <h3 className="text-xs font-semibold text-chilli-red uppercase tracking-wide mb-3 pb-2 border-b border-neutral-200">
                                Trial & Site
                            </h3>
                            <dl className="space-y-0">
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100 last:border-0">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Trial
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.trialName || '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100 last:border-0">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Site
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.siteName || '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Country
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.siteCountry || '-'}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section className="bg-neutral-50 rounded-md p-4">
                            <h3 className="text-xs font-semibold text-chilli-red uppercase tracking-wide mb-3 pb-2 border-b border-neutral-200">
                                Subject & Study
                            </h3>
                            <dl className="space-y-0">
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Subject Number
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.subjectNumber || '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Study Arm
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.studyArm || '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Study Event
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.studyEvent || '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Procedure
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.studyProcedure || '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Procedure Date
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {formatDateOnly(
                                            selectedAsset.studyProcedureDate
                                        )}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Evaluator
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.evaluator || '-'}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section className="bg-neutral-50 rounded-md p-4">
                            <h3 className="text-xs font-semibold text-chilli-red uppercase tracking-wide mb-3 pb-2 border-b border-neutral-200">
                                Upload Info
                            </h3>
                            <dl className="space-y-0">
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Upload Date
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {formatDate(selectedAsset.uploadDate)}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Uploaded By
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.uploadedBy || '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Duration
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.assetDuration || '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-start py-1.5 gap-2">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        File Size
                                    </dt>
                                    <dd className="text-sm text-neutral-800 text-right break-words">
                                        {selectedAsset.fileSize || '-'}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section className="bg-neutral-50 rounded-md p-4">
                            <h3 className="text-xs font-semibold text-chilli-red uppercase tracking-wide mb-3 pb-2 border-b border-neutral-200">
                                Review Status
                            </h3>
                            <dl className="space-y-0">
                                <div className="flex justify-between items-start py-1.5 gap-2 border-b border-neutral-100">
                                    <dt className="text-xs text-neutral-500 flex-shrink-0">
                                        Processed
                                    </dt>
                                    <dd>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                selectedAsset.processed ===
                                                'Yes'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                            }`}
                                        >
                                            {selectedAsset.processed || 'No'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    </div>

                    {selectedAsset.comments && (
                        <section className="mt-6 bg-neutral-50 rounded-md p-4">
                            <h3 className="text-xs font-semibold text-chilli-red uppercase tracking-wide mb-3 pb-2 border-b border-neutral-200">
                                Comments
                            </h3>
                            <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                                {selectedAsset.comments}
                            </div>
                        </section>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
                    <button
                        className="px-5 py-2.5 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                        onClick={handleClose}
                    >
                        Close
                    </button>
                    {selectedAsset.assetLink && (
                        <button
                            className="px-5 py-2.5 bg-chilli-red text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-2"
                            onClick={handleViewAsset}
                        >
                            <span>↗</span>
                            View Asset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
