'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
} from 'react';
import type {
    AssetRecord,
    DashboardMetrics,
    SitePerformance,
    TimeSeriesData,
    ComplianceMetric,
    StudyArmData,
    StudyEventData,
    StudyProcedureData,
    VideoMetricsData,
    ReviewPerformanceData,
    ProcedureLagData,
    CommentStats,
} from '@cp/types';
import { useAuth } from '@cp/firebase';
import {
    calculateDashboardMetrics,
    calculateSitePerformance,
    calculateTimeSeriesData,
    calculateComplianceMetrics,
    getStudyArmDistribution,
    getStudyEventBreakdown,
    getStudyProcedureBreakdown,
    getVideoMetrics,
    getReviewPerformance,
    getProcedureLagAnalysis,
    getCommentStats,
    getFilterOptions,
    getCountryDistribution,
    filterRecords,
    sortRecords,
} from '@cp/data-processing';
import { createDataLoader } from '@cp/api-client';
import { useFilters } from './FilterContext';

const API_BASE_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://europe-west2-chillipharm-dashboard.cloudfunctions.net/api'
        : 'http://127.0.0.1:5002/chillipharm-dashboard/europe-west2/api';

interface FilterOptions {
    trials: string[];
    sites: string[];
    countries: string[];
    studyArms: string[];
    procedures: string[];
    evaluators: string[];
    uploaders: string[];
}

interface CountryData {
    country: string;
    count: number;
}

interface DashboardContextValue {
    allRecords: AssetRecord[];
    filteredRecords: AssetRecord[];
    isLoading: boolean;
    error: string | null;
    metrics: DashboardMetrics | null;
    sitePerformance: SitePerformance[];
    timeSeriesData: TimeSeriesData[];
    complianceMetrics: ComplianceMetric[];
    studyArmData: StudyArmData[];
    studyEventData: StudyEventData[];
    studyProcedureData: StudyProcedureData[];
    videoMetrics: VideoMetricsData | null;
    reviewPerformance: ReviewPerformanceData | null;
    procedureLagData: ProcedureLagData[];
    commentStats: CommentStats | null;
    filterOptions: FilterOptions;
    countryDistribution: CountryData[];
    refreshData: () => Promise<void>;
    setSelectedAsset: (asset: AssetRecord | null) => void;
    selectedAsset: AssetRecord | null;
    showAssetList: boolean;
    setShowAssetList: (show: boolean) => void;
    assetListTitle: string;
    setAssetListTitle: (title: string) => void;
    assetListRecords: AssetRecord[];
    setAssetListRecords: (records: AssetRecord[]) => void;
    showReportWizard: boolean;
    setShowReportWizard: (show: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { user, getIdToken } = useAuth();
    const { filters } = useFilters();

    const [allRecords, setAllRecords] = useState<AssetRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(
        null
    );
    const [showAssetList, setShowAssetList] = useState(false);
    const [assetListTitle, setAssetListTitle] = useState('');
    const [assetListRecords, setAssetListRecords] = useState<AssetRecord[]>([]);
    const [showReportWizard, setShowReportWizard] = useState(false);

    const loadData = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const dataLoader = createDataLoader(API_BASE_URL, getIdToken);

            const records = await dataLoader.loadData();
            setAllRecords(records);
        } catch (error_) {
            console.error('Failed to load data:', error_);
            setError(
                error_ instanceof Error ? error_.message : 'Failed to load data'
            );
        } finally {
            setIsLoading(false);
        }
    }, [user, getIdToken]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredRecords = useMemo(() => {
        let records = filterRecords(allRecords, filters);
        if (filters.sortBy) {
            records = sortRecords(records, filters.sortBy, filters.sortOrder);
        }
        return records;
    }, [allRecords, filters]);

    const metrics = useMemo(() => {
        if (filteredRecords.length === 0) return null;
        return calculateDashboardMetrics(filteredRecords);
    }, [filteredRecords]);

    const sitePerformance = useMemo(() => {
        return calculateSitePerformance(filteredRecords);
    }, [filteredRecords]);

    const timeSeriesData = useMemo(() => {
        return calculateTimeSeriesData(filteredRecords);
    }, [filteredRecords]);

    const complianceMetrics = useMemo(() => {
        return calculateComplianceMetrics(filteredRecords);
    }, [filteredRecords]);

    const studyArmData = useMemo(() => {
        return getStudyArmDistribution(filteredRecords);
    }, [filteredRecords]);

    const studyEventData = useMemo(() => {
        return getStudyEventBreakdown(filteredRecords);
    }, [filteredRecords]);

    const studyProcedureData = useMemo(() => {
        return getStudyProcedureBreakdown(filteredRecords);
    }, [filteredRecords]);

    const videoMetrics = useMemo(() => {
        if (filteredRecords.length === 0) return null;
        return getVideoMetrics(filteredRecords);
    }, [filteredRecords]);

    const reviewPerformance = useMemo(() => {
        if (filteredRecords.length === 0) return null;
        return getReviewPerformance(filteredRecords);
    }, [filteredRecords]);

    const procedureLagData = useMemo(() => {
        return getProcedureLagAnalysis(filteredRecords);
    }, [filteredRecords]);

    const commentStats = useMemo(() => {
        if (filteredRecords.length === 0) return null;
        return getCommentStats(filteredRecords);
    }, [filteredRecords]);

    const filterOptions = useMemo(() => {
        return getFilterOptions(allRecords);
    }, [allRecords]);

    const countryDistribution = useMemo(() => {
        return getCountryDistribution(filteredRecords);
    }, [filteredRecords]);

    const refreshData = useCallback(async () => {
        await loadData();
    }, [loadData]);

    return (
        <DashboardContext.Provider
            value={{
                allRecords,
                filteredRecords,
                isLoading,
                error,
                metrics,
                sitePerformance,
                timeSeriesData,
                complianceMetrics,
                studyArmData,
                studyEventData,
                studyProcedureData,
                videoMetrics,
                reviewPerformance,
                procedureLagData,
                commentStats,
                filterOptions,
                countryDistribution,
                refreshData,
                selectedAsset,
                setSelectedAsset,
                showAssetList,
                setShowAssetList,
                assetListTitle,
                setAssetListTitle,
                assetListRecords,
                setAssetListRecords,
                showReportWizard,
                setShowReportWizard,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
