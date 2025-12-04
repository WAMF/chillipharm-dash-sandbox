'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import type { AssetRecord } from '@cp/types';
import {
    type ReportConfig,
    type ColumnKey,
    COLUMN_DEFINITIONS,
    COLUMN_CATEGORIES,
    DEFAULT_COLUMNS,
    getFileTypes,
    getColumnsByCategory,
    filterRecordsForReport,
    generateExcel,
} from '@cp/data-processing';

interface ReportWizardProps {
    records: AssetRecord[];
    sites: string[];
    trials: string[];
    countries: string[];
    onClose: () => void;
}

const TOTAL_STEPS = 4;

export function ReportWizard({
    records,
    sites,
    trials,
    countries,
    onClose,
}: ReportWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [reportName, setReportName] = useState('Asset Report');
    const [dateRangeStart, setDateRangeStart] = useState('');
    const [dateRangeEnd, setDateRangeEnd] = useState('');

    const [siteFilter, setSiteFilter] = useState<'all' | 'specific'>('all');
    const [selectedSites, setSelectedSites] = useState<string[]>([]);
    const [trialFilter, setTrialFilter] = useState<'all' | 'specific'>('all');
    const [selectedTrials, setSelectedTrials] = useState<string[]>([]);
    const [countryFilter, setCountryFilter] = useState<'all' | 'specific'>(
        'all'
    );
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'specific'>(
        'all'
    );
    const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);

    const [selectedColumns, setSelectedColumns] = useState<Set<ColumnKey>>(
        new Set(DEFAULT_COLUMNS)
    );
    const [generating, setGenerating] = useState(false);

    const fileTypes = useMemo(() => getFileTypes(records), [records]);
    const columnsByCategory = useMemo(() => getColumnsByCategory(), []);

    const config: ReportConfig = useMemo(
        () => ({
            name: reportName,
            dateRange: {
                start: dateRangeStart || null,
                end: dateRangeEnd || null,
            },
            filters: {
                sites: siteFilter === 'all' ? 'all' : selectedSites,
                trials: trialFilter === 'all' ? 'all' : selectedTrials,
                countries: countryFilter === 'all' ? 'all' : selectedCountries,
                fileTypes: fileTypeFilter === 'all' ? 'all' : selectedFileTypes,
            },
            columns: Array.from(selectedColumns),
        }),
        [
            reportName,
            dateRangeStart,
            dateRangeEnd,
            siteFilter,
            selectedSites,
            trialFilter,
            selectedTrials,
            countryFilter,
            selectedCountries,
            fileTypeFilter,
            selectedFileTypes,
            selectedColumns,
        ]
    );

    const filteredRecords = useMemo(
        () => filterRecordsForReport(records, config),
        [records, config]
    );
    const previewRecords = useMemo(
        () => filteredRecords.slice(0, 10),
        [filteredRecords]
    );

    const step1Valid = reportName.trim().length > 0;
    const step3Valid = selectedColumns.size > 0;

    useEffect(() => {
        function handleKeydown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose();
            }
        }
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [onClose]);

    const setDatePreset = useCallback((preset: string) => {
        const today = new Date();
        const endDate = format(today, 'yyyy-MM-dd');

        switch (preset) {
            case '7days':
                setDateRangeStart(format(subDays(today, 7), 'yyyy-MM-dd'));
                setDateRangeEnd(endDate);
                break;
            case '30days':
                setDateRangeStart(format(subDays(today, 30), 'yyyy-MM-dd'));
                setDateRangeEnd(endDate);
                break;
            case '90days':
                setDateRangeStart(format(subDays(today, 90), 'yyyy-MM-dd'));
                setDateRangeEnd(endDate);
                break;
            case '6months':
                setDateRangeStart(format(subMonths(today, 6), 'yyyy-MM-dd'));
                setDateRangeEnd(endDate);
                break;
            case 'all':
                setDateRangeStart('');
                setDateRangeEnd('');
                break;
        }
    }, []);

    const toggleColumn = useCallback((key: ColumnKey) => {
        setSelectedColumns(previous => {
            const next = new Set(previous);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }, []);

    const selectAllColumns = useCallback(() => {
        setSelectedColumns(new Set(COLUMN_DEFINITIONS.map(col => col.key)));
    }, []);

    const deselectAllColumns = useCallback(() => {
        setSelectedColumns(new Set());
    }, []);

    const selectCategoryColumns = useCallback(
        (category: string) => {
            const cols = columnsByCategory.get(category) || [];
            setSelectedColumns(previous => {
                const next = new Set(previous);
                cols.forEach(col => next.add(col.key));
                return next;
            });
        },
        [columnsByCategory]
    );

    const nextStep = useCallback(() => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(previous => previous + 1);
        }
    }, [currentStep]);

    const previousStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(previous => previous - 1);
        }
    }, [currentStep]);

    const downloadReport = useCallback(async () => {
        setGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            generateExcel(filteredRecords, config);
        } finally {
            setGenerating(false);
        }
    }, [filteredRecords, config]);

    const formatDateDisplay = (dateStr: string): string => {
        if (!dateStr) return 'Not set';
        return format(new Date(dateStr), 'dd/MM/yyyy');
    };

    const getColumnLabel = (key: ColumnKey): string => {
        const col = COLUMN_DEFINITIONS.find(c => c.key === key);
        return col?.label || key;
    };

    const toggleSite = (site: string) => {
        setSelectedSites(previous =>
            previous.includes(site)
                ? previous.filter(s => s !== site)
                : [...previous, site]
        );
    };

    const toggleTrial = (trial: string) => {
        setSelectedTrials(previous =>
            previous.includes(trial)
                ? previous.filter(t => t !== trial)
                : [...previous, trial]
        );
    };

    const toggleCountry = (country: string) => {
        setSelectedCountries(previous =>
            previous.includes(country)
                ? previous.filter(c => c !== country)
                : [...previous, country]
        );
    };

    const toggleFileType = (ext: string) => {
        setSelectedFileTypes(previous =>
            previous.includes(ext)
                ? previous.filter(e => e !== ext)
                : [...previous, ext]
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wizard-title"
        >
            <div
                className="bg-white rounded-lg w-full max-w-[800px] max-h-[90vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start p-5 border-b border-neutral-200 bg-neutral-50 rounded-t-lg">
                    <div className="flex-1">
                        <h2
                            id="wizard-title"
                            className="text-lg font-semibold text-neutral-800"
                        >
                            Generate Report
                        </h2>
                        <div className="text-xs text-neutral-500 mt-1">
                            Step {currentStep} of {TOTAL_STEPS}
                        </div>
                    </div>
                    <button
                        className="text-neutral-500 hover:text-neutral-700 text-3xl leading-none ml-4"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <div className="h-1 bg-neutral-200">
                    <div
                        className="h-full bg-chilli-red transition-all duration-300"
                        style={{
                            width: `${(currentStep / TOTAL_STEPS) * 100}%`,
                        }}
                    />
                </div>

                <div className="flex justify-between px-6 py-3 bg-neutral-50 border-b border-neutral-100">
                    <span
                        className={
                            currentStep === 1
                                ? 'text-chilli-red font-medium text-xs'
                                : currentStep > 1
                                  ? 'text-green-600 text-xs'
                                  : 'text-neutral-400 text-xs'
                        }
                    >
                        Configuration
                    </span>
                    <span
                        className={
                            currentStep === 2
                                ? 'text-chilli-red font-medium text-xs'
                                : currentStep > 2
                                  ? 'text-green-600 text-xs'
                                  : 'text-neutral-400 text-xs'
                        }
                    >
                        Filters
                    </span>
                    <span
                        className={
                            currentStep === 3
                                ? 'text-chilli-red font-medium text-xs'
                                : currentStep > 3
                                  ? 'text-green-600 text-xs'
                                  : 'text-neutral-400 text-xs'
                        }
                    >
                        Columns
                    </span>
                    <span
                        className={
                            currentStep === 4
                                ? 'text-chilli-red font-medium text-xs'
                                : 'text-neutral-400 text-xs'
                        }
                    >
                        Preview
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 1 && (
                        <div>
                            <h3 className="text-lg font-medium text-neutral-800 mb-2">
                                Report Configuration
                            </h3>
                            <p className="text-sm text-neutral-500 mb-6">
                                Set the basic report settings and date range.
                            </p>

                            <div className="mb-6">
                                <label
                                    htmlFor="report-name"
                                    className="block text-sm font-medium text-neutral-700 mb-2"
                                >
                                    Report Name
                                </label>
                                <input
                                    id="report-name"
                                    type="text"
                                    value={reportName}
                                    onChange={e =>
                                        setReportName(e.target.value)
                                    }
                                    placeholder="Enter report name"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:border-chilli-red focus:ring-2 focus:ring-chilli-red/10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Date Range
                                </label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {[
                                        {
                                            label: 'Last 7 days',
                                            value: '7days',
                                        },
                                        {
                                            label: 'Last 30 days',
                                            value: '30days',
                                        },
                                        {
                                            label: 'Last 90 days',
                                            value: '90days',
                                        },
                                        {
                                            label: 'Last 6 months',
                                            value: '6months',
                                        },
                                        { label: 'All time', value: 'all' },
                                    ].map(preset => (
                                        <button
                                            key={preset.value}
                                            className="px-3 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-700 hover:bg-neutral-100 hover:border-chilli-red transition-colors"
                                            onClick={() =>
                                                setDatePreset(preset.value)
                                            }
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="date-start"
                                            className="block text-xs text-neutral-500 mb-1"
                                        >
                                            From
                                        </label>
                                        <input
                                            id="date-start"
                                            type="date"
                                            value={dateRangeStart}
                                            onChange={e =>
                                                setDateRangeStart(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="date-end"
                                            className="block text-xs text-neutral-500 mb-1"
                                        >
                                            To
                                        </label>
                                        <input
                                            id="date-end"
                                            type="date"
                                            value={dateRangeEnd}
                                            onChange={e =>
                                                setDateRangeEnd(e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h3 className="text-lg font-medium text-neutral-800 mb-2">
                                Apply Filters
                            </h3>
                            <p className="text-sm text-neutral-500 mb-6">
                                Filter which records to include in the report.
                            </p>

                            <div className="space-y-6">
                                <div className="bg-neutral-50 rounded-md p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-medium text-neutral-800">
                                            Trial
                                        </h4>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="trialFilter"
                                                    checked={
                                                        trialFilter === 'all'
                                                    }
                                                    onChange={() =>
                                                        setTrialFilter('all')
                                                    }
                                                />
                                                All Trials
                                            </label>
                                            <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="trialFilter"
                                                    checked={
                                                        trialFilter ===
                                                        'specific'
                                                    }
                                                    onChange={() =>
                                                        setTrialFilter(
                                                            'specific'
                                                        )
                                                    }
                                                />
                                                Specific Trials
                                            </label>
                                        </div>
                                    </div>
                                    {trialFilter === 'specific' && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto bg-white p-2 rounded">
                                            {trials.map(trial => (
                                                <label
                                                    key={trial}
                                                    className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTrials.includes(
                                                            trial
                                                        )}
                                                        onChange={() =>
                                                            toggleTrial(trial)
                                                        }
                                                    />
                                                    {trial}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-neutral-50 rounded-md p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-medium text-neutral-800">
                                            Site
                                        </h4>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="siteFilter"
                                                    checked={
                                                        siteFilter === 'all'
                                                    }
                                                    onChange={() =>
                                                        setSiteFilter('all')
                                                    }
                                                />
                                                All Sites
                                            </label>
                                            <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="siteFilter"
                                                    checked={
                                                        siteFilter ===
                                                        'specific'
                                                    }
                                                    onChange={() =>
                                                        setSiteFilter(
                                                            'specific'
                                                        )
                                                    }
                                                />
                                                Specific Sites
                                            </label>
                                        </div>
                                    </div>
                                    {siteFilter === 'specific' && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto bg-white p-2 rounded">
                                            {sites.map(site => (
                                                <label
                                                    key={site}
                                                    className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSites.includes(
                                                            site
                                                        )}
                                                        onChange={() =>
                                                            toggleSite(site)
                                                        }
                                                    />
                                                    {site}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-neutral-50 rounded-md p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-medium text-neutral-800">
                                            Country
                                        </h4>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="countryFilter"
                                                    checked={
                                                        countryFilter === 'all'
                                                    }
                                                    onChange={() =>
                                                        setCountryFilter('all')
                                                    }
                                                />
                                                All Countries
                                            </label>
                                            <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="countryFilter"
                                                    checked={
                                                        countryFilter ===
                                                        'specific'
                                                    }
                                                    onChange={() =>
                                                        setCountryFilter(
                                                            'specific'
                                                        )
                                                    }
                                                />
                                                Specific Countries
                                            </label>
                                        </div>
                                    </div>
                                    {countryFilter === 'specific' && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto bg-white p-2 rounded">
                                            {countries.map(country => (
                                                <label
                                                    key={country}
                                                    className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCountries.includes(
                                                            country
                                                        )}
                                                        onChange={() =>
                                                            toggleCountry(
                                                                country
                                                            )
                                                        }
                                                    />
                                                    {country}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-neutral-50 rounded-md p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-medium text-neutral-800">
                                            File Type
                                        </h4>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="fileTypeFilter"
                                                    checked={
                                                        fileTypeFilter === 'all'
                                                    }
                                                    onChange={() =>
                                                        setFileTypeFilter('all')
                                                    }
                                                />
                                                All Types
                                            </label>
                                            <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="fileTypeFilter"
                                                    checked={
                                                        fileTypeFilter ===
                                                        'specific'
                                                    }
                                                    onChange={() =>
                                                        setFileTypeFilter(
                                                            'specific'
                                                        )
                                                    }
                                                />
                                                Specific Types
                                            </label>
                                        </div>
                                    </div>
                                    {fileTypeFilter === 'specific' && (
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto bg-white p-2 rounded">
                                            {fileTypes.map(ext => (
                                                <label
                                                    key={ext}
                                                    className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFileTypes.includes(
                                                            ext
                                                        )}
                                                        onChange={() =>
                                                            toggleFileType(ext)
                                                        }
                                                    />
                                                    .{ext}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h3 className="text-lg font-medium text-neutral-800 mb-2">
                                Select Columns
                            </h3>
                            <p className="text-sm text-neutral-500 mb-6">
                                Choose which columns to include in the report.
                            </p>

                            <div className="flex items-center gap-3 mb-4">
                                <button
                                    className="px-3 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-700 hover:bg-neutral-100"
                                    onClick={selectAllColumns}
                                >
                                    Select All
                                </button>
                                <button
                                    className="px-3 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-700 hover:bg-neutral-100"
                                    onClick={deselectAllColumns}
                                >
                                    Deselect All
                                </button>
                                <span className="text-xs text-neutral-500 ml-auto">
                                    {selectedColumns.size} columns selected
                                </span>
                            </div>

                            <div className="space-y-4">
                                {COLUMN_CATEGORIES.map(category => (
                                    <div
                                        key={category}
                                        className="bg-neutral-50 rounded-md p-4"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-medium text-neutral-700">
                                                {category}
                                            </h4>
                                            <button
                                                className="text-xs text-chilli-red hover:underline"
                                                onClick={() =>
                                                    selectCategoryColumns(
                                                        category
                                                    )
                                                }
                                            >
                                                Select all
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {(
                                                columnsByCategory.get(
                                                    category
                                                ) || []
                                            ).map(col => (
                                                <label
                                                    key={col.key}
                                                    className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedColumns.has(
                                                            col.key
                                                        )}
                                                        onChange={() =>
                                                            toggleColumn(
                                                                col.key
                                                            )
                                                        }
                                                    />
                                                    {col.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div>
                            <h3 className="text-lg font-medium text-neutral-800 mb-2">
                                Preview & Download
                            </h3>
                            <p className="text-sm text-neutral-500 mb-6">
                                Review your report settings and download.
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-neutral-50 rounded-md p-4 text-center">
                                    <div className="text-xl font-semibold text-chilli-red">
                                        {filteredRecords.length.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        Total Records
                                    </div>
                                </div>
                                <div className="bg-neutral-50 rounded-md p-4 text-center">
                                    <div className="text-xl font-semibold text-chilli-red">
                                        {selectedColumns.size}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        Columns
                                    </div>
                                </div>
                                <div className="bg-neutral-50 rounded-md p-4 text-center">
                                    <div className="text-lg font-semibold text-chilli-red">
                                        {dateRangeStart
                                            ? formatDateDisplay(dateRangeStart)
                                            : 'All'}{' '}
                                        -{' '}
                                        {dateRangeEnd
                                            ? formatDateDisplay(dateRangeEnd)
                                            : 'All'}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        Date Range
                                    </div>
                                </div>
                            </div>

                            <div className="bg-neutral-50 rounded-md p-4 mb-6">
                                <h4 className="text-sm font-medium text-neutral-800 mb-3">
                                    Applied Filters
                                </h4>
                                <ul className="text-xs text-neutral-600 space-y-1 list-disc pl-5">
                                    <li>
                                        Trials:{' '}
                                        {trialFilter === 'all'
                                            ? 'All'
                                            : selectedTrials.join(', ')}
                                    </li>
                                    <li>
                                        Sites:{' '}
                                        {siteFilter === 'all'
                                            ? 'All'
                                            : `${selectedSites.length} selected`}
                                    </li>
                                    <li>
                                        Countries:{' '}
                                        {countryFilter === 'all'
                                            ? 'All'
                                            : selectedCountries.join(', ')}
                                    </li>
                                    <li>
                                        File Types:{' '}
                                        {fileTypeFilter === 'all'
                                            ? 'All'
                                            : selectedFileTypes
                                                  .map(t => `.${t}`)
                                                  .join(', ')}
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-neutral-800 mb-3">
                                    Data Preview (First 10 rows,{' '}
                                    {selectedColumns.size} columns)
                                </h4>
                                {previewRecords.length > 0 ? (
                                    <div className="border border-neutral-200 rounded-md overflow-x-auto max-h-72">
                                        <table className="w-full text-xs border-collapse min-w-max">
                                            <thead className="sticky top-0 bg-neutral-100 z-10">
                                                <tr>
                                                    {Array.from(
                                                        selectedColumns
                                                    ).map(colKey => (
                                                        <th
                                                            key={colKey}
                                                            className="text-left py-2 px-3 font-semibold text-neutral-700 border-b-2 border-neutral-300 whitespace-nowrap"
                                                        >
                                                            {getColumnLabel(
                                                                colKey
                                                            )}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewRecords.map(
                                                    (record, index) => (
                                                        <tr
                                                            key={index}
                                                            className="hover:bg-neutral-50"
                                                        >
                                                            {Array.from(
                                                                selectedColumns
                                                            ).map(colKey => (
                                                                <td
                                                                    key={colKey}
                                                                    className="py-2 px-3 border-b border-neutral-100 text-neutral-600 max-w-[200px] truncate"
                                                                >
                                                                    {colKey ===
                                                                        'uploadDate' &&
                                                                    record.uploadDate
                                                                        ? format(
                                                                              record.uploadDate,
                                                                              'dd/MM/yyyy'
                                                                          )
                                                                        : colKey ===
                                                                              'assetLink'
                                                                            ? record.assetLink
                                                                                ? 'Link'
                                                                                : '-'
                                                                            : String(
                                                                                  record[
                                                                                      colKey
                                                                                  ] ||
                                                                                      '-'
                                                                              )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-neutral-500 text-sm">
                                        No records match the selected filters.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between p-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
                    <div>
                        {currentStep > 1 && (
                            <button
                                className="px-5 py-2.5 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                                onClick={previousStep}
                            >
                                Back
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="px-5 py-2.5 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        {currentStep < TOTAL_STEPS ? (
                            <button
                                className="px-5 py-2.5 bg-chilli-red text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={nextStep}
                                disabled={
                                    (currentStep === 1 && !step1Valid) ||
                                    (currentStep === 3 && !step3Valid)
                                }
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                className="px-5 py-2.5 bg-chilli-red text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                                onClick={downloadReport}
                                disabled={
                                    generating || filteredRecords.length === 0
                                }
                            >
                                {generating
                                    ? 'Generating...'
                                    : 'Download Excel'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
