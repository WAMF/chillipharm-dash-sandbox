import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import type { AssetRecord, FormRecord, SiteReportRecord } from '@cp/types';

const EXCEL_MAX_CELL_LENGTH = 32767;

export type ReportType = 'asset' | 'form' | 'site';

export interface ReportConfig {
    name: string;
    dateRange: {
        start: string | null;
        end: string | null;
    };
    filters: {
        sites: string[] | 'all';
        fileTypes: string[] | 'all';
        trials: string[] | 'all';
        countries: string[] | 'all';
    };
    columns: ColumnKey[];
}

export type ColumnKey = keyof AssetRecord;

export interface ColumnDefinition {
    key: ColumnKey;
    label: string;
    category: string;
    width: number;
}

export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
    {
        key: 'trialName',
        label: 'Trial Name',
        category: 'Trial Info',
        width: 25,
    },
    { key: 'trialId', label: 'Trial ID', category: 'Trial Info', width: 10 },
    { key: 'siteName', label: 'Site Name', category: 'Site Info', width: 30 },
    { key: 'siteId', label: 'Site ID', category: 'Site Info', width: 10 },
    {
        key: 'siteCountry',
        label: 'Site Country',
        category: 'Site Info',
        width: 15,
    },
    {
        key: 'subjectNumber',
        label: 'Subject Number',
        category: 'Subject Info',
        width: 15,
    },
    {
        key: 'studyArm',
        label: 'Study Arm',
        category: 'Subject Info',
        width: 20,
    },
    {
        key: 'studyEvent',
        label: 'Study Event',
        category: 'Study Info',
        width: 25,
    },
    {
        key: 'studyProcedure',
        label: 'Study Procedure',
        category: 'Study Info',
        width: 25,
    },
    {
        key: 'studyProcedureDate',
        label: 'Procedure Date',
        category: 'Study Info',
        width: 15,
    },
    { key: 'evaluator', label: 'Evaluator', category: 'Study Info', width: 20 },
    { key: 'assetId', label: 'Asset ID', category: 'Asset Info', width: 10 },
    {
        key: 'assetTitle',
        label: 'Asset Title',
        category: 'Asset Info',
        width: 40,
    },
    {
        key: 'uploadDate',
        label: 'Upload Date',
        category: 'Asset Info',
        width: 18,
    },
    {
        key: 'uploadedBy',
        label: 'Uploaded By',
        category: 'Asset Info',
        width: 20,
    },
    {
        key: 'assetDuration',
        label: 'Duration',
        category: 'Asset Info',
        width: 12,
    },
    { key: 'fileSize', label: 'File Size', category: 'Asset Info', width: 12 },
    {
        key: 'processed',
        label: 'Processed',
        category: 'Asset Info',
        width: 12,
    },
    { key: 'comments', label: 'Comments', category: 'Asset Info', width: 50 },
    { key: 'assetLink', label: 'Asset Link', category: 'Links', width: 50 },
];

export type FormColumnKey = keyof FormRecord;

export interface FormColumnDefinition {
    key: FormColumnKey;
    label: string;
    category: string;
    width: number;
}

export const FORM_COLUMN_DEFINITIONS: FormColumnDefinition[] = [
    { key: 'formName', label: 'Form Name', category: 'Form Info', width: 30 },
    { key: 'formId', label: 'Form ID', category: 'Form Info', width: 20 },
    { key: 'formStatus', label: 'Status', category: 'Form Info', width: 15 },
    { key: 'submittedAt', label: 'Submitted At', category: 'Form Info', width: 20 },
    { key: 'siteName', label: 'Site Name', category: 'Site Info', width: 30 },
    { key: 'siteId', label: 'Site ID', category: 'Site Info', width: 10 },
    { key: 'siteCountry', label: 'Country', category: 'Site Info', width: 20 },
    { key: 'subjectNumber', label: 'Subject Number', category: 'Subject Info', width: 15 },
    { key: 'studyArm', label: 'Study Arm', category: 'Subject Info', width: 20 },
    { key: 'eventName', label: 'Event', category: 'Study Info', width: 25 },
    { key: 'procedureName', label: 'Procedure', category: 'Study Info', width: 25 },
    { key: 'procedureDate', label: 'Procedure Date', category: 'Study Info', width: 15 },
];

export const FORM_COLUMN_CATEGORIES = [
    'Form Info',
    'Site Info',
    'Subject Info',
    'Study Info',
];

export const DEFAULT_FORM_COLUMNS: FormColumnKey[] = [
    'formName',
    'formStatus',
    'submittedAt',
    'siteName',
    'subjectNumber',
    'procedureName',
    'procedureDate',
];

