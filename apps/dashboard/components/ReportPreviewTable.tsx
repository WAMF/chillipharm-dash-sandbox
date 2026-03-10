'use client';

import type { GenericColumnDefinition } from '@cp/data-processing';

interface ReportPreviewTableProps {
    rows: Record<string, unknown>[];
    columns: GenericColumnDefinition[];
    selectedColumnKeys: Set<string>;
    totalRows: number;
    maxPreviewRows?: number;
}

export function ReportPreviewTable({
    rows,
    columns,
    selectedColumnKeys,
    totalRows,
    maxPreviewRows = 10,
}: ReportPreviewTableProps) {
    const selectedColumns = columns.filter(col => selectedColumnKeys.has(col.key));
    const previewRows = rows.slice(0, maxPreviewRows);

    return (
        <div>
            <h4 className="text-sm font-medium text-neutral-800 mb-3">
                Data Preview (First {Math.min(previewRows.length, maxPreviewRows)} of{' '}
                {totalRows.toLocaleString()} rows, {selectedColumns.length} columns)
            </h4>
            {previewRows.length > 0 ? (
                <div className="border border-neutral-200 rounded-md overflow-x-auto max-h-72">
                    <table className="w-full text-xs border-collapse min-w-max">
                        <thead className="sticky top-0 bg-neutral-100 z-10">
                            <tr>
                                {selectedColumns.map(col => (
                                    <th
                                        key={col.key}
                                        className="text-left py-2 px-3 font-semibold text-neutral-700 border-b-2 border-neutral-300 whitespace-nowrap"
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {previewRows.map((row, index) => (
                                <tr key={index} className="hover:bg-neutral-50">
                                    {selectedColumns.map(col => (
                                        <td
                                            key={col.key}
                                            className="py-2 px-3 border-b border-neutral-100 text-neutral-600 max-w-[200px] truncate"
                                        >
                                            {String(row[col.key] ?? '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="py-8 text-center text-neutral-500 text-sm">
                    No records match the selected filters.
                </div>
            )}
        </div>
    );
}
