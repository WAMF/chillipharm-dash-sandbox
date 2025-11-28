<script lang="ts">
  import { onMount } from 'svelte';
  import Header from './lib/components/Header.svelte';
  import Login from './lib/components/Login.svelte';
  import ExecutiveOverview from './lib/components/ExecutiveOverview.svelte';
  import SitePerformance from './lib/components/SitePerformance.svelte';
  import ComplianceMonitoring from './lib/components/ComplianceMonitoring.svelte';
  import IntegrationHealth from './lib/components/IntegrationHealth.svelte';
  import StudyAnalytics from './lib/components/StudyAnalytics.svelte';
  import VideoMetrics from './lib/components/VideoMetrics.svelte';
  import ReviewPerformance from './lib/components/ReviewPerformance.svelte';
  import FilterPanel from './lib/components/FilterPanel.svelte';
  import AssetDetailModal from './lib/components/AssetDetailModal.svelte';
  import AssetListModal from './lib/components/AssetListModal.svelte';
  import ReportWizard from './lib/components/ReportWizard.svelte';
  import { authStore } from './lib/stores/authStore';
  import { filterStore } from './lib/stores/filterStore';
  import { assetModalStore } from './lib/stores/assetModalStore';
  import { initAnalytics, trackPageView, trackTabChange } from './lib/firebase';
  import {
    loadData,
    loadFilteredData,
    calculateDashboardMetrics,
    calculateSitePerformance,
    calculateTimeSeriesData,
    calculateComplianceMetrics,
    getEvaluatorStats,
    getCountryDistribution,
    getStudyArmDistribution,
    getStudyEventBreakdown,
    getStudyProcedureBreakdown,
    getVideoMetrics,
    getReviewPerformance,
    getProcedureLagAnalysis,
    getCommentStats,
    getFilterOptions
  } from './lib/dataProcessor';
  import type {
    AssetRecord,
    DashboardMetrics,
    SitePerformance as SitePerf,
    TimeSeriesData,
    ComplianceMetric,
    StudyArmData,
    StudyEventData,
    StudyProcedureData,
    VideoMetricsData,
    ReviewPerformanceData,
    ProcedureLagData,
    CommentStats
  } from './lib/types';

  let activeTab = 'overview';
  let loading = true;
  let filterLoading = false;
  let error = '';
  let showReportWizard = false;

  let allRecords: AssetRecord[] = [];
  let filteredRecords: AssetRecord[] = [];
  let filterOptions = {
    trials: [] as string[],
    sites: [] as string[],
    countries: [] as string[],
    studyArms: [] as string[],
    procedures: [] as string[],
    evaluators: [] as string[],
    uploaders: [] as string[]
  };

  let filterVersion = 0;
  let lastAppliedFilters = '';

  async function applyFilters() {
    const currentFilters = $filterStore;
    const filterKey = JSON.stringify(currentFilters);

    if (filterKey === lastAppliedFilters) return;

    filterVersion++;
    const thisVersion = filterVersion;
    filterLoading = true;

    try {
      const records = await loadFilteredData(currentFilters);
      if (thisVersion === filterVersion) {
        filteredRecords = records;
        lastAppliedFilters = filterKey;
      }
    } catch (e) {
      if (thisVersion === filterVersion) {
        console.error('Failed to apply filters:', e);
      }
    } finally {
      if (thisVersion === filterVersion) {
        filterLoading = false;
      }
    }
  }

  $: if (dataLoaded && $filterStore) {
    applyFilters();
  }

  $: metrics = filteredRecords.length > 0 ? calculateDashboardMetrics(filteredRecords) : null;
  $: sitePerformance = calculateSitePerformance(filteredRecords);
  $: timeSeriesData = calculateTimeSeriesData(filteredRecords);
  $: complianceMetrics = calculateComplianceMetrics(filteredRecords);
  $: evaluatorStats = getEvaluatorStats(filteredRecords);
  $: countryDistribution = getCountryDistribution(filteredRecords);
  $: studyArms = getStudyArmDistribution(filteredRecords);
  $: studyEvents = getStudyEventBreakdown(filteredRecords);
  $: studyProcedures = getStudyProcedureBreakdown(filteredRecords);
  $: videoMetrics = filteredRecords.length > 0 ? getVideoMetrics(filteredRecords) : null;
  $: reviewPerformance = filteredRecords.length > 0 ? getReviewPerformance(filteredRecords) : null;
  $: procedureLag = getProcedureLagAnalysis(filteredRecords);
  $: commentStats = filteredRecords.length > 0 ? getCommentStats(filteredRecords) : null;

  $: isAuthenticated = $authStore.user !== null;
  $: authLoading = $authStore.loading;

  let dataLoaded = false;

  async function fetchDashboardData() {
    if (dataLoaded || loading === false) return;
    try {
      allRecords = await loadData();
      filterOptions = getFilterOptions(allRecords);
      dataLoaded = true;
      loading = false;
    } catch (e) {
      error = 'Failed to load dashboard data: ' + (e as Error).message;
      loading = false;
    }
  }

  $: if (isAuthenticated && !dataLoaded && !authLoading) {
    fetchDashboardData();
  }

  function handleTabChange(newTab: string) {
    activeTab = newTab;
    trackTabChange(newTab);
  }

  onMount(() => {
    initAnalytics();
    trackPageView('dashboard');
  });
