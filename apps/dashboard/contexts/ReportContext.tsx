'use client';

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react';
import type {
    SavedReportTemplate,
    SavedReportFilters,
    EmailList,
    ReportSchedule,
    ReportRowEntity,
    ReportCadence,
} from '@cp/types';
import { generateReportExcel } from '@cp/data-processing';
import { useAuth } from '@cp/firebase';
import { createDataLoader } from '@cp/api-client';

const API_BASE_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://europe-west2-chillipharm-dashboard.cloudfunctions.net/api'
        : process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5002/chillipharm-dashboard/europe-west2/api';

interface ReportContextValue {
    savedTemplates: SavedReportTemplate[];
    emailLists: EmailList[];
    schedules: ReportSchedule[];
    isLoading: boolean;
    error: string | null;
    refreshTemplates: () => Promise<void>;
    refreshEmailLists: () => Promise<void>;
    refreshSchedules: () => Promise<void>;
    createTemplate: (template: {
        name: string;
        description: string;
        baseTemplateId: string;
        rowEntity: ReportRowEntity;
        columns: string[];
        filters: SavedReportFilters;
    }) => Promise<void>;
    updateTemplate: (id: string, template: Partial<{
        name: string;
        description: string;
        columns: string[];
        filters: SavedReportFilters;
    }>) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    createEmailList: (list: { name: string; emails: string[] }) => Promise<void>;
    updateEmailList: (id: string, list: { name?: string; emails?: string[] }) => Promise<void>;
    deleteEmailList: (id: string) => Promise<void>;
    createSchedule: (schedule: {
        savedTemplateId: string;
        emailListId: string;
        cadence: ReportCadence;
        enabled?: boolean;
    }) => Promise<void>;
    updateSchedule: (id: string, patch: Partial<{
        cadence: ReportCadence;
        emailListId: string;
        enabled: boolean;
    }>) => Promise<void>;
    deleteSchedule: (id: string) => Promise<void>;
    runSchedule: (id: string) => Promise<void>;
    runReport: (template: SavedReportTemplate) => Promise<void>;
    isRunning: boolean;
}

const ReportContext = createContext<ReportContextValue | null>(null);

export function useReports(): ReportContextValue {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error('useReports must be used within a ReportProvider');
    }
    return context;
}

export function ReportProvider({ children }: { children: ReactNode }) {
    const { user, getIdToken } = useAuth();

    const [savedTemplates, setSavedTemplates] = useState<SavedReportTemplate[]>([]);
    const [emailLists, setEmailLists] = useState<EmailList[]>([]);
    const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const getLoader = useCallback(() => {
        if (!getIdToken) return null;
        return createDataLoader(API_BASE_URL, getIdToken);
    }, [getIdToken]);

    const refreshTemplates = useCallback(async () => {
        const loader = getLoader();
        if (!loader) return;
        try {
            const data = await loader.fetchSavedTemplates();
            setSavedTemplates(data);
        } catch (err) {
            console.error('Failed to fetch templates:', err);
        }
    }, [getLoader]);

    const refreshEmailLists = useCallback(async () => {
        const loader = getLoader();
        if (!loader) return;
        try {
            const data = await loader.fetchEmailLists();
            setEmailLists(data);
        } catch (err) {
            console.error('Failed to fetch email lists:', err);
        }
    }, [getLoader]);

    const refreshSchedules = useCallback(async () => {
        const loader = getLoader();
        if (!loader) return;
        try {
            const data = await loader.fetchSchedules();
            setSchedules(data);
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        }
    }, [getLoader]);

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        Promise.all([refreshTemplates(), refreshEmailLists(), refreshSchedules()])
            .catch(err => setError(err instanceof Error ? err.message : 'Load failed'))
            .finally(() => setIsLoading(false));
    }, [user, refreshTemplates, refreshEmailLists, refreshSchedules]);

    const createTemplate = useCallback(async (template: {
        name: string;
        description: string;
        baseTemplateId: string;
        rowEntity: ReportRowEntity;
        columns: string[];
        filters: SavedReportFilters;
    }) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.createSavedTemplate(template);
        await refreshTemplates();
    }, [getLoader, refreshTemplates]);

    const updateTemplate = useCallback(async (id: string, template: Partial<{
        name: string;
        description: string;
        columns: string[];
        filters: SavedReportFilters;
    }>) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.updateSavedTemplate(id, template);
        await refreshTemplates();
    }, [getLoader, refreshTemplates]);

    const deleteTemplate = useCallback(async (id: string) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.deleteSavedTemplate(id);
        await refreshTemplates();
    }, [getLoader, refreshTemplates]);

    const createEmailList = useCallback(async (list: { name: string; emails: string[] }) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.createEmailList(list);
        await refreshEmailLists();
    }, [getLoader, refreshEmailLists]);

    const updateEmailList = useCallback(async (id: string, list: { name?: string; emails?: string[] }) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.updateEmailList(id, list);
        await refreshEmailLists();
    }, [getLoader, refreshEmailLists]);

    const deleteEmailList = useCallback(async (id: string) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.deleteEmailList(id);
        await refreshEmailLists();
    }, [getLoader, refreshEmailLists]);

    const createSchedule = useCallback(async (schedule: {
        savedTemplateId: string;
        emailListId: string;
        cadence: ReportCadence;
        enabled?: boolean;
    }) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.createSchedule(schedule);
        await refreshSchedules();
    }, [getLoader, refreshSchedules]);

    const updateSchedule = useCallback(async (id: string, patch: Partial<{
        cadence: ReportCadence;
        emailListId: string;
        enabled: boolean;
    }>) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.updateSchedule(id, patch);
        await refreshSchedules();
    }, [getLoader, refreshSchedules]);

    const deleteSchedule = useCallback(async (id: string) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.deleteSchedule(id);
        await refreshSchedules();
    }, [getLoader, refreshSchedules]);

    const runSchedule = useCallback(async (id: string) => {
        const loader = getLoader();
        if (!loader) return;
        await loader.runSchedule(id);
        await refreshSchedules();
    }, [getLoader, refreshSchedules]);

    const runReport = useCallback(async (template: SavedReportTemplate) => {
        const loader = getLoader();
        if (!loader) return;
        setIsRunning(true);
        try {
            const result = await loader.fetchReportData(template.rowEntity, template.filters);
            generateReportExcel(template.rowEntity, result.data, {
                columns: template.columns,
                reportName: template.name,
            });
        } finally {
            setIsRunning(false);
        }
    }, [getLoader]);

    return (
        <ReportContext.Provider
            value={{
                savedTemplates,
                emailLists,
                schedules,
                isLoading,
                error,
                refreshTemplates,
                refreshEmailLists,
                refreshSchedules,
                createTemplate,
                updateTemplate,
                deleteTemplate,
                createEmailList,
                updateEmailList,
                deleteEmailList,
                createSchedule,
                updateSchedule,
                deleteSchedule,
                runSchedule,
                runReport,
                isRunning,
            }}
        >
            {children}
        </ReportContext.Provider>
    );
}
