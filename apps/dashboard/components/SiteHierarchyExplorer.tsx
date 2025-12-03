'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SitesStats } from '@cp/api-client';
import { useDashboard } from '../contexts/DashboardContext';

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

interface BreadcrumbItem {
    type: 'sites' | 'subjects' | 'events' | 'procedures' | 'assets';
    id?: number;
    label: string;
}

export function SiteHierarchyExplorer() {
    const { dataLoader, isLoading: dashboardLoading } = useDashboard();

    const [stats, setStats] = useState<SitesStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedSite, setSelectedSite] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [subjectsLoading, setSubjectsLoading] = useState(false);

    const [selectedSubject, setSelectedSubject] = useState<{
        id: number;
        number: string;
    } | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [proceduresLoading, setProceduresLoading] = useState(false);

    const [selectedProcedure, setSelectedProcedure] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assetsLoading, setAssetsLoading] = useState(false);

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
                setError(
                    error_ instanceof Error
                        ? error_.message
                        : 'Failed to load statistics'
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, [dataLoader]);

    const handleSiteClick = useCallback(
        async (siteId: number, siteName: string) => {
            if (!dataLoader) return;

            if (selectedSite?.id === siteId) {
                setSelectedSite(null);
                setSubjects([]);
                setSelectedSubject(null);
                setEvents([]);
                setSelectedEvent(null);
                setProcedures([]);
                setSelectedProcedure(null);
                setAssets([]);
                return;
            }

            setSelectedSite({ id: siteId, name: siteName });
            setSelectedSubject(null);
            setEvents([]);
            setSelectedEvent(null);
            setProcedures([]);
            setSelectedProcedure(null);
            setAssets([]);
            setSubjectsLoading(true);

            try {
                const response = await dataLoader.fetchSiteSubjects(
                    siteId,
                    1,
                    100
                );
                setSubjects(response.data);
            } catch (error_) {
                console.error('Failed to load subjects:', error_);
            } finally {
                setSubjectsLoading(false);
            }
        },
        [dataLoader, selectedSite]
    );

    const handleSubjectClick = useCallback(
        async (subjectId: number, subjectNumber: string) => {
            if (!dataLoader || !selectedSite) return;

            if (selectedSubject?.id === subjectId) {
                setSelectedSubject(null);
                setEvents([]);
                setSelectedEvent(null);
                setProcedures([]);
                setSelectedProcedure(null);
                setAssets([]);
                return;
            }

            setSelectedSubject({ id: subjectId, number: subjectNumber });
            setSelectedEvent(null);
            setProcedures([]);
            setSelectedProcedure(null);
            setAssets([]);
            setEventsLoading(true);

            try {
                const response = await dataLoader.fetchSubjectEvents(
                    selectedSite.id,
                    subjectId,
                    1,
                    100
                );
                setEvents(response.data);
            } catch (error_) {
                console.error('Failed to load events:', error_);
            } finally {
                setEventsLoading(false);
            }
        },
        [dataLoader, selectedSite, selectedSubject]
    );

    const handleEventClick = useCallback(
        async (eventId: number, eventName: string) => {
            if (!dataLoader || !selectedSite || !selectedSubject) return;

            if (selectedEvent?.id === eventId) {
                setSelectedEvent(null);
                setProcedures([]);
                setSelectedProcedure(null);
                setAssets([]);
                return;
            }

            setSelectedEvent({ id: eventId, name: eventName });
            setSelectedProcedure(null);
            setAssets([]);
            setProceduresLoading(true);

            try {
                const response = await dataLoader.fetchEventProcedures(
                    selectedSite.id,
                    selectedSubject.id,
                    eventId,
                    1,
                    100
                );
                setProcedures(response.data);
            } catch (error_) {
                console.error('Failed to load procedures:', error_);
            } finally {
                setProceduresLoading(false);
            }
        },
        [dataLoader, selectedSite, selectedSubject, selectedEvent]
    );

    const handleProcedureClick = useCallback(
        async (procedureId: number, procedureName: string) => {
            if (
                !dataLoader ||
                !selectedSite ||
                !selectedSubject ||
                !selectedEvent
            )
                return;

            if (selectedProcedure?.id === procedureId) {
                setSelectedProcedure(null);
                setAssets([]);
                return;
            }

            setSelectedProcedure({ id: procedureId, name: procedureName });
            setAssetsLoading(true);

            try {
                const response = await dataLoader.fetchProcedureAssets(
                    selectedSite.id,
                    selectedSubject.id,
                    selectedEvent.id,
                    procedureId,
                    1,
                    100
                );
                setAssets(response.data);
            } catch (error_) {
                console.error('Failed to load assets:', error_);
            } finally {
                setAssetsLoading(false);
            }
        },
        [
            dataLoader,
            selectedSite,
            selectedSubject,
            selectedEvent,
            selectedProcedure,
        ]
    );

    const breadcrumbs: BreadcrumbItem[] = [{ type: 'sites', label: 'Sites' }];

    if (selectedSite) {
        breadcrumbs.push({
            type: 'subjects',
            id: selectedSite.id,
            label: selectedSite.name,
        });
    }
    if (selectedSubject) {
        breadcrumbs.push({
            type: 'events',
            id: selectedSubject.id,
            label: `Subject ${selectedSubject.number}`,
        });
    }
    if (selectedEvent) {
        breadcrumbs.push({
            type: 'procedures',
            id: selectedEvent.id,
            label: selectedEvent.name,
        });
    }
    if (selectedProcedure) {
        breadcrumbs.push({
            type: 'assets',
            id: selectedProcedure.id,
            label: selectedProcedure.name,
        });
    }

    const handleBreadcrumbClick = (index: number) => {
        if (index === 0) {
            setSelectedSite(null);
            setSubjects([]);
            setSelectedSubject(null);
            setEvents([]);
            setSelectedEvent(null);
            setProcedures([]);
            setSelectedProcedure(null);
            setAssets([]);
        } else if (index === 1 && selectedSite) {
            setSelectedSubject(null);
            setEvents([]);
            setSelectedEvent(null);
            setProcedures([]);
            setSelectedProcedure(null);
            setAssets([]);
        } else if (index === 2 && selectedSubject) {
            setSelectedEvent(null);
            setProcedures([]);
            setSelectedProcedure(null);
            setAssets([]);
        } else if (index === 3 && selectedEvent) {
            setSelectedProcedure(null);
            setAssets([]);
        }
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
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                    <span key={index} className="flex items-center gap-2">
                        {index > 0 && (
                            <span className="text-neutral-400">›</span>
                        )}
                        <button
                            onClick={() => handleBreadcrumbClick(index)}
                            className={`${
                                index === breadcrumbs.length - 1
                                    ? 'text-chilli-red font-medium'
                                    : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            {crumb.label}
                        </button>
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Total Sites
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {stats?.totalSites ?? 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Total Subjects
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {stats?.totalSubjects ?? 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Total Assets
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {(stats?.totalAssets ?? 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Countries
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                        {stats?.countriesDistribution?.length ?? 0}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-neutral-800">
                        Site Hierarchy Explorer
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Navigate: Site → Subjects → Events → Procedures →
                        Assets
                    </p>
                </div>

                <div className="divide-y divide-neutral-200">
                    {!selectedSite &&
                        stats?.assetsPerSite.map(site => (
                            <div
                                key={site.siteId}
                                className="px-6 py-3 hover:bg-neutral-50 cursor-pointer flex items-center justify-between"
                                onClick={() =>
                                    handleSiteClick(site.siteId, site.siteName)
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-neutral-400">▶</span>
                                    <span className="font-medium text-neutral-900">
                                        {site.siteName}
                                    </span>
                                </div>
                                <span className="text-sm text-neutral-500">
                                    {site.count} assets
                                </span>
                            </div>
                        ))}

                    {selectedSite && !selectedSubject && (
                        <>
                            {subjectsLoading ? (
                                <div className="p-6 text-center">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-chilli-red" />
                                </div>
                            ) : subjects.length === 0 ? (
                                <div className="p-6 text-center text-neutral-500">
                                    No subjects found at this site
                                </div>
                            ) : (
                                subjects.map(subject => (
                                    <div
                                        key={subject.id}
                                        className="px-6 py-3 hover:bg-neutral-50 cursor-pointer flex items-center justify-between"
                                        onClick={() =>
                                            handleSubjectClick(
                                                subject.id,
                                                subject.number
                                            )
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-neutral-400">
                                                ▶
                                            </span>
                                            <span className="font-medium text-neutral-900">
                                                Subject {subject.number}
                                            </span>
                                            {subject.arm && (
                                                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                                                    {subject.arm.name}
                                                </span>
                                            )}
                                            {!subject.active && (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-neutral-500">
                                            {subject.stats.eventCount} events,{' '}
                                            {subject.stats.procedureCount}{' '}
                                            procedures
                                        </span>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {selectedSubject && !selectedEvent && (
                        <>
                            {eventsLoading ? (
                                <div className="p-6 text-center">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-chilli-red" />
                                </div>
                            ) : events.length === 0 ? (
                                <div className="p-6 text-center text-neutral-500">
                                    No events found for this subject
                                </div>
                            ) : (
                                events.map(event => (
                                    <div
                                        key={event.id}
                                        className="px-6 py-3 hover:bg-neutral-50 cursor-pointer flex items-center justify-between"
                                        onClick={() =>
                                            handleEventClick(
                                                event.id,
                                                event.name
                                            )
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-neutral-400">
                                                ▶
                                            </span>
                                            <span className="font-medium text-neutral-900">
                                                {event.name}
                                            </span>
                                            {event.date && (
                                                <span className="text-xs text-neutral-500">
                                                    {event.date}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-neutral-500">
                                            {event.stats.procedureCount}{' '}
                                            procedures,{' '}
                                            {event.stats.assetCount} assets
                                        </span>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {selectedEvent && !selectedProcedure && (
                        <>
                            {proceduresLoading ? (
                                <div className="p-6 text-center">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-chilli-red" />
                                </div>
                            ) : procedures.length === 0 ? (
                                <div className="p-6 text-center text-neutral-500">
                                    No procedures found for this event
                                </div>
                            ) : (
                                procedures.map(procedure => (
                                    <div
                                        key={procedure.id}
                                        className="px-6 py-3 hover:bg-neutral-50 cursor-pointer flex items-center justify-between"
                                        onClick={() =>
                                            handleProcedureClick(
                                                procedure.id,
                                                procedure.name
                                            )
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-neutral-400">
                                                ▶
                                            </span>
                                            <span className="font-medium text-neutral-900">
                                                {procedure.name}
                                            </span>
                                            {procedure.date && (
                                                <span className="text-xs text-neutral-500">
                                                    {procedure.date}
                                                </span>
                                            )}
                                            {procedure.locked && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                                    Locked
                                                </span>
                                            )}
                                            {procedure.evaluator && (
                                                <span className="text-xs text-neutral-500">
                                                    {procedure.evaluator.name}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-neutral-500">
                                            {procedure.stats.assetCount} assets
                                        </span>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {selectedProcedure && (
                        <>
                            {assetsLoading ? (
                                <div className="p-6 text-center">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-chilli-red" />
                                </div>
                            ) : assets.length === 0 ? (
                                <div className="p-6 text-center text-neutral-500">
                                    No assets found for this procedure
                                </div>
                            ) : (
                                <table className="min-w-full">
                                    <thead className="bg-neutral-50">
                                        <tr className="text-xs text-neutral-500">
                                            <th className="px-6 py-3 text-left font-semibold uppercase">
                                                Filename
                                            </th>
                                            <th className="px-6 py-3 text-right font-semibold uppercase">
                                                Size
                                            </th>
                                            <th className="px-6 py-3 text-right font-semibold uppercase">
                                                Duration
                                            </th>
                                            <th className="px-6 py-3 text-center font-semibold uppercase">
                                                Processed
                                            </th>
                                            <th className="px-6 py-3 text-center font-semibold uppercase">
                                                Reviewed
                                            </th>
                                            <th className="px-6 py-3 text-right font-semibold uppercase">
                                                Uploaded
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200">
                                        {assets.map(asset => (
                                            <tr
                                                key={asset.id}
                                                className="hover:bg-neutral-50"
                                            >
                                                <td className="px-6 py-3 text-sm text-neutral-900">
                                                    {asset.filename}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-neutral-600 text-right">
                                                    {asset.filesizeFormatted}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-neutral-600 text-right">
                                                    {asset.duration || '-'}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span
                                                        className={
                                                            asset.processed
                                                                ? 'text-green-600'
                                                                : 'text-neutral-400'
                                                        }
                                                    >
                                                        {asset.processed
                                                            ? '✓'
                                                            : '○'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span
                                                        className={
                                                            asset.review
                                                                .reviewed
                                                                ? 'text-green-600'
                                                                : 'text-neutral-400'
                                                        }
                                                    >
                                                        {asset.review.reviewed
                                                            ? '✓'
                                                            : '○'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-neutral-500 text-right">
                                                    {new Date(
                                                        asset.createdAt
                                                    ).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
