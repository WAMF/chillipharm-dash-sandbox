<script lang="ts">
  import { filterStore, presetsStore, defaultFilterState } from '../stores/filterStore';
  import { trackFilter } from '../firebase';
  import type { FilterPreset } from '../types';

  export let trials: string[] = [];
  export let sites: string[] = [];
  export let countries: string[] = [];
  export let studyArms: string[] = [];
  export let procedures: string[] = [];
  export let totalRecords: number = 0;
  export let filteredCount: number = 0;

  let expanded = false;
  let showPresetModal = false;
  let newPresetName = '';
  let searchInput = '';
  let searchTimeout: ReturnType<typeof setTimeout>;

  $: activeFilterCount = getActiveFilterCount($filterStore);
  $: hasActiveFilters = activeFilterCount > 0;

  function getActiveFilterCount(filters: typeof $filterStore): number {
    let count = 0;
    if (filters.selectedTrials.length > 0) count++;
    if (filters.selectedSites.length > 0) count++;
    if (filters.selectedCountries.length > 0) count++;
    if (filters.selectedStudyArms.length > 0) count++;
    if (filters.selectedProcedures.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.reviewStatus !== 'all') count++;
    if (filters.processedStatus !== 'all') count++;
    if (filters.searchTerm.trim()) count++;
    return count;
  }

  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterStore.setFilter('searchTerm', searchInput);
    }, 300);
  }

  function clearAllFilters() {
    filterStore.reset();
    searchInput = '';
  }

  function applyPreset(preset: FilterPreset) {
    presetsStore.applyPreset(preset);
    searchInput = preset.filters.searchTerm;
  }

  function savePreset() {
    if (newPresetName.trim()) {
      presetsStore.addPreset(newPresetName.trim());
      newPresetName = '';
      showPresetModal = false;
    }
  }

  function removePreset(id: string) {
    presetsStore.removePreset(id);
  }

  function toggleArrayValue(key: 'selectedTrials' | 'selectedSites' | 'selectedCountries' | 'selectedStudyArms' | 'selectedProcedures', value: string) {
    filterStore.toggleArrayFilter(key, value);
    trackFilter(key, value);
  }

  function handleSelectChange(key: 'selectedTrials' | 'selectedSites' | 'selectedCountries' | 'selectedStudyArms' | 'selectedProcedures', event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      toggleArrayValue(key, target.value);
      target.value = '';
    }
  }

  function handleDateChange(field: 'start' | 'end', event: Event) {
    const target = event.target as HTMLInputElement;
    filterStore.setFilter('dateRange', {
      ...$filterStore.dateRange,
      [field]: target.value || null
    });
  }

  function handleReviewStatusChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    filterStore.setFilter('reviewStatus', target.value as 'all' | 'reviewed' | 'pending');
    trackFilter('reviewStatus', target.value);
  }

  function handleProcessedStatusChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    filterStore.setFilter('processedStatus', target.value as 'all' | 'yes' | 'no');
    trackFilter('processedStatus', target.value);
  }

  function handleSortByChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    filterStore.setFilter('sortBy', target.value as any);
  }
</script>

