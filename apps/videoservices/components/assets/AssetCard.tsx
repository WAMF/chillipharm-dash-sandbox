'use client';

import type { VSAsset } from '@cp/types';

interface AssetCardProps {
    asset: VSAsset;
    selected: boolean;
    onToggle: () => void;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function AssetCard({ asset, selected, onToggle }: AssetCardProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`relative flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                selected
                    ? 'border-chilli-red bg-chilli-red/5 ring-1 ring-chilli-red'
                    : 'border-neutral-200 hover:border-neutral-300'
            }`}
        >
            <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    selected
                        ? 'border-chilli-red bg-chilli-red'
                        : 'border-neutral-300'
                }`}
            >
                {selected && (
                    <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                    {asset.name}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                    {asset.duration && <span>{asset.duration}</span>}
                    <span>{formatFileSize(asset.file_size)}</span>
                    <span>
                        {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                </div>
                {asset.metadata && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {typeof asset.metadata.subject_id === 'string' && (
                            <span className="inline-flex rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">
                                {asset.metadata.subject_id}
                            </span>
                        )}
                        {typeof asset.metadata.visit_type === 'string' && (
                            <span className="inline-flex rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">
                                {asset.metadata.visit_type}
                            </span>
                        )}
                        {typeof asset.metadata.Assessment === 'string' && (
                            <span className="inline-flex rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">
                                {asset.metadata.Assessment}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </button>
    );
}
