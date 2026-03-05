'use client';

import { useMemo } from 'react';
import type { GenericColumnDefinition } from '@cp/data-processing';

interface ColumnPickerProps {
    columns: GenericColumnDefinition[];
    categories: string[];
    selectedColumns: Set<string>;
    onSelectionChange: (selected: Set<string>) => void;
}

export function ColumnPicker({
    columns,
    categories,
    selectedColumns,
    onSelectionChange,
}: ColumnPickerProps) {
    const columnsByCategory = useMemo(() => {
        const map = new Map<string, GenericColumnDefinition[]>();
        for (const cat of categories) {
            map.set(cat, columns.filter(c => c.category === cat));
        }
        return map;
    }, [columns, categories]);

    const toggleColumn = (key: string) => {
        const next = new Set(selectedColumns);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        onSelectionChange(next);
    };

    const selectAll = () => {
        onSelectionChange(new Set(columns.map(c => c.key)));
    };

    const deselectAll = () => {
        onSelectionChange(new Set());
    };

    const selectCategory = (category: string) => {
        const next = new Set(selectedColumns);
        const catColumns = columnsByCategory.get(category) || [];
        for (const col of catColumns) {
            next.add(col.key);
        }
        onSelectionChange(next);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">
                    {selectedColumns.size} of {columns.length} columns selected
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={selectAll}
                        className="text-xs text-chilli-red hover:text-chilli-red-dark"
                    >
                        Select All
                    </button>
                    <button
                        type="button"
                        onClick={deselectAll}
                        className="text-xs text-neutral-500 hover:text-neutral-700"
                    >
                        Deselect All
                    </button>
                </div>
            </div>

            {categories.map(category => {
                const catColumns = columnsByCategory.get(category) || [];
                if (catColumns.length === 0) return null;

                return (
                    <div key={category}>
                        <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                {category}
                            </h4>
                            <button
                                type="button"
                                onClick={() => selectCategory(category)}
                                className="text-xs text-chilli-red hover:text-chilli-red-dark"
                            >
                                Select all
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 md:grid-cols-3">
                            {catColumns.map(col => (
                                <label
                                    key={col.key}
                                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns.has(col.key)}
                                        onChange={() => toggleColumn(col.key)}
                                    />
                                    {col.label}
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
