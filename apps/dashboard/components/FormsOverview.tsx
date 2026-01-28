'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormStats, FormRecord } from '@cp/types';
import { useDashboard } from '../contexts/DashboardContext';
import { MetricCard } from './MetricCard';
import { Chart } from './Chart';

const STATUS_LABELS = {
    complete: 'Complete',
    pending: 'Pending',
    not_started: 'Not Started',
} as const;

const STATUS_COLORS = {
    complete: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    not_started: 'bg-neutral-100 text-neutral-700',
} as const;

export function FormsOverview() {
    const { dataLoader } = useDashboard();

    const [formStats, setFormStats] = useState<FormStats | null>(null);
    const [incompleteForms, setIncompleteForms] = useState<FormRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const retryLoad = useCallback(() => {
        setError(null);
        setRetryCount(c => c + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadFormsData() {
            if (!dataLoader) return;

            setIsLoading(true);
            setError(null);

            try {
                const [stats, forms] = await Promise.all([
                    dataLoader.fetchFormStats(),
                    dataLoader.queryForms({ formStatus: 'pending', limit: 10 }),
                ]);

                if (!cancelled) {
                    setFormStats(stats);
                    setIncompleteForms(forms.data);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load forms data:', err);
                    setError('Failed to load forms data');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadFormsData();

        return () => {
            cancelled = true;
        };
    }, [dataLoader, retryCount]);

    const siteChartData = useMemo(() => {
        if (!formStats?.bySite) return null;

        const topSites = formStats.bySite.slice(0, 10);

        return {
            labels: topSites.map(s => s.siteName),
            datasets: [
                {
                    label: 'Complete',
                    data: topSites.map(s => s.complete),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                },
                {
                    label: 'Incomplete',
                    data: topSites.map(s => s.total - s.complete),
                    backgroundColor: 'rgba(251, 191, 36, 0.8)',
                },
            ],
        };
    }, [formStats]);

    const procedureChartData = useMemo(() => {
        if (!formStats?.byProcedureType) return null;

        return {
            labels: formStats.byProcedureType.map(p => p.procedure),
            datasets: [
                {
                    label: 'Completion Rate',
                    data: formStats.byProcedureType.map(p =>
                        p.total > 0 ? Math.round((p.complete / p.total) * 100) : 0
                    ),
                    backgroundColor: 'rgba(200, 16, 46, 0.8)',
                },
            ],
        };
    }, [formStats]);

    const siteChartOptions = useMemo(
        () => ({
            indexAxis: 'y' as const,
            plugins: {
                title: {
                    display: true,
                    text: 'Form Completion by Site',
                },
                legend: {
                    display: true,
                    position: 'bottom' as const,
                },
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                },
                y: {
                    stacked: true,
                },
            },
        }),
        []
    );

    const procedureChartOptions = useMemo(
        () => ({
            indexAxis: 'y' as const,
            plugins: {
                title: {
                    display: true,
                    text: 'Completion Rate by Procedure Type (%)',
                },
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                },
            },
        }),
        []
    );

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-neutral-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-64"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm p-5">
                            <div className="animate-pulse">
                                <div className="h-4 bg-neutral-200 rounded w-24 mb-2"></div>
                                <div className="h-8 bg-neutral-200 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                <span className="text-red-700 text-sm">{error}</span>
                <button
                    onClick={retryLoad}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!formStats) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-neutral-500">No forms data available.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="mb-2">
                <h2 className="text-xl font-semibold text-neutral-800 mb-1">
                    Forms Overview
                </h2>
                <p className="text-neutral-500 text-sm">
                    Form completion status across all sites
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Forms"
                    value={formStats.total.toLocaleString()}
                    subtitle="All procedure forms"
                    icon="📋"
                />

                <MetricCard
                    title="Completion Rate"
                    value={`${formStats.completionRate}%`}
                    subtitle={`${formStats.complete} of ${formStats.total} complete`}
                    icon="✓"
                />

                <MetricCard
                    title="Pending Forms"
                    value={formStats.pending.toLocaleString()}
                    subtitle="Awaiting completion"
                    icon="⏳"
                />

                <MetricCard
                    title="Not Started"
                    value={formStats.notStarted.toLocaleString()}
                    subtitle="Forms not yet begun"
                    icon="📝"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {siteChartData && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <Chart
                            type="bar"
                            data={siteChartData}
                            options={siteChartOptions}
                            height="400px"
                        />
                    </div>
                )}

                {procedureChartData && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <Chart
                            type="bar"
                            data={procedureChartData}
                            options={procedureChartOptions}
                            height="400px"
                        />
                    </div>
                )}
            </div>

            {incompleteForms.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                        Pending Forms
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200">
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-500 uppercase">
                                        Form Name
                                    </th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-500 uppercase">
                                        Site
                                    </th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-500 uppercase">
                                        Subject
                                    </th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-500 uppercase">
                                        Procedure
                                    </th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-500 uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {incompleteForms.map(form => (
                                    <tr
                                        key={form.formId}
                                        className="border-b border-neutral-100 hover:bg-neutral-50"
                                    >
                                        <td className="py-3 px-2 text-sm text-neutral-800">
                                            {form.formName}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-neutral-600">
                                            {form.siteName}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-neutral-600">
                                            {form.subjectNumber}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-neutral-600">
                                            {form.procedureName}
                                        </td>
                                        <td className="py-3 px-2">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[form.formStatus]}`}
                                            >
                                                {STATUS_LABELS[form.formStatus]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
