'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { VSTask } from '@cp/types';

import { useTasks } from '../../../../contexts/TaskContext';
import { useStagedFile } from '../../../../contexts/StagedFileContext';
import { FileDropZone, WorkflowStepper } from '../../../../components/tasks';

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function DownloadIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
        </svg>
    );
}

function HistoryEntry({ label, timestamp }: { label: string; timestamp: string }) {
    return (
        <li className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-neutral-700">{label}</span>
            <span className="text-xs text-neutral-500">
                {new Date(timestamp).toLocaleString()}
            </span>
        </li>
    );
}

function deriveCurrentStep(task: VSTask): number {
    if (task.status === 'done') return 2;
    if (task.status === 'approved') return 2;
    if (task.status === 'qa') return 1;
    return 0;
}

function SourceAssetCards({ task }: { task: VSTask }) {
    if (task.inputs.length === 0) return null;

    return (
        <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-3">
                Source Asset{task.inputs.length !== 1 ? 's' : ''}
            </h3>
            <div className="space-y-2">
                {task.inputs.map((input) => (
                    <div
                        key={input.task_input_id}
                        className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                                {input.asset_name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                                {input.duration && <span>{input.duration}</span>}
                                {input.file_size && (
                                    <span>{formatFileSize(input.file_size)}</span>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = '#';
                                link.download = input.asset_name;
                                link.click();
                            }}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                            title={`Download ${input.asset_name}`}
                        >
                            <DownloadIcon />
                            Download
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function OutputAssetCard({ task }: { task: VSTask }) {
    if (!task.output_file_name) return null;

    return (
        <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-3">
                Output Asset
            </h3>
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                        {task.output_file_name}
                    </p>
                    {task.output_file_size && (
                        <p className="text-xs text-neutral-500">
                            {formatFileSize(task.output_file_size)}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = '#';
                        link.download = task.output_file_name!;
                        link.click();
                    }}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    title={`Download ${task.output_file_name}`}
                >
                    <DownloadIcon />
                    Download
                </button>
            </div>
        </div>
    );
}

function TaskHistory({ task }: { task: VSTask }) {
    return (
        <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-3">
                History
            </h3>
            <div className="rounded-lg border border-neutral-200 bg-white">
                <ul className="divide-y divide-neutral-100">
                    <HistoryEntry
                        label="Task created"
                        timestamp={task.created_at}
                    />
                    {task.qa_rejected_at && (
                        <HistoryEntry
                            label="Returned from QC"
                            timestamp={task.qa_rejected_at}
                        />
                    )}
                    {task.qa_submitted_at && (
                        <HistoryEntry
                            label="Submitted to QC"
                            timestamp={task.qa_submitted_at}
                        />
                    )}
                    {task.qa_approved_at && (
                        <HistoryEntry
                            label="Passed QC"
                            timestamp={task.qa_approved_at}
                        />
                    )}
                    {task.completed_at && (
                        <HistoryEntry
                            label="Delivered"
                            timestamp={task.completed_at}
                        />
                    )}
                </ul>
            </div>
        </div>
    );
}

export default function TaskDetailPage() {
    const params = useParams();
    const taskId = params.taskId as string;

    const {
        selectedTask,
        getTask,
        completeTask,
        submitToQA,
        approveQA,
        rejectQA,
        isLoading,
        error,
    } = useTasks();
    const { stagedFile, clearStagedFile, isStaged } = useStagedFile();

    const [submittingToQA, setSubmittingToQA] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [approvingQA, setApprovingQA] = useState(false);
    const [rejectingQA, setRejectingQA] = useState(false);

    useEffect(() => {
        getTask(taskId);
    }, [taskId, getTask]);

    const task = selectedTask;

    const handleSubmitToQA = async () => {
        if (!stagedFile) return;

        setSubmittingToQA(true);
        try {
            await submitToQA(taskId, stagedFile.file);
            clearStagedFile();
        } catch {
            console.error('Failed to submit to QA');
        } finally {
            setSubmittingToQA(false);
        }
    };

    const handleApproveQA = async () => {
        setApprovingQA(true);
        try {
            await approveQA(taskId);
        } catch {
            console.error('Failed to approve QA');
        } finally {
            setApprovingQA(false);
        }
    };

    const handleRejectQA = async () => {
        setRejectingQA(true);
        try {
            await rejectQA(taskId);
        } catch {
            console.error('Failed to reject QA');
        } finally {
            setRejectingQA(false);
        }
    };

    const handleComplete = async () => {
        setCompleting(true);
        try {
            await completeTask(taskId);
        } catch {
            console.error('Failed to complete task');
        } finally {
            setCompleting(false);
        }
    };

    if (isLoading && !task) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="text-center py-12">
                <h2 className="text-lg font-medium text-neutral-900">
                    Task not found
                </h2>
                <Link
                    href="/tasks"
                    className="mt-4 text-sm text-chilli-red hover:text-chilli-red-dark"
                >
                    Back to tasks
                </Link>
            </div>
        );
    }

    const currentStep = deriveCurrentStep(task);
    const allComplete = task.status === 'done';
    const wasRejected = !!task.qa_rejected_at;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/tasks"
                    className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
                >
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
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to Tasks
                </Link>
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded bg-chilli-red/10 px-2 py-0.5 text-xs font-medium text-chilli-red">
                        {task.workflow_name}
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">
                        {task.source_site_name}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-neutral-900">
                    {task.name}
                </h1>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {task.description && (
                <div className="mb-8 rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                    <p className="text-sm text-neutral-700">{task.description}</p>
                </div>
            )}

            <WorkflowStepper currentStep={currentStep} allComplete={allComplete} />

            {currentStep === 0 && (
                <div className="space-y-6">
                    {wasRejected && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="h-5 w-5 text-red-500 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-red-700">
                                        Returned from QC
                                    </p>
                                    {task.qa_rejected_at && (
                                        <p className="text-xs text-red-600">
                                            Rejected {new Date(task.qa_rejected_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-medium text-neutral-500 mb-3">
                            Output File
                        </h3>
                        <FileDropZone />
                    </div>

                    {isStaged && (
                        <button
                            type="button"
                            onClick={handleSubmitToQA}
                            disabled={submittingToQA}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            {submittingToQA ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting to QC...
                                </>
                            ) : (
                                <>
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
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                        />
                                    </svg>
                                    Submit to QC
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {currentStep === 1 && (
                <div className="space-y-6">
                    <div className="rounded-lg border-2 border-red-400 bg-red-50 p-6">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-red-800">
                                Awaiting QC review
                            </p>
                            {task.qa_submitted_at && (
                                <p className="mt-1 text-xs text-red-600">
                                    Submitted {new Date(task.qa_submitted_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={handleApproveQA}
                                disabled={approvingQA || rejectingQA}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {approvingQA ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
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
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Approve
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectQA}
                                disabled={approvingQA || rejectingQA}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                {rejectingQA ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
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
                                        Reject
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-6">
                    {task.status === 'done' ? (
                        <div className="flex items-center gap-3 rounded-lg border-2 border-green-500 bg-green-50 px-4 py-3">
                            <svg
                                className="h-6 w-6 text-green-500 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm font-medium text-green-700">
                                Delivered to Review/Sponsor Library
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50 p-6 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-emerald-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="mt-3 text-sm font-medium text-emerald-700">
                                    QC review passed
                                </p>
                                {task.qa_approved_at && (
                                    <p className="mt-1 text-xs text-emerald-600">
                                        Approved {new Date(task.qa_approved_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleComplete}
                                disabled={completing}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {completing ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
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
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Complete Task
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-neutral-500 text-center">
                                Files will be delivered to Review/Sponsor Library
                            </p>
                        </>
                    )}
                </div>
            )}

            <div className="mt-8 space-y-6">
                <SourceAssetCards task={task} />
                <OutputAssetCard task={task} />
                <TaskHistory task={task} />
            </div>

        </div>
    );
}
