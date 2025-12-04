'use client';

import { useMemo, useCallback } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { Chart } from './Chart';

const SUCCESS_GREEN = '#10b981';
const WARNING_ORANGE = '#f59e0b';
const DANGER_RED = '#ef4444';

export function ComplianceMonitoring() {
    const {
        complianceMetrics,
        filteredRecords,
        isLoading,
        setShowAssetList,
        setAssetListTitle,
        setAssetListRecords,
    } = useDashboard();

    const chartData = useMemo(() => {
        if (!complianceMetrics || complianceMetrics.length === 0) {
            return { labels: [], datasets: [] };
        }
        return {
            labels: complianceMetrics.map(c => c.category),
            datasets: [
                {
                    label: 'Compliant',
                    data: complianceMetrics.map(c => c.compliant),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                },
                {
                    label: 'Non-Compliant',
                    data: complianceMetrics.map(c => c.nonCompliant),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                },
                {
                    label: 'Unknown',
                    data: complianceMetrics.map(c => c.unknown),
                    backgroundColor: 'rgba(156, 163, 175, 0.8)',
                },
            ],
        };
    }, [complianceMetrics]);

    const chartOptions = useMemo(
        () => ({
            plugins: {
                title: { display: true, text: 'Compliance Status by Category' },
                legend: { display: true, position: 'bottom' as const },
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true },
            },
        }),
        []
    );

    const getComplianceColor = useCallback((rate: number): string => {
        if (rate >= 90) return SUCCESS_GREEN;
        if (rate >= 70) return WARNING_ORANGE;
        return DANGER_RED;
    }, []);

    const getComplianceBadge = useCallback((rate: number) => {
        if (rate >= 90)
            return {
                label: 'Excellent',
                className: 'bg-green-100 text-green-600',
            };
        if (rate >= 70)
            return {
                label: 'Good',
                className: 'bg-orange-100 text-orange-600',
            };
        return {
            label: 'Needs Attention',
            className: 'bg-red-100 text-red-600',
        };
    }, []);

    const handleComplianceClick = useCallback(
        (category: string, status: 'compliant' | 'non-compliant') => {
            let matchingAssets;
            let title;

            if (category === 'Processing Status') {
                if (status === 'compliant') {
                    matchingAssets = filteredRecords.filter(
                        r => r.processed === 'Yes'
                    );
                    title = 'Processed Assets';
                } else {
                    matchingAssets = filteredRecords.filter(
                        r => r.processed === 'No'
                    );
                    title = 'Unprocessed Assets';
                }
            } else {
                return;
            }

            setAssetListTitle(title);
            setAssetListRecords(matchingAssets);
            setShowAssetList(true);
        },
        [
            filteredRecords,
            setAssetListTitle,
            setAssetListRecords,
            setShowAssetList,
        ]
    );

    const handleChartClick = useCallback(
        (data: { label: string; index: number; value: number }) => {
            const category = complianceMetrics[data.index]?.category;
            if (category) {
                handleComplianceClick(category, 'non-compliant');
            }
        },
        [complianceMetrics, handleComplianceClick]
    );

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-neutral-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-80"></div>
                </div>
            </div>
        );
    }

    if (!complianceMetrics || complianceMetrics.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-neutral-500">
                    No compliance data available.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="mb-2">
                <h2 className="text-xl font-semibold text-neutral-800 mb-1">
                    Compliance Monitoring
                </h2>
                <p className="text-neutral-500 text-sm">
                    Regulatory compliance and data quality metrics
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complianceMetrics.map(metric => {
                    const badge = getComplianceBadge(metric.complianceRate);
                    return (
                        <div
                            key={metric.category}
                            className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-semibold text-neutral-800">
                                    {metric.category}
                                </h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}
                                >
                                    {badge.label}
                                </span>
                            </div>
                            <div
                                className="text-4xl font-bold"
                                style={{
                                    color: getComplianceColor(
                                        metric.complianceRate
                                    ),
                                }}
                            >
                                {metric.complianceRate.toFixed(1)}%
                            </div>
                            <div className="flex flex-col gap-2">
                                <div
                                    className="flex justify-between text-sm cursor-pointer p-1 -mx-1 rounded hover:bg-neutral-100"
                                    onClick={() =>
                                        handleComplianceClick(
                                            metric.category,
                                            'compliant'
                                        )
                                    }
                                    onKeyDown={e =>
                                        e.key === 'Enter' &&
                                        handleComplianceClick(
                                            metric.category,
                                            'compliant'
                                        )
                                    }
                                    tabIndex={0}
                                    role="button"
                                >
                                    <span className="text-neutral-600">
                                        Compliant:
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        {metric.compliant}
                                    </span>
                                </div>
                                <div
                                    className="flex justify-between text-sm cursor-pointer p-1 -mx-1 rounded hover:bg-neutral-100"
                                    onClick={() =>
                                        handleComplianceClick(
                                            metric.category,
                                            'non-compliant'
                                        )
                                    }
                                    onKeyDown={e =>
                                        e.key === 'Enter' &&
                                        handleComplianceClick(
                                            metric.category,
                                            'non-compliant'
                                        )
                                    }
                                    tabIndex={0}
                                    role="button"
                                >
                                    <span className="text-neutral-600">
                                        Non-Compliant:
                                    </span>
                                    <span className="font-semibold text-red-600">
                                        {metric.nonCompliant}
                                    </span>
                                </div>
                                {metric.unknown > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-600">
                                            Unknown:
                                        </span>
                                        <span className="font-semibold text-neutral-400">
                                            {metric.unknown}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="h-2 bg-neutral-200 rounded overflow-hidden">
                                <div
                                    className="h-full transition-all duration-300"
                                    style={{
                                        width: `${metric.complianceRate}%`,
                                        backgroundColor: getComplianceColor(
                                            metric.complianceRate
                                        ),
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <Chart
                    type="bar"
                    data={chartData}
                    options={chartOptions}
                    height="350px"
                    clickable={true}
                    onBarClick={handleChartClick}
                />
            </div>
        </div>
    );
}