export type SiteColumnKey = keyof SiteReportRecord;

export interface SiteColumnDefinition {
    key: SiteColumnKey;
    label: string;
    category: string;
    width: number;
}

export const SITE_COLUMN_DEFINITIONS: SiteColumnDefinition[] = [
    { key: 'siteName', label: 'Site Name', category: 'Site Info', width: 30 },
    { key: 'siteId', label: 'Site ID', category: 'Site Info', width: 10 },
    { key: 'country', label: 'Country', category: 'Site Info', width: 20 },
    { key: 'subjectCount', label: 'Subject Count', category: 'Site Info', width: 15 },
    { key: 'assetCount', label: 'Asset Count', category: 'Asset Stats', width: 15 },
    { key: 'totalForms', label: 'Total Forms', category: 'Form Stats', width: 15 },
    { key: 'completeForms', label: 'Complete Forms', category: 'Form Stats', width: 15 },
    { key: 'formCompletionRate', label: 'Form Completion %', category: 'Form Stats', width: 18 },
    { key: 'totalTasks', label: 'Total Tasks', category: 'Task Stats', width: 15 },
    { key: 'completedTasks', label: 'Completed Tasks', category: 'Task Stats', width: 15 },
    { key: 'taskCompletionRate', label: 'Task Completion %', category: 'Task Stats', width: 18 },
    { key: 'openFlags', label: 'Open Flags', category: 'Flag Stats', width: 12 },
    { key: 'resolvedFlags', label: 'Resolved Flags', category: 'Flag Stats', width: 15 },
];

export const SITE_COLUMN_CATEGORIES = [
    'Site Info',
    'Asset Stats',
    'Form Stats',
    'Task Stats',
    'Flag Stats',
];

export const DEFAULT_SITE_COLUMNS: SiteColumnKey[] = [
    'siteName',
    'country',
    'subjectCount',
    'assetCount',
    'formCompletionRate',
    'taskCompletionRate',
    'openFlags',
];

export const COLUMN_CATEGORIES = [
    'Trial Info',
    'Site Info',
    'Subject Info',
    'Study Info',
    'Asset Info',
    'Links',
];

export const DEFAULT_COLUMNS: ColumnKey[] = [
    'siteName',
    'subjectNumber',
    'studyEvent',
    'studyProcedure',
    'assetTitle',
    'uploadDate',
    'processed',
    'assetLink',
];

function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    try {
        const d =
            typeof date === 'string'
                ? parseISO(date.replace(' UTC', ''))
                : date;
        return format(d, 'dd/MM/yyyy');
    } catch {
        return String(date);
    }
}

function formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '';
    try {
        const d =
            typeof date === 'string'
                ? parseISO(date.replace(' UTC', ''))
                : date;
        return format(d, 'dd/MM/yyyy HH:mm');
    } catch {
        return String(date);
    }
}

function truncateText(text: string): string {
    if (text.length <= EXCEL_MAX_CELL_LENGTH) return text;
    return text.substring(0, EXCEL_MAX_CELL_LENGTH - 3) + '...';
}

function formatCellValue(
    key: ColumnKey,
    value: unknown
): string | number | boolean {
    if (value === null || value === undefined) return '';

    switch (key) {
        case 'uploadDate':
            return formatDateTime(value as Date | string);
        case 'studyProcedureDate':
            return formatDate(value as Date | string);
        default: {
            const result = value as string | number | boolean;
            if (typeof result === 'string') {
                return truncateText(result);
            }
            return result;
        }
    }
}

export function getFileTypes(records: AssetRecord[]): string[] {
    const extensions = records
        .map(r => {
            if (!r.assetTitle) return null;
            const match = r.assetTitle.match(/\.([^.]+)$/);
            return match ? match[1].toLowerCase() : null;
        })
        .filter((ext): ext is string => ext !== null);
    return [...new Set(extensions)].sort();
}

