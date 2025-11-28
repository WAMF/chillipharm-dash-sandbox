import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
    filename: string;
    sheetName?: string;
    headers?: string[];
}

export interface ColumnDefinition<T> {
    key: keyof T;
    header: string;
    formatter?: (value: unknown) => string | number;
}

export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    columns: ColumnDefinition<T>[],
    options: ExcelExportOptions
): void {
    const headers = columns.map(col => col.header);
    const rows = data.map(item =>
        columns.map(col => {
            const value = item[col.key];
            return col.formatter ? col.formatter(value) : (value ?? '');
        })
    );

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    const columnWidths = columns.map((col, index) => {
        const maxLength = Math.max(
            col.header.length,
            ...rows.map(row => String(row[index]).length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        options.sheetName || 'Data'
    );

    const filename = options.filename.endsWith('.xlsx')
        ? options.filename
        : `${options.filename}.xlsx`;

    XLSX.writeFile(workbook, filename);
}

export function createWorkbook(): XLSX.WorkBook {
    return XLSX.utils.book_new();
}

export function addSheetToWorkbook<T extends Record<string, unknown>>(
    workbook: XLSX.WorkBook,
    data: T[],
    columns: ColumnDefinition<T>[],
    sheetName: string
): void {
    const headers = columns.map(col => col.header);
    const rows = data.map(item =>
        columns.map(col => {
            const value = item[col.key];
            return col.formatter ? col.formatter(value) : (value ?? '');
        })
    );

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
}

export function downloadWorkbook(
    workbook: XLSX.WorkBook,
    filename: string
): void {
    const finalFilename = filename.endsWith('.xlsx')
        ? filename
        : `${filename}.xlsx`;
    XLSX.writeFile(workbook, finalFilename);
}
