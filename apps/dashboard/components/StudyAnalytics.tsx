'use client';

import { useMemo, useCallback } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { Chart } from './Chart';

export function StudyAnalytics() {
    const {
        studyArmData,
        studyEventData,
        studyProcedureData,
        procedureLagData,
        commentStats,
        filteredRecords,
        isLoading,
        setShowAssetList,
        setAssetListTitle,
        setAssetListRecords,
    } = useDashboard();

    const armChartData = useMemo(
        () => ({
            labels: studyArmData.map(a => a.arm),
            datasets: [
                {
                    data: studyArmData.map(a => a.count),
                    backgroundColor: [
                        'rgba(200, 16, 46, 0.8)',
                        'rgba(237, 118, 33, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                    ],
                },
            ],
        }),
        [studyArmData]
    );

    const eventChartData = useMemo(
        () => ({
            labels: studyEventData.slice(0, 10).map(e => e.event),
            datasets: [
                {
                    label: 'Total Assets',
                    data: studyEventData.slice(0, 10).map(e => e.count),
                    backgroundColor: 'rgba(200, 16, 46, 0.8)',
                },
                {
                    label: 'Reviewed',
                    data: studyEventData.slice(0, 10).map(e => e.reviewedCount),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                },
            ],
        }),
        [studyEventData]
    );

    const procedureChartData = useMemo(
        () => ({
            labels: studyProcedureData.slice(0, 8).map(p => p.procedure),
            datasets: [
                {
                    label: 'Asset Count',
                    data: studyProcedureData.slice(0, 8).map(p => p.count),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                },
            ],
        }),
        [studyProcedureData]
    );

    const lagChartData = useMemo(
        () => ({
            labels: procedureLagData.slice(0, 8).map(l => l.procedure),
            datasets: [
                {
                    label: 'Avg Days',
                    data: procedureLagData.slice(0, 8).map(l => l.avgLagDays),
                    backgroundColor: procedureLagData
                        .slice(0, 8)
                        .map(l =>
                            l.avgLagDays <= 1
                                ? 'rgba(16, 185, 129, 0.8)'
                                : l.avgLagDays <= 7
                                  ? 'rgba(237, 118, 33, 0.8)'
                                  : 'rgba(200, 16, 46, 0.8)'
                        ),
                },
            ],
        }),
        [procedureLagData]
    );

    const handleArmClick = useCallback(
        (armName: string) => {
            const armAssets = filteredRecords.filter(r => {
                const arm = r.studyArm?.trim() || 'Unassigned';
                return arm === armName;
            });
            setAssetListTitle(`Assets in Study Arm: ${armName}`);
            setAssetListRecords(armAssets);
            setShowAssetList(true);
        },
        [
            filteredRecords,
            setAssetListTitle,
            setAssetListRecords,
            setShowAssetList,
        ]
    );

    const handleProcedureClick = useCallback(
        (procedureName: string) => {
            const procedureAssets = filteredRecords.filter(r => {
                const procedure = r.studyProcedure?.trim() || 'Unknown';
                return procedure === procedureName;
            });
            setAssetListTitle(`Assets for Procedure: ${procedureName}`);
            setAssetListRecords(procedureAssets);
            setShowAssetList(true);
        },
        [
            filteredRecords,
            setAssetListTitle,
            setAssetListRecords,
            setShowAssetList,
        ]
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

    return (
        <div className="flex flex-col gap-6">
            <div className="mb-2">
                <h2 className="text-xl font-semibold text-neutral-800 mb-1">
                    Study Analytics
                </h2>
                <p className="text-neutral-500 text-sm">
                    Treatment arms, study events, and procedure analysis
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                        Treatment Arm Distribution
                    </h3>
                    <Chart
                        type="doughnut"
                        data={armChartData}
                        height="300px"
                        clickable={true}
                        onBarClick={data =>
                            handleArmClick(studyArmData[data.index]?.arm || '')
                        }
                        options={{
                            plugins: { legend: { position: 'bottom' } },
                        }}
                    />
                    <div className="mt-4 flex flex-col gap-2">
                        {studyArmData.map(arm => (
                            <div
                                key={arm.arm}
                                className="flex justify-between text-sm cursor-pointer p-1 -m-1 rounded hover:bg-neutral-100"
                                onClick={() => handleArmClick(arm.arm)}
                            >
                                <span className="text-neutral-700">
                                    {arm.arm}
                                </span>
                                <span className="text-neutral-500 font-medium">
                                    {arm.count} ({arm.percentage.toFixed(1)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                        Assets by Study Event
                    </h3>
                    <Chart
                        type="bar"
                        data={eventChartData}
                        height="300px"
                        options={{
                            indexAxis: 'y' as const,
                            plugins: { legend: { position: 'bottom' } },
                            scales: { x: { beginAtZero: true } },
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                        Procedure Breakdown
                    </h3>
                    <Chart
                        type="bar"
                        data={procedureChartData}
                        height="280px"
                        clickable={true}
                        onBarClick={data =>
                            handleProcedureClick(
                                studyProcedureData.slice(0, 8)[data.index]
                                    ?.procedure || ''
                            )
                        }
                        options={{
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true } },
                        }}
                    />
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50">
                                    <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">
                                        Procedure
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">
                                        Assets
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">
                                        Sites
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold text-neutral-600 border-b border-neutral-200">
                                        Avg Duration
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {studyProcedureData.slice(0, 6).map(proc => (
                                    <tr
                                        key={proc.procedure}
                                        className="cursor-pointer hover:bg-neutral-100"
                                        onClick={() =>
                                            handleProcedureClick(proc.procedure)
                                        }
                                    >
                                        <td className="py-2 px-2 border-b border-neutral-200">
                                            {proc.procedure}
                                        </td>
                                        <td className="py-2 px-2 border-b border-neutral-200">
                                            {proc.count}
                                        </td>
                                        <td className="py-2 px-2 border-b border-neutral-200">
                                            {proc.sites}
                                        </td>
                                        <td className="py-2 px-2 border-b border-neutral-200">
                                            {proc.avgDuration}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                        Upload Lag Analysis
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                        Days between procedure date and video upload
                    </p>
                    {procedureLagData.length > 0 ? (
                        <>
                            <Chart
                                type="bar"
                                data={lagChartData}
                                height="280px"
                                options={{
                                    indexAxis: 'y' as const,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: ctx =>
                                                    `${ctx.parsed.x?.toFixed(1) ?? '0'} days avg lag`,
                                            },
                                        },
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Days',
                                            },
                                        },
                                    },
                                }}
                            />
                            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 bg-green-500 rounded"></span>
                                    ≤1 day
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 bg-orange-500 rounded"></span>
                                    2-7 days
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 bg-red-500 rounded"></span>
                                    &gt;7 days
                                </span>
                            </div>
                        </>
                    ) : (
                        <p className="text-neutral-500 text-sm">
                            No lag data available
                        </p>
                    )}
                </div>
            </div>

            {commentStats && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                        Comments Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-neutral-50 rounded-lg">
                            <div className="text-2xl font-bold text-chilli-red">
                                {commentStats.totalWithComments}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                                Assets with Comments
                            </div>
                        </div>
                        <div className="text-center p-4 bg-neutral-50 rounded-lg">
                            <div className="text-2xl font-bold text-chilli-red">
                                {commentStats.commentRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                                Comment Rate
                            </div>
                        </div>
                        <div className="text-center p-4 bg-neutral-50 rounded-lg">
                            <div className="text-2xl font-bold text-chilli-red">
                                {Math.round(commentStats.avgCommentLength)}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                                Avg Comment Length
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                                Top Commenters
                            </h4>
                            {commentStats.topCommenters
                                .slice(0, 5)
                                .map(commenter => (
                                    <div
                                        key={commenter.name}
                                        className="flex justify-between text-sm py-1 border-b border-neutral-100"
                                    >
                                        <span className="text-neutral-700">
                                            {commenter.name}
                                        </span>
                                        <span className="text-neutral-500">
                                            {commenter.commentCount}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
