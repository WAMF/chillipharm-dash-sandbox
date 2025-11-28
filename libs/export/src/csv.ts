export interface CSVExportOptions {
    filename: string;
    delimiter?: string;
    includeHeaders?: boolean;
}

export interface CSVColumnDefinition<T> {
    key: keyof T;
    header: string;
    formatter?: (value: unknown) => string;
}

function escapeCSVValue(value: string, delimiter: string): string {
    if (
        value.includes(delimiter) ||
        value.includes('"') ||
        value.includes('\n')
    ) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    columns: CSVColumnDefinition<T>[],
    options: CSVExportOptions
): void {
    const delimiter = options.delimiter || ',';
    const includeHeaders = options.includeHeaders !== false;
    const lines: string[] = [];

    if (includeHeaders) {
        const headerLine = columns
            .map(col => escapeCSVValue(col.header, delimiter))
            .join(delimiter);
        lines.push(headerLine);
    }

    data.forEach(item => {
        const row = columns.map(col => {
            const value = item[col.key];
            const formattedValue = col.formatter
                ? col.formatter(value)
                : value === null || value === undefined
                  ? ''
                  : String(value);
            return escapeCSVValue(formattedValue, delimiter);
        });
        lines.push(row.join(delimiter));
    });

    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);

    const filename = options.filename.endsWith('.csv')
        ? options.filename
        : `${options.filename}.csv`;
    link.setAttribute('download', filename);

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

export function generateCSVString<T extends Record<string, unknown>>(
    data: T[],
    columns: CSVColumnDefinition<T>[],
    options?: { delimiter?: string; includeHeaders?: boolean }
): string {
    const delimiter = options?.delimiter || ',';
    const includeHeaders = options?.includeHeaders !== false;
    const lines: string[] = [];

    if (includeHeaders) {
        const headerLine = columns
            .map(col => escapeCSVValue(col.header, delimiter))
            .join(delimiter);
        lines.push(headerLine);
    }

    data.forEach(item => {
        const row = columns.map(col => {
            const value = item[col.key];
            const formattedValue = col.formatter
                ? col.formatter(value)
                : value === null || value === undefined
                  ? ''
                  : String(value);
            return escapeCSVValue(formattedValue, delimiter);
        });
        lines.push(row.join(delimiter));
    });

    return lines.join('\n');
}
