'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApiClient } from '../../hooks/useApiClient';
import type { MockUser } from '../../lib/mock/data';

interface UserPickerDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (user: MockUser) => void;
    onClear: () => void;
    currentAssigneeId?: string;
}

export function UserPickerDialog({
    open,
    onClose,
    onSelect,
    onClear,
    currentAssigneeId,
}: UserPickerDialogProps) {
    const apiClient = useApiClient();
    const [users, setUsers] = useState<MockUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.users.list();
            setUsers(response.users);
        } catch {
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [apiClient]);

    useEffect(() => {
        if (open) {
            setSearchQuery('');
            fetchUsers();
        }
    }, [open, fetchUsers]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const term = searchQuery.toLowerCase();
        return users.filter(
            (u) =>
                u.user_name.toLowerCase().includes(term) ||
                u.user_email.toLowerCase().includes(term)
        );
    }, [users, searchQuery]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />
            <div className="relative z-10 w-96 max-h-[28rem] flex flex-col rounded-xl bg-white shadow-modal">
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-neutral-900">
                        Assign to
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-4 py-2">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-chilli-red focus:outline-none focus:ring-1 focus:ring-chilli-red"
                        autoFocus
                    />
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-chilli-red" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <p className="py-6 text-center text-sm text-neutral-400">
                            No users found
                        </p>
                    ) : (
                        filteredUsers.map((user) => {
                            const isSelected = user.user_id === currentAssigneeId;
                            return (
                                <button
                                    key={user.user_id}
                                    type="button"
                                    onClick={() => onSelect(user)}
                                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                                        isSelected
                                            ? 'bg-chilli-red/5'
                                            : 'hover:bg-neutral-50'
                                    }`}
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chilli-red text-sm font-medium text-white">
                                        {user.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-neutral-900">
                                            {user.user_name}
                                        </p>
                                        <p className="truncate text-xs text-neutral-500">
                                            {user.user_email}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <svg className="h-4 w-4 shrink-0 text-chilli-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {currentAssigneeId && (
                    <div className="border-t border-neutral-200 px-4 py-2">
                        <button
                            type="button"
                            onClick={onClear}
                            className="w-full rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                        >
                            Remove assignment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
