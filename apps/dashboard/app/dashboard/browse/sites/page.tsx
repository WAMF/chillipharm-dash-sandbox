'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { SitesStats } from '@cp/api-client';
import type { AssetRecord } from '@cp/types';
import { useDashboard } from '../../../../contexts/DashboardContext';
import { Chart } from '../../../../components/Chart';
import { WorldMap } from '../../../../components/WorldMap';

interface Subject {
    id: number;
    number: string;
    active: boolean;
    arm: { id: number; name: string } | null;
    createdAt: string;
    stats: { eventCount: number; procedureCount: number };
}

interface Event {
    id: number;
    identifier: string;
    name: string;
    date: string;
    status: number;
    stats: { procedureCount: number; assetCount: number };
}

interface Procedure {
    id: number;
    identifier: string;
    name: string;
    date: string;
    status: number;
    locked: boolean;
    evaluator: { name: string } | null;
    stats: { assetCount: number };
}

interface Asset {
    id: number;
    filename: string;
    filesizeFormatted: string;
    duration: string | null;
    processed: boolean;
    createdAt: string;
    review: {
        reviewed: boolean;
        reviewDate: string | null;
    };
}

interface ExpandedState {
    sites: Set<number>;
    subjects: Set<string>;
    events: Set<string>;
}

interface HierarchyContext {
    siteId: number;
    siteName: string;
    subjectId?: number;
    subjectNumber?: string;
    eventId?: number;
    eventName?: string;
}

const CHART_COLORS = [
    'rgba(200, 16, 46, 0.8)',
    'rgba(237, 118, 33, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(139, 92, 246, 0.8)',
];