</script>

<main class="app">
  {#if authLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  {:else if !isAuthenticated}
    <Login />
  {:else}
    <Header bind:activeTab records={filteredRecords} on:openReportWizard={() => showReportWizard = true} />

    {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
  {:else if error}
    <div class="error">
      <div class="error-icon">⚠️</div>
      <h2>Error Loading Data</h2>
      <p>{error}</p>
    </div>
  {:else}
    <div class="content container">
      <FilterPanel
        trials={filterOptions.trials}
        sites={filterOptions.sites}
        countries={filterOptions.countries}
        studyArms={filterOptions.studyArms}
        procedures={filterOptions.procedures}
        totalRecords={allRecords.length}
        filteredCount={filteredRecords.length}
      />

      {#if filterLoading}
        <div class="filter-loading">
          <div class="spinner small"></div>
          <p>Applying filters...</p>
        </div>
      {:else if filteredRecords.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No Records Found</h3>
          <p>No records match your current filter criteria.</p>
          <button class="reset-btn" on:click={() => filterStore.reset()}>
            Clear All Filters
          </button>
        </div>
      {:else if metrics}
        <div class="screen-content">
          {#if activeTab === 'overview'}
            <ExecutiveOverview {metrics} {timeSeriesData} />
          {:else if activeTab === 'sites'}
            <SitePerformance siteData={sitePerformance} records={filteredRecords} />
          {:else if activeTab === 'study' && commentStats}
            <StudyAnalytics {studyArms} {studyEvents} {studyProcedures} {procedureLag} {commentStats} records={filteredRecords} />
          {:else if activeTab === 'video' && videoMetrics}
            <VideoMetrics {videoMetrics} records={filteredRecords} />
          {:else if activeTab === 'reviews' && reviewPerformance}
            <ReviewPerformance reviewData={reviewPerformance} records={filteredRecords} />
          {:else if activeTab === 'compliance'}
            <ComplianceMonitoring complianceData={complianceMetrics} records={filteredRecords} />
          {:else if activeTab === 'integration'}
            <IntegrationHealth records={filteredRecords} {evaluatorStats} {countryDistribution} />
          {/if}
        </div>

        <div class="print-all-tabs">
          <div class="print-tab-section">
            <h2 class="print-section-title">Executive Overview</h2>
            <ExecutiveOverview {metrics} {timeSeriesData} />
          </div>
          <div class="print-tab-section">
            <h2 class="print-section-title">Site Performance</h2>
            <SitePerformance siteData={sitePerformance} records={filteredRecords} />
          </div>
          {#if commentStats}
            <div class="print-tab-section">
              <h2 class="print-section-title">Study Analytics</h2>
              <StudyAnalytics {studyArms} {studyEvents} {studyProcedures} {procedureLag} {commentStats} records={filteredRecords} />
            </div>
          {/if}
          {#if videoMetrics}
            <div class="print-tab-section">
              <h2 class="print-section-title">Video Metrics</h2>
              <VideoMetrics {videoMetrics} records={filteredRecords} />
            </div>
          {/if}
          {#if reviewPerformance}
            <div class="print-tab-section">
              <h2 class="print-section-title">Review Performance</h2>
              <ReviewPerformance reviewData={reviewPerformance} records={filteredRecords} />
            </div>
          {/if}
          <div class="print-tab-section">
            <h2 class="print-section-title">Compliance Monitoring</h2>
            <ComplianceMonitoring complianceData={complianceMetrics} records={filteredRecords} />
          </div>
          <div class="print-tab-section">
            <h2 class="print-section-title">Integration Health</h2>
            <IntegrationHealth records={filteredRecords} {evaluatorStats} {countryDistribution} />
          </div>
        </div>
      {/if}

      <footer class="dashboard-footer">
        <div class="footer-content">
          <div class="footer-section">
            <h4>About ChilliPharm</h4>
            <p>The Stripe of Clinical Video - Essential infrastructure for clinical trial video management</p>
          </div>
          <div class="footer-section">
            <h4>Key Features</h4>
            <ul>
              <li>Secure video capture & storage</li>
              <li>Automated de-identification</li>
              <li>EDC integration</li>
              <li>Regulatory compliance (FDA, HIPAA, GDPR)</li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Dashboard Info</h4>
            <p>Data Source: ChilliPharm Test Instance</p>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
            <p>Showing: {filteredRecords.length.toLocaleString()} of {allRecords.length.toLocaleString()} records</p>
          </div>
        </div>
      </footer>
    </div>
  {/if}
  {/if}
</main>

{#if $assetModalStore.showList}
  <AssetListModal
    title={$assetModalStore.listTitle}
    assets={$assetModalStore.listAssets}
  />
{/if}

{#if $assetModalStore.showDetail && $assetModalStore.selectedAsset}
  <AssetDetailModal asset={$assetModalStore.selectedAsset} />
{/if}

{#if showReportWizard}
  <ReportWizard
    records={filteredRecords}
    sites={filterOptions.sites}
    trials={filterOptions.trials}
    countries={filterOptions.countries}
    on:close={() => showReportWizard = false}
  />
{/if}

<style>
  .app {
    min-height: 100vh;
    background-color: var(--neutral-50);
  }

  .content {
    padding: 2rem 1.5rem;
    min-height: calc(100vh - 200px);
  }

  .loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    gap: 1rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--neutral-200);
    border-top-color: var(--chilli-red);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading p {
    font-size: 1.125rem;
    color: var(--neutral-600);
  }

  .filter-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: var(--white);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-sm);
    gap: 1rem;
  }

  .filter-loading p {
    font-size: 1rem;
    color: var(--neutral-600);
  }

  .spinner.small {
    width: 30px;
    height: 30px;
    border-width: 3px;
  }

  .error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 2rem;
    text-align: center;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .error h2 {
    color: var(--danger-red);
    margin-bottom: 0.5rem;
  }

  .error p {
    color: var(--neutral-600);
    max-width: 600px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: var(--white);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-sm);
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    color: var(--neutral-800);
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: var(--neutral-500);
    margin-bottom: 1.5rem;
  }

  .reset-btn {
    padding: 0.75rem 1.5rem;
    background: var(--chilli-red);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .reset-btn:hover {
    background: var(--chilli-red-dark);
  }

  .dashboard-footer {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 2px solid var(--neutral-200);
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .footer-section h4 {
    color: var(--chilli-red);
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .footer-section p {
    color: var(--neutral-600);
    font-size: 0.875rem;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }

  .footer-section ul {
    list-style: none;
    padding: 0;
  }

  .footer-section li {
    color: var(--neutral-600);
    font-size: 0.875rem;
    padding: 0.25rem 0;
  }

  .footer-section li::before {
    content: '✓ ';
    color: var(--success-green);
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .content {
      padding: 1.5rem 1rem;
    }
  }

  .print-all-tabs {
    position: absolute;
    left: -9999px;
    top: 0;
    width: 1200px;
    background: white;
  }

  .print-section-title {
    color: var(--chilli-red);
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--chilli-red);
  }

  @media print {
    .content {
      padding: 0;
    }

    .dashboard-footer {
      display: none;
    }
  }
</style>