<div class="filter-panel" class:collapsed={!expanded}>
  <div class="filter-header">
    <button class="toggle-btn" on:click={() => expanded = !expanded}>
      <span class="toggle-icon">{expanded ? '▼' : '▶'}</span>
      <span class="toggle-text">Filters</span>
      {#if activeFilterCount > 0}
        <span class="filter-badge">{activeFilterCount}</span>
      {/if}
    </button>
    <div class="filter-summary">
      <span class="record-count">
        Showing {filteredCount.toLocaleString()} of {totalRecords.toLocaleString()} records
      </span>
      {#if hasActiveFilters}
        <button class="clear-all-btn" on:click={clearAllFilters}>
          Clear All
        </button>
      {/if}
    </div>
  </div>

  {#if expanded}
    <div class="filter-content">
      <div class="presets-row">
        <div class="presets-list">
          {#each $presetsStore as preset}
            <button
              class="preset-btn"
              on:click={() => applyPreset(preset)}
            >
              {preset.name}
              {#if preset.id.startsWith('custom-')}
                <span
                  class="preset-remove"
                  on:click|stopPropagation={() => removePreset(preset.id)}
                >×</span>
              {/if}
            </button>
          {/each}
        </div>
        <button class="save-preset-btn" on:click={() => showPresetModal = true}>
          + Save Current
        </button>
      </div>

      <div class="filter-grid">
        <div class="filter-group search-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search assets, sites, subjects..."
            bind:value={searchInput}
            on:input={handleSearchInput}
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <label>Trial</label>
          <div class="multi-select">
            <div class="selected-tags">
              {#each $filterStore.selectedTrials as trial}
                <span class="tag">
                  {trial}
                  <button on:click={() => toggleArrayValue('selectedTrials', trial)}>×</button>
                </span>
              {/each}
            </div>
            <select on:change={(e) => handleSelectChange('selectedTrials', e)}>
              <option value="">Select trial...</option>
              {#each trials.filter(t => !$filterStore.selectedTrials.includes(t)) as trial}
                <option value={trial}>{trial}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="filter-group">
          <label>Site</label>
          <div class="multi-select">
            <div class="selected-tags">
              {#each $filterStore.selectedSites as site}
                <span class="tag">
                  {site}
                  <button on:click={() => toggleArrayValue('selectedSites', site)}>×</button>
                </span>
              {/each}
            </div>
            <select on:change={(e) => handleSelectChange('selectedSites', e)}>
              <option value="">Select site...</option>
              {#each sites.filter(s => !$filterStore.selectedSites.includes(s)) as site}
                <option value={site}>{site}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="filter-group">
          <label>Country</label>
          <div class="multi-select">
            <div class="selected-tags">
              {#each $filterStore.selectedCountries as country}
                <span class="tag">
                  {country}
                  <button on:click={() => toggleArrayValue('selectedCountries', country)}>×</button>
                </span>
              {/each}
            </div>
            <select on:change={(e) => handleSelectChange('selectedCountries', e)}>
              <option value="">Select country...</option>
              {#each countries.filter(c => !$filterStore.selectedCountries.includes(c)) as country}
                <option value={country}>{country}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="filter-group">
          <label>Study Arm</label>
          <div class="multi-select">
            <div class="selected-tags">
              {#each $filterStore.selectedStudyArms as arm}
                <span class="tag">
                  {arm}
                  <button on:click={() => toggleArrayValue('selectedStudyArms', arm)}>×</button>
                </span>
              {/each}
            </div>
            <select on:change={(e) => handleSelectChange('selectedStudyArms', e)}>
              <option value="">Select arm...</option>
              {#each studyArms.filter(a => !$filterStore.selectedStudyArms.includes(a)) as arm}
                <option value={arm}>{arm}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="filter-group">
          <label>Procedure</label>
          <div class="multi-select">
            <div class="selected-tags">
              {#each $filterStore.selectedProcedures as proc}
                <span class="tag">
                  {proc}
                  <button on:click={() => toggleArrayValue('selectedProcedures', proc)}>×</button>
                </span>
              {/each}
            </div>
            <select on:change={(e) => handleSelectChange('selectedProcedures', e)}>
              <option value="">Select procedure...</option>
              {#each procedures.filter(p => !$filterStore.selectedProcedures.includes(p)) as proc}
                <option value={proc}>{proc}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="filter-group">
          <label>Upload Date</label>
          <div class="date-range">
            <input
              type="date"
              value={$filterStore.dateRange.start || ''}
              on:change={(e) => handleDateChange('start', e)}
              placeholder="Start date"
            />
            <span class="date-separator">to</span>
            <input
              type="date"
              value={$filterStore.dateRange.end || ''}
              on:change={(e) => handleDateChange('end', e)}
              placeholder="End date"
            />
          </div>
        </div>

        <div class="filter-group">
          <label>Review Status</label>
          <select
            value={$filterStore.reviewStatus}
            on:change={handleReviewStatusChange}
          >
            <option value="all">All</option>
            <option value="reviewed">Reviewed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Processed</label>
          <select
            value={$filterStore.processedStatus}
            on:change={handleProcessedStatusChange}
          >
            <option value="all">All</option>
            <option value="yes">Processed</option>
            <option value="no">Not Processed</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Sort By</label>
          <div class="sort-controls">
            <select
              value={$filterStore.sortBy}
              on:change={handleSortByChange}
            >
              <option value="">Default</option>
              <option value="uploadDate">Upload Date</option>
              <option value="siteName">Site Name</option>
              <option value="assetTitle">Asset Title</option>
              <option value="subjectNumber">Subject</option>
              <option value="studyArm">Study Arm</option>
              <option value="reviewed">Review Status</option>
            </select>
            <button
              class="sort-order-btn"
              on:click={() => filterStore.setFilter('sortOrder', $filterStore.sortOrder === 'asc' ? 'desc' : 'asc')}
              disabled={!$filterStore.sortBy}
            >
              {$filterStore.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {#if hasActiveFilters}
        <div class="active-filters">
          <span class="active-label">Active filters:</span>
          {#if $filterStore.searchTerm}
            <span class="filter-pill">
              Search: "{$filterStore.searchTerm}"
              <button on:click={() => { filterStore.setFilter('searchTerm', ''); searchInput = ''; }}>×</button>
            </span>
          {/if}
          {#if $filterStore.selectedTrials.length > 0}
            <span class="filter-pill">
              Trials: {$filterStore.selectedTrials.length}
              <button on:click={() => filterStore.clearArrayFilter('selectedTrials')}>×</button>
            </span>
          {/if}
          {#if $filterStore.selectedSites.length > 0}
            <span class="filter-pill">
              Sites: {$filterStore.selectedSites.length}
              <button on:click={() => filterStore.clearArrayFilter('selectedSites')}>×</button>
            </span>
          {/if}
          {#if $filterStore.selectedCountries.length > 0}
            <span class="filter-pill">
              Countries: {$filterStore.selectedCountries.length}
              <button on:click={() => filterStore.clearArrayFilter('selectedCountries')}>×</button>
            </span>
          {/if}
          {#if $filterStore.selectedStudyArms.length > 0}
            <span class="filter-pill">
              Arms: {$filterStore.selectedStudyArms.length}
              <button on:click={() => filterStore.clearArrayFilter('selectedStudyArms')}>×</button>
            </span>
          {/if}
          {#if $filterStore.selectedProcedures.length > 0}
            <span class="filter-pill">
              Procedures: {$filterStore.selectedProcedures.length}
              <button on:click={() => filterStore.clearArrayFilter('selectedProcedures')}>×</button>
            </span>
          {/if}
          {#if $filterStore.dateRange.start || $filterStore.dateRange.end}
            <span class="filter-pill">
              Date Range
              <button on:click={() => filterStore.setFilter('dateRange', { start: null, end: null })}>×</button>
            </span>
          {/if}
          {#if $filterStore.reviewStatus !== 'all'}
            <span class="filter-pill">
              {$filterStore.reviewStatus === 'reviewed' ? 'Reviewed' : 'Pending'}
              <button on:click={() => filterStore.setFilter('reviewStatus', 'all')}>×</button>
            </span>
          {/if}
          {#if $filterStore.processedStatus !== 'all'}
            <span class="filter-pill">
              {$filterStore.processedStatus === 'yes' ? 'Processed' : 'Not Processed'}
              <button on:click={() => filterStore.setFilter('processedStatus', 'all')}>×</button>
            </span>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if showPresetModal}
  <div class="modal-overlay" on:click={() => showPresetModal = false}>
    <div class="modal" on:click|stopPropagation>
      <h3>Save Filter Preset</h3>
      <input
        type="text"
        placeholder="Preset name..."
        bind:value={newPresetName}
        on:keydown={(e) => e.key === 'Enter' && savePreset()}
      />
      <div class="modal-actions">
        <button class="btn-secondary" on:click={() => showPresetModal = false}>Cancel</button>
        <button class="btn-primary" on:click={savePreset}>Save</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .filter-panel {
    background: var(--white);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-sm);
    margin-bottom: 1.5rem;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--neutral-200);
  }

  .collapsed .filter-header {
    border-bottom: none;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: var(--neutral-700);
    cursor: pointer;
    padding: 0;
  }

  .toggle-icon {
    font-size: 0.75rem;
    color: var(--neutral-500);
  }

  .filter-badge {
    background: var(--chilli-red);
    color: white;
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-weight: 600;
  }

  .filter-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .record-count {
    font-size: 0.875rem;
    color: var(--neutral-500);
  }

  .clear-all-btn {
    background: none;
    border: 1px solid var(--neutral-300);
    color: var(--neutral-600);
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-all-btn:hover {
    background: var(--neutral-100);
    border-color: var(--neutral-400);
  }

  .filter-content {
    padding: 1rem 1.5rem 1.5rem;
  }

  .presets-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--neutral-100);
  }

  .presets-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .preset-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background: var(--neutral-100);
    border: 1px solid var(--neutral-200);
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    color: var(--neutral-700);
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    background: var(--neutral-200);
  }

  .preset-remove {
    color: var(--neutral-500);
    font-weight: bold;
    margin-left: 0.25rem;
  }

  .preset-remove:hover {
    color: var(--danger-red);
  }

  .save-preset-btn {
    background: none;
    border: 1px dashed var(--neutral-300);
    color: var(--neutral-600);
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-preset-btn:hover {
    border-color: var(--chilli-red);
    color: var(--chilli-red);
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .filter-group.search-group {
    grid-column: span 2;
  }

  .filter-group label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--neutral-600);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .search-input,
  .filter-group select,
  .filter-group input[type="date"] {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--neutral-300);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: var(--neutral-700);
    background: var(--white);
    transition: border-color 0.2s;
  }

  .search-input:focus,
  .filter-group select:focus,
  .filter-group input[type="date"]:focus {
    outline: none;
    border-color: var(--chilli-red);
  }

  .multi-select {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    min-height: 1.5rem;
  }

  .tag {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--chilli-red);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  .tag button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    font-size: 0.875rem;
    line-height: 1;
  }

  .date-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .date-range input {
    flex: 1;
    min-width: 0;
  }

  .date-separator {
    color: var(--neutral-500);
    font-size: 0.75rem;
  }

  .sort-controls {
    display: flex;
    gap: 0.5rem;
  }

  .sort-controls select {
    flex: 1;
  }

  .sort-order-btn {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--neutral-300);
    border-radius: 0.375rem;
    background: var(--white);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .sort-order-btn:hover:not(:disabled) {
    background: var(--neutral-100);
  }

  .sort-order-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .active-filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--neutral-100);
  }

  .active-label {
    font-size: 0.75rem;
    color: var(--neutral-500);
    font-weight: 500;
  }

  .filter-pill {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background: var(--neutral-100);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: var(--neutral-700);
  }

  .filter-pill button {
    background: none;
    border: none;
    color: var(--neutral-500);
    cursor: pointer;
    padding: 0;
    font-size: 0.875rem;
    line-height: 1;
  }

  .filter-pill button:hover {
    color: var(--danger-red);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: var(--white);
    border-radius: 0.5rem;
    padding: 1.5rem;
    width: 100%;
    max-width: 400px;
    box-shadow: var(--shadow-lg);
  }

  .modal h3 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    color: var(--neutral-800);
  }

  .modal input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--neutral-300);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .modal input:focus {
    outline: none;
    border-color: var(--chilli-red);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--chilli-red);
    color: white;
    border: none;
  }

  .btn-primary:hover {
    background: var(--chilli-red-dark);
  }

  .btn-secondary {
    background: var(--white);
    color: var(--neutral-700);
    border: 1px solid var(--neutral-300);
  }

  .btn-secondary:hover {
    background: var(--neutral-100);
  }

  @media (max-width: 1024px) {
    .filter-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .filter-grid {
      grid-template-columns: 1fr;
    }

    .filter-group.search-group {
      grid-column: span 1;
    }

    .filter-header {
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .presets-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }

  @media print {
    .filter-panel {
      display: none;
    }
  }
</style>