export default function BrowseSitesPage() {
    const {
        dataLoader,
        isLoading: dashboardLoading,
        countryDistribution,
        filteredRecords,
        setShowAssetList,
        setAssetListTitle,
        setAssetListRecords,
    } = useDashboard();

    const [stats, setStats] = useState<SitesStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expanded, setExpanded] = useState<ExpandedState>({
        sites: new Set(),
        subjects: new Set(),
        events: new Set(),
    });
    const [subjectsCache, setSubjectsCache] = useState<Map<number, Subject[]>>(new Map());
    const [eventsCache, setEventsCache] = useState<Map<string, Event[]>>(new Map());
    const [proceduresCache, setProceduresCache] = useState<Map<string, Procedure[]>>(new Map());
    const [loadingStates, setLoadingStates] = useState<{
        subjects: Set<number>;
        events: Set<string>;
        procedures: Set<string>;
        assets: Set<string>;
    }>({
        subjects: new Set(),
        events: new Set(),
        procedures: new Set(),
        assets: new Set(),
    });

    useEffect(() => {
        async function loadStats() {
            if (!dataLoader) return;

            setIsLoading(true);
            setError(null);

            try {
                const sitesStats = await dataLoader.fetchSitesStats();
                setStats(sitesStats);
            } catch (error_) {
                console.error('Failed to load sites stats:', error_);
                setError(error_ instanceof Error ? error_.message : 'Failed to load statistics');
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, [dataLoader]);

    const handleCountryClick = useCallback(
        (country: string) => {
            const countryAssets = filteredRecords.filter(r => r.siteCountry === country);
            setAssetListTitle(`Assets from: ${country}`);
            setAssetListRecords(countryAssets);
            setShowAssetList(true);
        },
        [filteredRecords, setAssetListTitle, setAssetListRecords, setShowAssetList]
    );

    const handleSiteClick = useCallback(
        (siteId: number, siteName: string) => {
            if (!dataLoader) return;

            setExpanded(prev => {
                const newSites = new Set(prev.sites);
                if (newSites.has(siteId)) {
                    newSites.delete(siteId);
                    return { ...prev, sites: newSites };
                }
                newSites.add(siteId);
                return { ...prev, sites: newSites };
            });

            let shouldFetch = false;
            setSubjectsCache(prev => {
                if (prev.has(siteId)) return prev;
                shouldFetch = true;
                const m = new Map(prev);
                m.set(siteId, []);
                return m;
            });

            if (shouldFetch) {
                setLoadingStates(prev => ({
                    ...prev,
                    subjects: new Set([...prev.subjects, siteId]),
                }));

                dataLoader.fetchSiteSubjects(siteId, 1, 100)
                    .then(response => {
                        setSubjectsCache(prev => new Map(prev).set(siteId, response.data));
                    })
                    .catch(error_ => {
                        console.error('Failed to load subjects:', error_);
                    })
                    .finally(() => {
                        setLoadingStates(prev => {
                            const newSubjects = new Set(prev.subjects);
                            newSubjects.delete(siteId);
                            return { ...prev, subjects: newSubjects };
                        });
                    });
            }
        },
        [dataLoader]
    );

    const handleSubjectClick = useCallback(
        (ctx: HierarchyContext, subjectId: number, subjectNumber: string) => {
            if (!dataLoader) return;

            const key = `${ctx.siteId}-${subjectId}`;

            setExpanded(prev => {
                const newSubjects = new Set(prev.subjects);
                if (newSubjects.has(key)) {
                    newSubjects.delete(key);
                    return { ...prev, subjects: newSubjects };
                }
                newSubjects.add(key);
                return { ...prev, subjects: newSubjects };
            });

            let shouldFetch = false;
            setEventsCache(prev => {
                if (prev.has(key)) return prev;
                shouldFetch = true;
                const m = new Map(prev);
                m.set(key, []);
                return m;
            });

            if (shouldFetch) {
                setLoadingStates(prev => ({
                    ...prev,
                    events: new Set([...prev.events, key]),
                }));

                dataLoader.fetchSubjectEvents(ctx.siteId, subjectId, 1, 100)
                    .then(response => {
                        setEventsCache(prev => new Map(prev).set(key, response.data));
                    })
                    .catch(error_ => {
                        console.error('Failed to load events:', error_);
                    })
                    .finally(() => {
                        setLoadingStates(prev => {
                            const newEvents = new Set(prev.events);
                            newEvents.delete(key);
                            return { ...prev, events: newEvents };
                        });
                    });
            }
        },
        [dataLoader]
    );

    const handleEventClick = useCallback(
        (ctx: HierarchyContext, eventId: number, eventName: string) => {
            if (!dataLoader || !ctx.subjectId) return;

            const key = `${ctx.siteId}-${ctx.subjectId}-${eventId}`;

            setExpanded(prev => {
                const newEvents = new Set(prev.events);
                if (newEvents.has(key)) {
                    newEvents.delete(key);
                    return { ...prev, events: newEvents };
                }
                newEvents.add(key);
                return { ...prev, events: newEvents };
            });

            let shouldFetch = false;
            setProceduresCache(prev => {
                if (prev.has(key)) return prev;
                shouldFetch = true;
                const m = new Map(prev);
                m.set(key, []);
                return m;
            });

            if (shouldFetch) {
                setLoadingStates(prev => ({
                    ...prev,
                    procedures: new Set([...prev.procedures, key]),
                }));

                dataLoader.fetchEventProcedures(ctx.siteId, ctx.subjectId, eventId, 1, 100)
                    .then(response => {
                        setProceduresCache(prev => new Map(prev).set(key, response.data));
                    })
                    .catch(error_ => {
                        console.error('Failed to load procedures:', error_);
                    })
                    .finally(() => {
                        setLoadingStates(prev => {
                            const newProcedures = new Set(prev.procedures);
                            newProcedures.delete(key);
                            return { ...prev, procedures: newProcedures };
                        });
                    });
            }
        },
        [dataLoader]
    );

    const handleProcedureClick = useCallback(
        async (ctx: HierarchyContext, procedure: Procedure) => {
            if (!dataLoader || !ctx.subjectId || !ctx.eventId) return;

            const key = `${ctx.siteId}-${ctx.subjectId}-${ctx.eventId}-${procedure.id}`;

            setLoadingStates(prev => ({
                ...prev,
                assets: new Set([...prev.assets, key]),
            }));

            try {
                const response = await dataLoader.fetchProcedureAssets(
                    ctx.siteId,
                    ctx.subjectId,
                    ctx.eventId,
                    procedure.id,
                    1,
                    100
                );

                const assetRecords: AssetRecord[] = response.data.map((asset: Asset) => ({
                    assetId: asset.id,
                    assetTitle: asset.filename,
                    trialName: '',
                    trialId: 0,
                    siteName: ctx.siteName,
                    siteId: ctx.siteId,
                    siteCountry: '',
                    subjectNumber: ctx.subjectNumber || '',
                    studyArm: '',
                    studyEvent: ctx.eventName || '',
                    studyProcedure: procedure.name,
                    studyProcedureDate: procedure.date || '',
                    uploadDate: new Date(asset.createdAt),
                    uploadedBy: '',
                    assetDuration: asset.duration || '',
                    fileSize: asset.filesizeFormatted,
                    processed: asset.processed ? 'Yes' : 'No',
                    reviewed: asset.review.reviewed,
                    reviewedBy: '',
                    reviewedDate: asset.review.reviewDate || '',
                    evaluator: procedure.evaluator?.name || '',
                    comments: '',
                    assetLink: '',
                }));

                setAssetListTitle(
                    `${ctx.siteName} > Subject ${ctx.subjectNumber} > ${ctx.eventName} > ${procedure.name}`
                );
                setAssetListRecords(assetRecords);
                setShowAssetList(true);
            } catch (error_) {
                console.error('Failed to load assets:', error_);
                setAssetListTitle('Failed to load assets');
                setAssetListRecords([]);
                setShowAssetList(true);
            } finally {
                setLoadingStates(prev => {
                    const newAssets = new Set(prev.assets);
                    newAssets.delete(key);
                    return { ...prev, assets: newAssets };
                });
            }
        },
        [dataLoader, setAssetListTitle, setAssetListRecords, setShowAssetList]
    );

    const chartData = useMemo(() => {
        if (!stats || stats.assetsPerSite.length === 0) {
            return { labels: [], datasets: [] };
        }
        const topSites = stats.assetsPerSite.slice(0, 5);
        return {
            labels: topSites.map(s => s.siteName.substring(0, 20)),
            datasets: [
                {
                    label: 'Assets',
                    data: topSites.map(s => s.count),
                    backgroundColor: CHART_COLORS,
                },
            ],
        };
    }, [stats]);

    const handleChartClick = useCallback(
        (data: { label: string; index: number; value: number }) => {
            if (!stats) return;
            const site = stats.assetsPerSite[data.index];
            if (site) {
                handleSiteClick(site.siteId, site.siteName);
                document.getElementById('sites-explorer')?.scrollIntoView({ behavior: 'smooth' });
            }
        },
        [stats, handleSiteClick]
    );

    const renderSubjects = (siteId: number, siteName: string) => {
        const subjects = subjectsCache.get(siteId) || [];
        const isLoadingSubjects = loadingStates.subjects.has(siteId);

        if (isLoadingSubjects) {
            return (
                <tr>
                    <td colSpan={2} className="pl-12 py-3">
                        <div className="flex items-center gap-2 text-neutral-500 text-sm">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-chilli-red" />
                            Loading subjects...
                        </div>
                    </td>
                </tr>
            );
        }

        if (subjects.length === 0) {
            return (
                <tr>
                    <td colSpan={2} className="pl-12 py-3 text-neutral-500 text-sm">
                        No subjects found
                    </td>
                </tr>
            );
        }

        const ctx: HierarchyContext = { siteId, siteName };

        return subjects.map(subject => {
            const subjectKey = `${siteId}-${subject.id}`;
            const isExpanded = expanded.subjects.has(subjectKey);

            return (
                <React.Fragment key={subject.id}>
                    <tr
                        className="hover:bg-neutral-50 cursor-pointer"
                        onClick={() => handleSubjectClick(ctx, subject.id, subject.number)}
                    >
                        <td className="pl-12 py-3 text-sm">
                            <span className="flex items-center gap-2">
                                <span className={`text-neutral-400 transition-transform text-xs ${isExpanded ? 'rotate-90' : ''}`}>
                                    ▶
                                </span>
                                <span className="font-medium text-neutral-800">Subject {subject.number}</span>
                                {subject.arm && (
                                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                                        {subject.arm.name}
                                    </span>
                                )}
                            </span>
                        </td>
                        <td className="py-3 pr-6 text-sm text-neutral-500 text-right">
                            {subject.stats.eventCount} events
                        </td>
                    </tr>
                    {isExpanded && renderEvents({ ...ctx, subjectId: subject.id, subjectNumber: subject.number }, subjectKey)}
                </React.Fragment>
            );
        });
    };

    const renderEvents = (ctx: HierarchyContext, subjectKey: string) => {
        const events = eventsCache.get(subjectKey) || [];
        const isLoadingEvents = loadingStates.events.has(subjectKey);

        if (isLoadingEvents) {
            return (
                <tr>
                    <td colSpan={2} className="pl-20 py-3">
                        <div className="flex items-center gap-2 text-neutral-500 text-sm">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-chilli-red" />
                            Loading events...
                        </div>
                    </td>
                </tr>
            );
        }

        if (events.length === 0) {
            return (
                <tr>
                    <td colSpan={2} className="pl-20 py-3 text-neutral-500 text-sm">
                        No events found
                    </td>
                </tr>
            );
        }

        return events.map(event => {
            const eventKey = `${subjectKey}-${event.id}`;
            const isExpanded = expanded.events.has(eventKey);

            return (
                <React.Fragment key={event.id}>
                    <tr
                        className="hover:bg-neutral-50 cursor-pointer"
                        onClick={() => handleEventClick(ctx, event.id, event.name)}
                    >
                        <td className="pl-20 py-3 text-sm">
                            <span className="flex items-center gap-2">
                                <span className={`text-neutral-400 transition-transform text-xs ${isExpanded ? 'rotate-90' : ''}`}>
                                    ▶
                                </span>
                                <span className="font-medium text-neutral-800">{event.name}</span>
                                {event.date && <span className="text-xs text-neutral-500">{event.date}</span>}
                            </span>
                        </td>
                        <td className="py-3 pr-6 text-sm text-neutral-500 text-right">
                            {event.stats.assetCount} assets
                        </td>
                    </tr>
                    {isExpanded && renderProcedures({ ...ctx, eventId: event.id, eventName: event.name }, eventKey)}
                </React.Fragment>
            );
        });
    };

    const renderProcedures = (ctx: HierarchyContext, eventKey: string) => {
        const procedures = proceduresCache.get(eventKey) || [];
        const isLoadingProcedures = loadingStates.procedures.has(eventKey);

        if (isLoadingProcedures) {
            return (
                <tr>
                    <td colSpan={2} className="pl-28 py-3">
                        <div className="flex items-center gap-2 text-neutral-500 text-sm">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-chilli-red" />
                            Loading procedures...
                        </div>
                    </td>
                </tr>
            );
        }

        if (procedures.length === 0) {
            return (
                <tr>
                    <td colSpan={2} className="pl-28 py-3 text-neutral-500 text-sm">
                        No procedures found
                    </td>
                </tr>
            );
        }

        return procedures.map(procedure => {
            const procedureKey = `${eventKey}-${procedure.id}`;
            const isLoadingAssets = loadingStates.assets.has(procedureKey);

            return (
                <tr
                    key={procedure.id}
                    className="hover:bg-neutral-50 cursor-pointer"
                    onClick={() => handleProcedureClick(ctx, procedure)}
                >
                    <td className="pl-28 py-3 text-sm">
                        <span className="flex items-center gap-2">
                            {isLoadingAssets ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-chilli-red" />
                            ) : (
                                <span className="text-chilli-red text-xs">●</span>
                            )}
                            <span className="font-medium text-neutral-800">{procedure.name}</span>
                            {procedure.locked && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Locked</span>
                            )}
                        </span>
                    </td>
                    <td className="py-3 pr-6 text-sm text-neutral-500 text-right">
                        {procedure.stats.assetCount} assets
                    </td>
                </tr>
            );
        });
    };

    if (dashboardLoading || isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chilli-red" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-500">
                    {stats?.totalSites ?? 0} sites · {stats?.totalAssets ?? 0} assets
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-sm font-semibold text-neutral-700 mb-3">Geographic Distribution</h4>
                    <WorldMap countryData={countryDistribution} onCountryClick={handleCountryClick} />
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-sm font-semibold text-neutral-700 mb-1">Top Sites by Assets</h4>
                    <p className="text-xs text-neutral-500 mb-3">Click to expand in explorer</p>
                    {stats && stats.assetsPerSite.length > 0 ? (
                        <Chart
                            type="bar"
                            data={chartData}
                            height="250px"
                            clickable={true}
                            onBarClick={handleChartClick}
                            options={{
                                indexAxis: 'y' as const,
                                plugins: { legend: { display: false } },
                                scales: { x: { beginAtZero: true } },
                            }}
                        />
                    ) : (
                        <div className="p-8 text-center text-neutral-500">No sites found</div>
                    )}
                </div>
            </div>

            <div id="sites-explorer" className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-neutral-200">
                    <h4 className="text-sm font-semibold text-neutral-700">Site Explorer</h4>
                    <p className="text-xs text-neutral-500 mt-1">
                        Site → Subject → Event → Procedure. Click a procedure to view assets.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    {!stats || stats.assetsPerSite.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">No sites found</div>
                    ) : (
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Count
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                                {stats.assetsPerSite.map(site => {
                                    const isExpanded = expanded.sites.has(site.siteId);
                                    return (
                                        <React.Fragment key={site.siteId}>
                                            <tr
                                                className={`hover:bg-neutral-50 cursor-pointer ${isExpanded ? 'bg-chilli-red/5' : ''}`}
                                                onClick={() => handleSiteClick(site.siteId, site.siteName)}
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                                                    <span className="flex items-center gap-2">
                                                        <span className={`text-neutral-400 transition-transform text-xs ${isExpanded ? 'rotate-90' : ''}`}>
                                                            ▶
                                                        </span>
                                                        {site.siteName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-neutral-600 text-right">
                                                    {site.count.toLocaleString()} assets
                                                </td>
                                            </tr>
                                            {isExpanded && renderSubjects(site.siteId, site.siteName)}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
