<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { authStore } from '../stores/authStore';
  import FeedbackButton from './FeedbackButton.svelte';
  import type { AssetRecord } from '../types';

  export let activeTab: string;
  export let records: AssetRecord[] = [];

  const dispatch = createEventDispatcher<{ openReportWizard: void }>();

  function openReportWizard() {
    dispatch('openReportWizard');
  }

  $: uniqueTrials = [...new Set(records.map(r => r.trialName).filter(Boolean))];
  $: trialBadgeText = uniqueTrials.length === 1
    ? uniqueTrials[0]
    : `${uniqueTrials.length} Trials`;

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: '📊' },
    { id: 'sites', label: 'Site Performance', icon: '🏥' },
    { id: 'study', label: 'Study Analytics', icon: '🔬' },
    { id: 'video', label: 'Video Metrics', icon: '📹' },
    { id: 'reviews', label: 'Review Performance', icon: '✓' },
    { id: 'compliance', label: 'Compliance', icon: '🛡️' },
    { id: 'integration', label: 'Integration Health', icon: '🔗' }
  ];

  function setTab(tabId: string) {
    activeTab = tabId;
  }

  function handleLogout() {
    authStore.signOut();
  }
</script>

<header class="header">
  <div class="container">
    <div class="header-content">
      <div class="brand">
        <div class="logo">🌶️</div>
        <div class="brand-text">
          <h1>ChilliPharm</h1>
          <p class="tagline">Clinical Trial Video Platform</p>
        </div>
      </div>
      <div class="header-info">
        <div class="trial-badge">
          <span class="badge badge-info">{trialBadgeText}</span>
        </div>
        <button class="report-btn" on:click={openReportWizard}>
          <span class="report-icon">📋</span>
          Generate Report
        </button>
        <FeedbackButton {activeTab} />
        <button class="logout-btn" on:click={handleLogout}>
          <span class="logout-icon">🚪</span>
          Logout
        </button>
      </div>
    </div>
    <nav class="nav-tabs">
      {#each tabs as tab}
        <button
          class="nav-tab"
          class:active={activeTab === tab.id}
          on:click={() => setTab(tab.id)}
        >
          <span class="tab-icon">{tab.icon}</span>
          <span class="tab-label">{tab.label}</span>
        </button>
      {/each}
    </nav>
  </div>
</header>

<style>
  .header {
    background: linear-gradient(135deg, var(--chilli-red) 0%, var(--chilli-red-dark) 100%);
    color: var(--white);
    box-shadow: var(--shadow-lg);
    position: sticky;
    top: 0;
    z-index: 1001;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 0 1rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo {
    font-size: 3rem;
    line-height: 1;
  }

  .brand-text h1 {
    font-size: 1.75rem;
    margin: 0;
    color: var(--white);
    font-weight: 700;
  }

  .tagline {
    font-size: 0.875rem;
    opacity: 0.9;
    margin: 0;
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .trial-badge .badge {
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--white);
    font-weight: 600;
    padding: 0.5rem 1rem;
  }

  .report-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: var(--white);
    color: var(--chilli-red);
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .report-btn:hover {
    background-color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }

  .report-icon {
    font-size: 1rem;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: rgba(255, 255, 255, 0.15);
    color: var(--white);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .logout-icon {
    font-size: 1rem;
  }

  .nav-tabs {
    display: flex;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .nav-tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
    position: relative;
  }

  .nav-tab:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--white);
  }

  .nav-tab.active {
    background-color: var(--white);
    color: var(--chilli-red);
  }

  .nav-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: var(--white);
  }

  .tab-icon {
    font-size: 1.125rem;
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .header-info {
      flex-wrap: wrap;
    }

    .nav-tabs {
      overflow-x: auto;
      width: 100%;
      padding-bottom: 0.5rem;
    }

    .nav-tab {
      white-space: nowrap;
    }

    .tab-label {
      display: none;
    }

    .tab-icon {
      font-size: 1.5rem;
    }
  }

  @media print {
    .header {
      position: relative;
      box-shadow: none;
      background: var(--chilli-red);
      padding-bottom: 1rem;
    }

    .header-info {
      display: none;
    }

    .nav-tabs {
      display: none;
    }
  }
</style>
