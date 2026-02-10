'use client';

import { useCallback, useState } from 'react';

interface StagedInputFile {
    id: string;
    file: File;
    name: string;
    size: number;
}

interface InputDropZoneProps {
    onFilesAdded: (files: StagedInputFile[]) => void;
    disabled?: boolean;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function InputDropZone({ onFilesAdded, disabled }: InputDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [stagedFiles, setStagedFiles] = useState<StagedInputFile[]>([]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const processFiles = useCallback((fileList: FileList) => {
        const newFiles: StagedInputFile[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.type.startsWith('video/')) {
                newFiles.push({
                    id: `staged-${Date.now()}-${i}`,
                    file,
                    name: file.name,
                    size: file.size,
                });
            }
        }
        if (newFiles.length > 0) {
            setStagedFiles(prev => [...prev, ...newFiles]);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (disabled) return;

            processFiles(e.dataTransfer.files);
        },
        [disabled, processFiles]
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                processFiles(e.target.files);
            }
            e.target.value = '';
        },
        [processFiles]
    );

    const handleRemoveStaged = useCallback((id: string) => {
        setStagedFiles(prev => prev.filter(f => f.id !== id));
    }, []);

    const handleAddAll = useCallback(() => {
        if (stagedFiles.length > 0) {
            onFilesAdded(stagedFiles);
            setStagedFiles([]);
        }
    }, [stagedFiles, onFilesAdded]);

    const handleClearAll = useCallback(() => {
        setStagedFiles([]);
    }, []);

    if (disabled) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    isDragging
                        ? 'border-chilli-red bg-chilli-red/5'
                        : 'border-neutral-300 hover:border-neutral-400'
                }`}
            >
                <svg
                    className="mx-auto h-10 w-10 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                </svg>
                <p className="mt-3 text-sm font-medium text-neutral-900">
                    {isDragging
                        ? 'Drop video files here'
                        : 'Drag and drop video files'}
                </p>
                <p className="mt-1 text-xs text-neutral-500">or</p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors">
                    Browse files
                    <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>
            </div>

            {stagedFiles.length > 0 && (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-neutral-700">
                            {stagedFiles.length} file{stagedFiles.length !== 1 ? 's' : ''} ready to add
                        </p>
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-xs text-neutral-500 hover:text-neutral-700"
                        >
                            Clear all
                        </button>
                    </div>
                    <div className="space-y-2 mb-4">
                        {stagedFiles.map(file => (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 bg-white rounded-md border border-neutral-200 p-2"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-chilli-red/10">
                                    <svg
                                        className="h-4 w-4 text-chilli-red"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveStaged(file.id)}
                                    className="text-neutral-400 hover:text-red-500"
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddAll}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-chilli-red px-4 py-2 text-sm font-medium text-white hover:bg-chilli-red-dark transition-colors"
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
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Add {stagedFiles.length} File{stagedFiles.length !== 1 ? 's' : ''} as Inputs
                    </button>
                </div>
            )}
        </div>
    );
}
