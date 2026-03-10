'use client';

interface FilterGroupProps {
    label: string;
    filterName: string;
    mode: 'all' | 'specific';
    onModeChange: (mode: 'all' | 'specific') => void;
    allLabel: string;
    specificLabel: string;
    items: string[];
    selectedItems: string[];
    onToggle: (item: string) => void;
    formatItem?: (item: string) => string;
    gridCols?: string;
}

export function FilterGroup({
    label,
    filterName,
    mode,
    onModeChange,
    allLabel,
    specificLabel,
    items,
    selectedItems,
    onToggle,
    formatItem,
    gridCols = 'grid-cols-2 md:grid-cols-3',
}: FilterGroupProps) {
    return (
        <div className="bg-neutral-50 rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-neutral-800">
                    {label}
                </h4>
                <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                        <input
                            type="radio"
                            name={filterName}
                            checked={mode === 'all'}
                            onChange={() => onModeChange('all')}
                        />
                        {allLabel}
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                        <input
                            type="radio"
                            name={filterName}
                            checked={mode === 'specific'}
                            onChange={() => onModeChange('specific')}
                        />
                        {specificLabel}
                    </label>
                </div>
            </div>
            {mode === 'specific' && (
                <div className={`grid ${gridCols} gap-2 max-h-32 overflow-y-auto bg-white p-2 rounded`}>
                    {items.map(item => (
                        <label
                            key={item}
                            className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(item)}
                                onChange={() => onToggle(item)}
                            />
                            {formatItem ? formatItem(item) : item}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