export function filterRecordsForReport(
    records: AssetRecord[],
    config: ReportConfig
): AssetRecord[] {
    return records.filter(record => {
        if (config.dateRange.start) {
            const startDate = new Date(config.dateRange.start);
            const uploadDate =
                record.uploadDate instanceof Date
                    ? record.uploadDate
                    : new Date(record.uploadDate);
            if (uploadDate < startDate) return false;
        }

        if (config.dateRange.end) {
            const endDate = new Date(config.dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            const uploadDate =
                record.uploadDate instanceof Date
                    ? record.uploadDate
                    : new Date(record.uploadDate);
            if (uploadDate > endDate) return false;
        }

        if (config.filters.sites !== 'all' && config.filters.sites.length > 0) {
            if (!config.filters.sites.includes(record.siteName)) return false;
        }

        if (
            config.filters.trials !== 'all' &&
            config.filters.trials.length > 0
        ) {
            if (!config.filters.trials.includes(record.trialName)) return false;
        }

        if (
            config.filters.countries !== 'all' &&
            config.filters.countries.length > 0
        ) {
            if (!config.filters.countries.includes(record.siteCountry))
                return false;
        }

        if (
            config.filters.fileTypes !== 'all' &&
            config.filters.fileTypes.length > 0
        ) {
            const match = record.assetTitle?.match(/\.([^.]+)$/);
            const ext = match ? match[1].toLowerCase() : '';
            if (!config.filters.fileTypes.includes(ext)) return false;
        }

        return true;
    });
}

export function generateExcel(
    records: AssetRecord[],
    config: ReportConfig
): void {
    const selectedColumns = COLUMN_DEFINITIONS.filter(col =>
        config.columns.includes(col.key)
    );

    const headers = selectedColumns.map(col => col.label);

    const data = records.map(record => {
        return selectedColumns.map(col =>
            formatCellValue(col.key, record[col.key])
        );
    });

    const worksheetData = [headers, ...data];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const colWidths = selectedColumns.map(col => ({ wch: col.width }));
    worksheet['!cols'] = colWidths;

    const assetLinkColIndex = selectedColumns.findIndex(
        col => col.key === 'assetLink'
    );
    if (assetLinkColIndex !== -1) {
        records.forEach((record, rowIndex) => {
            if (record.assetLink) {
                const cellRef = XLSX.utils.encode_cell({
                    r: rowIndex + 1,
                    c: assetLinkColIndex,
                });
                if (worksheet[cellRef]) {
                    worksheet[cellRef].l = {
                        Target: record.assetLink,
                        Tooltip: 'View Asset',
                    };
                }
            }
        });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Report');

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `${config.name.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
}

export function getColumnsByCategory(): Map<string, ColumnDefinition[]> {
    const categoryMap = new Map<string, ColumnDefinition[]>();

    for (const category of COLUMN_CATEGORIES) {
        const columns = COLUMN_DEFINITIONS.filter(
            col => col.category === category
        );
        categoryMap.set(category, columns);
    }

    return categoryMap;
}

export function getFormColumnsByCategory(): Map<string, FormColumnDefinition[]> {
    const categoryMap = new Map<string, FormColumnDefinition[]>();

    for (const category of FORM_COLUMN_CATEGORIES) {
        const columns = FORM_COLUMN_DEFINITIONS.filter(
            col => col.category === category
        );
        categoryMap.set(category, columns);
    }

    return categoryMap;
}

export function getSiteColumnsByCategory(): Map<string, SiteColumnDefinition[]> {
    const categoryMap = new Map<string, SiteColumnDefinition[]>();

    for (const category of SITE_COLUMN_CATEGORIES) {
        const columns = SITE_COLUMN_DEFINITIONS.filter(
            col => col.category === category
        );
        categoryMap.set(category, columns);
    }

    return categoryMap;
}

export function generateFormExcel(
    records: FormRecord[],
    columns: FormColumnKey[],
    reportName: string
): void {
    const selectedColumns = FORM_COLUMN_DEFINITIONS.filter(col =>
        columns.includes(col.key)
    );

    const headers = selectedColumns.map(col => col.label);

    const data = records.map(record => {
        return selectedColumns.map(col => {
            const value = record[col.key];
            if (value === null || value === undefined) return '';
            if (col.key === 'submittedAt' && value) {
                return formatDateTime(value as string);
            }
            if (col.key === 'procedureDate' && value) {
                return formatDate(value as string);
            }
            return String(value);
        });
    });

    const worksheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const colWidths = selectedColumns.map(col => ({ wch: col.width }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Report');

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
}

export function generateSiteExcel(
    records: SiteReportRecord[],
    columns: SiteColumnKey[],
    reportName: string
): void {
    const selectedColumns = SITE_COLUMN_DEFINITIONS.filter(col =>
        columns.includes(col.key)
    );

    const headers = selectedColumns.map(col => col.label);

    const data = records.map(record => {
        return selectedColumns.map(col => {
            const value = record[col.key];
            if (value === null || value === undefined) return '';
            if (col.key === 'formCompletionRate' || col.key === 'taskCompletionRate') {
                return `${value}%`;
            }
            return typeof value === 'number' ? value : String(value);
        });
    });

    const worksheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const colWidths = selectedColumns.map(col => ({ wch: col.width }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Site Report');

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
}
