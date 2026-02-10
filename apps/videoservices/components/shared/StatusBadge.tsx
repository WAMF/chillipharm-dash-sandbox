'use client';

import type { TaskStatus } from '@cp/types';

interface StatusBadgeProps {
    status: TaskStatus;
}

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; label: string }> = {
    todo: {
        bg: 'bg-neutral-100',
        text: 'text-neutral-700',
        label: 'Live',
    },
    in_progress: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        label: 'With Video Solutions',
    },
    qa: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'In QC',
    },
    approved: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Passed QC',
    },
    done: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        label: 'Delivered',
    },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const style = STATUS_STYLES[status];

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
        >
            {style.label}
        </span>
    );
}
