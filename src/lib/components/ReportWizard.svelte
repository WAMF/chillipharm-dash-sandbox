<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { format, subDays, subMonths } from 'date-fns';
  import type { AssetRecord } from '../types';
  import {
    type ReportConfig,
    type ColumnKey,
    COLUMN_DEFINITIONS,
    COLUMN_CATEGORIES,
    DEFAULT_COLUMNS,
    getFileTypes,
    getColumnsByCategory,
    filterRecordsForReport,
    generateExcel
  } from '../utils/excelGenerator';

  export let records: AssetRecord[] = [];
  export let sites: string[] = [];
  export let trials: string[] = [];
  export let countries: string[] = [];

  const dispatch = createEventDispatcher<{ close: void }>();

  let currentStep = 1;
  const totalSteps = 4;

  let reportName = 'Asset Report';
  let dateRangeStart: string = '';
  let dateRangeEnd: string = '';

  let siteFilter: 'all' | 'specific' = 'all';
  let selectedSites: string[] = [];
  let trialFilter: 'all' | 'specific' = 'all';
  let selectedTrials: string[] = [];
  let countryFilter: 'all' | 'specific' = 'all';
  let selectedCountries: string[] = [];
  let fileTypeFilter: 'all' | 'specific' = 'all';
  let selectedFileTypes: string[] = [];

  let selectedColumns: Set<ColumnKey> = new Set(DEFAULT_COLUMNS);

  let generating = false;

  $: fileTypes = getFileTypes(records);
  $: columnsByCategory = getColumnsByCategory();

  $: config = {
    name: reportName,
    dateRange: {
      start: dateRangeStart || null,
      end: dateRangeEnd || null
    },
    filters: {
      sites: siteFilter === 'all' ? 'all' : selectedSites,
      trials: trialFilter === 'all' ? 'all' : selectedTrials,
      countries: countryFilter === 'all' ? 'all' : selectedCountries,
      fileTypes: fileTypeFilter === 'all' ? 'all' : selectedFileTypes
    },
    columns: Array.from(selectedColumns)
  } as ReportConfig;

  $: filteredRecords = filterRecordsForReport(records, config);
  $: previewRecords = filteredRecords.slice(0, 10);

  $: step1Valid = reportName.trim().length > 0;
  $: step2Valid = true;
  $: step3Valid = selectedColumns.size > 0;

  function setDatePreset(preset: string) {
    const today = new Date();
    dateRangeEnd = format(today, 'yyyy-MM-dd');

    switch (preset) {
      case '7days':
        dateRangeStart = format(subDays(today, 7), 'yyyy-MM-dd');
        break;
      case '30days':
        dateRangeStart = format(subDays(today, 30), 'yyyy-MM-dd');
        break;
      case '90days':
        dateRangeStart = format(subDays(today, 90), 'yyyy-MM-dd');
        break;
      case '6months':
        dateRangeStart = format(subMonths(today, 6), 'yyyy-MM-dd');
        break;
      case 'all':
        dateRangeStart = '';
        dateRangeEnd = '';
        break;
    }
  }

  function toggleColumn(key: ColumnKey) {
    if (selectedColumns.has(key)) {
      selectedColumns.delete(key);
    } else {
      selectedColumns.add(key);
    }
    selectedColumns = selectedColumns;
  }

  function selectAllColumns() {
    COLUMN_DEFINITIONS.forEach(col => selectedColumns.add(col.key));
    selectedColumns = selectedColumns;
  }

  function deselectAllColumns() {
    selectedColumns.clear();
    selectedColumns = selectedColumns;
  }

  function selectCategoryColumns(category: string) {
    const cols = columnsByCategory.get(category) || [];
    cols.forEach(col => selectedColumns.add(col.key));
    selectedColumns = selectedColumns;
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  async function downloadReport() {
    generating = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      generateExcel(filteredRecords, config);
    } finally {
      generating = false;
    }
  }

  function formatDateDisplay(dateStr: string): string {
    if (!dateStr) return 'Not set';
    return format(new Date(dateStr), 'dd/MM/yyyy');
  }

  function getColumnLabel(key: ColumnKey): string {
    const col = COLUMN_DEFINITIONS.find(c => c.key === key);
    return col?.label || key;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
  <div class="wizard-modal" role="document">
    <div class="wizard-header">
      <div class="header-content">
        <h2 id="wizard-title">Generate Report</h2>
        <div class="step-indicator">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
      <button class="close-btn" on:click={handleClose} aria-label="Close">
        <span>&times;</span>
      </button>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: {(currentStep / totalSteps) * 100}%"></div>
    </div>

    <div class="step-labels">
      <span class:active={currentStep === 1} class:completed={currentStep > 1}>Configuration</span>
      <span class:active={currentStep === 2} class:completed={currentStep > 2}>Filters</span>
      <span class:active={currentStep === 3} class:completed={currentStep > 3}>Columns</span>
      <span class:active={currentStep === 4}>Preview</span>
    </div>

    <div class="wizard-content">
      {#if currentStep === 1}
        <div class="step-content">
          <h3>Report Configuration</h3>
          <p class="step-description">Set the basic report settings and date range.</p>

          <div class="form-group">
            <label for="report-name">Report Name</label>
            <input
              id="report-name"
              type="text"
              bind:value={reportName}
              placeholder="Enter report name"
            />
          </div>

          <div class="form-group">
            <label>Date Range</label>
            <div class="date-presets">
              <button class="preset-btn" on:click={() => setDatePreset('7days')}>Last 7 days</button>
              <button class="preset-btn" on:click={() => setDatePreset('30days')}>Last 30 days</button>
              <button class="preset-btn" on:click={() => setDatePreset('90days')}>Last 90 days</button>
              <button class="preset-btn" on:click={() => setDatePreset('6months')}>Last 6 months</button>
              <button class="preset-btn" on:click={() => setDatePreset('all')}>All time</button>
            </div>
            <div class="date-inputs">
              <div class="date-field">
                <label for="date-start">From</label>
                <input id="date-start" type="date" bind:value={dateRangeStart} />
              </div>
              <div class="date-field">
                <label for="date-end">To</label>
                <input id="date-end" type="date" bind:value={dateRangeEnd} />
              </div>
            </div>
          </div>
        </div>

      {:else if currentStep === 2}
        <div class="step-content">
          <h3>Apply Filters</h3>
          <p class="step-description">Filter which records to include in the report.</p>

          <div class="filter-section">
            <div class="filter-header">
              <h4>Trial</h4>
              <div class="filter-toggle">
                <label>
                  <input type="radio" bind:group={trialFilter} value="all" />
                  All Trials
                </label>
                <label>
                  <input type="radio" bind:group={trialFilter} value="specific" />
                  Specific Trials
                </label>
              </div>
            </div>
            {#if trialFilter === 'specific'}
              <div class="filter-options">
                {#each trials as trial}
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      value={trial}
                      bind:group={selectedTrials}
                    />
                    {trial}
                  </label>
                {/each}
              </div>
            {/if}
          </div>

          <div class="filter-section">
            <div class="filter-header">
              <h4>Site</h4>
              <div class="filter-toggle">
                <label>
                  <input type="radio" bind:group={siteFilter} value="all" />
                  All Sites
                </label>
                <label>
                  <input type="radio" bind:group={siteFilter} value="specific" />
                  Specific Sites
                </label>
              </div>
            </div>
            {#if siteFilter === 'specific'}
              <div class="filter-options">
                {#each sites as site}
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      value={site}
                      bind:group={selectedSites}
                    />
                    {site}
                  </label>
                {/each}
              </div>
            {/if}
          </div>

          <div class="filter-section">
            <div class="filter-header">
              <h4>Country</h4>
              <div class="filter-toggle">
                <label>
                  <input type="radio" bind:group={countryFilter} value="all" />
                  All Countries
                </label>
                <label>
                  <input type="radio" bind:group={countryFilter} value="specific" />
                  Specific Countries
                </label>
              </div>
            </div>
            {#if countryFilter === 'specific'}
              <div class="filter-options">
                {#each countries as country}
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      value={country}
                      bind:group={selectedCountries}
                    />
                    {country}
                  </label>
                {/each}
              </div>
            {/if}
          </div>

          <div class="filter-section">
            <div class="filter-header">
              <h4>File Type</h4>
              <div class="filter-toggle">
                <label>
                  <input type="radio" bind:group={fileTypeFilter} value="all" />
                  All Types
                </label>
                <label>
                  <input type="radio" bind:group={fileTypeFilter} value="specific" />
                  Specific Types
                </label>
              </div>
            </div>
            {#if fileTypeFilter === 'specific'}
              <div class="filter-options">
                {#each fileTypes as ext}
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      value={ext}
                      bind:group={selectedFileTypes}
                    />
                    .{ext}
                  </label>
                {/each}
              </div>
            {/if}
          </div>
        </div>

      {:else if currentStep === 3}
        <div class="step-content">
          <h3>Select Columns</h3>
          <p class="step-description">Choose which columns to include in the report.</p>

          <div class="column-actions">
            <button class="action-btn" on:click={selectAllColumns}>Select All</button>
            <button class="action-btn" on:click={deselectAllColumns}>Deselect All</button>
            <span class="column-count">{selectedColumns.size} columns selected</span>
          </div>

          <div class="column-categories">
            {#each COLUMN_CATEGORIES as category}
              <div class="category-section">
                <div class="category-header">
                  <h4>{category}</h4>
                  <button class="select-category-btn" on:click={() => selectCategoryColumns(category)}>
                    Select all
                  </button>
                </div>
                <div class="column-grid">
                  {#each columnsByCategory.get(category) || [] as col}
                    <label class="column-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedColumns.has(col.key)}
                        on:change={() => toggleColumn(col.key)}
                      />
                      {col.label}
                    </label>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>

      {:else if currentStep === 4}
        <div class="step-content">
          <h3>Preview & Download</h3>
          <p class="step-description">Review your report settings and download.</p>

          <div class="summary-cards">
            <div class="summary-card">
              <div class="summary-value">{filteredRecords.length.toLocaleString()}</div>
              <div class="summary-label">Total Records</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">{selectedColumns.size}</div>
              <div class="summary-label">Columns</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">
                {dateRangeStart ? formatDateDisplay(dateRangeStart) : 'All'} - {dateRangeEnd ? formatDateDisplay(dateRangeEnd) : 'All'}
              </div>
              <div class="summary-label">Date Range</div>
            </div>
          </div>

          <div class="filters-summary">
            <h4>Applied Filters</h4>
            <ul>
              <li>Trials: {trialFilter === 'all' ? 'All' : selectedTrials.join(', ')}</li>
              <li>Sites: {siteFilter === 'all' ? 'All' : selectedSites.length + ' selected'}</li>
              <li>Countries: {countryFilter === 'all' ? 'All' : selectedCountries.join(', ')}</li>
              <li>File Types: {fileTypeFilter === 'all' ? 'All' : selectedFileTypes.map(t => '.' + t).join(', ')}</li>
            </ul>
          </div>

          <div class="preview-section">
            <h4>Data Preview (First 10 rows, {selectedColumns.size} columns)</h4>
            {#if previewRecords.length > 0}
              <div class="preview-table-container">
                <table class="preview-table">
                  <thead>
                    <tr>
                      {#each Array.from(selectedColumns) as colKey}
                        <th>{getColumnLabel(colKey)}</th>
                      {/each}
                    </tr>
                  </thead>
                  <tbody>
                    {#each previewRecords as record}
                      <tr>
                        {#each Array.from(selectedColumns) as colKey}
                          <td>
                            {#if colKey === 'uploadDate'}
                              {format(record.uploadDate, 'dd/MM/yyyy')}
                            {:else if colKey === 'reviewed'}
                              {record.reviewed ? 'Yes' : 'No'}
                            {:else if colKey === 'assetLink'}
                              {record.assetLink ? 'Link' : '-'}
                            {:else}
                              {record[colKey] || '-'}
                            {/if}
                          </td>
                        {/each}
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <div class="no-data">No records match the selected filters.</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="wizard-footer">
      <div class="footer-left">
        {#if currentStep > 1}
          <button class="btn-secondary" on:click={prevStep}>Back</button>
        {/if}
      </div>
      <div class="footer-right">
        <button class="btn-secondary" on:click={handleClose}>Cancel</button>
        {#if currentStep < totalSteps}
          <button
            class="btn-primary"
            on:click={nextStep}
            disabled={currentStep === 1 && !step1Valid || currentStep === 3 && !step3Valid}
          >
            Next
          </button>
        {:else}
          <button
            class="btn-primary download-btn"
            on:click={downloadReport}
            disabled={generating || filteredRecords.length === 0}
          >
            {#if generating}
              Generating...
            {:else}
              Download Excel
            {/if}
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
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
    z-index: 2000;
    padding: 1rem;
  }

  .wizard-modal {
    background: var(--white);
    border-radius: 0.5rem;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .wizard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--neutral-200);
    background: var(--neutral-50);
    border-radius: 0.5rem 0.5rem 0 0;
  }

  .header-content {
    flex: 1;
  }

  .wizard-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--neutral-800);
    font-weight: 600;
  }

  .step-indicator {
    font-size: 0.75rem;
    color: var(--neutral-500);
    margin-top: 0.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.75rem;
    color: var(--neutral-500);
    cursor: pointer;
    padding: 0;
    line-height: 1;
    margin-left: 1rem;
  }

  .close-btn:hover {
    color: var(--neutral-700);
  }

  .progress-bar {
    height: 4px;
    background: var(--neutral-200);
  }

  .progress-fill {
    height: 100%;
    background: var(--chilli-red);
    transition: width 0.3s ease;
  }

  .step-labels {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    background: var(--neutral-50);
    border-bottom: 1px solid var(--neutral-100);
  }

  .step-labels span {
    font-size: 0.75rem;
    color: var(--neutral-400);
    font-weight: 500;
  }

  .step-labels span.active {
    color: var(--chilli-red);
  }

  .step-labels span.completed {
    color: var(--success-green);
  }

  .wizard-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .step-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    color: var(--neutral-800);
  }

  .step-description {
    color: var(--neutral-500);
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group > label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--neutral-700);
    margin-bottom: 0.5rem;
  }

  .form-group input[type="text"] {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--neutral-300);
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .form-group input[type="text"]:focus {
    outline: none;
    border-color: var(--chilli-red);
    box-shadow: 0 0 0 2px rgba(200, 16, 46, 0.1);
  }

  .date-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .preset-btn {
    padding: 0.375rem 0.75rem;
    background: var(--white);
    border: 1px solid var(--neutral-300);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: var(--neutral-700);
    cursor: pointer;
    transition: all 0.15s;
  }

  .preset-btn:hover {
    background: var(--neutral-100);
    border-color: var(--chilli-red);
  }

  .date-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .date-field label {
    display: block;
    font-size: 0.75rem;
    color: var(--neutral-500);
    margin-bottom: 0.25rem;
  }

  .date-field input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--neutral-300);
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .filter-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--neutral-50);
    border-radius: 0.375rem;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .filter-header h4 {
    margin: 0;
    font-size: 0.875rem;
    color: var(--neutral-800);
  }

  .filter-toggle {
    display: flex;
    gap: 1rem;
  }

  .filter-toggle label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--neutral-600);
    cursor: pointer;
  }

  .filter-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.5rem;
    max-height: 150px;
    overflow-y: auto;
    padding: 0.5rem;
    background: var(--white);
    border-radius: 0.25rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--neutral-700);
    cursor: pointer;
  }

  .column-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .action-btn {
    padding: 0.375rem 0.75rem;
    background: var(--white);
    border: 1px solid var(--neutral-300);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: var(--neutral-700);
    cursor: pointer;
  }

  .action-btn:hover {
    background: var(--neutral-100);
  }

  .column-count {
    font-size: 0.75rem;
    color: var(--neutral-500);
    margin-left: auto;
  }

  .column-categories {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .category-section {
    padding: 1rem;
    background: var(--neutral-50);
    border-radius: 0.375rem;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .category-header h4 {
    margin: 0;
    font-size: 0.875rem;
    color: var(--neutral-700);
  }

  .select-category-btn {
    background: none;
    border: none;
    color: var(--chilli-red);
    font-size: 0.7rem;
    cursor: pointer;
    text-decoration: underline;
  }

  .column-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.5rem;
  }

  .column-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--neutral-700);
    cursor: pointer;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .summary-card {
    padding: 1rem;
    background: var(--neutral-50);
    border-radius: 0.375rem;
    text-align: center;
  }

  .summary-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--chilli-red);
    margin-bottom: 0.25rem;
  }

  .summary-label {
    font-size: 0.75rem;
    color: var(--neutral-500);
  }

  .filters-summary {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--neutral-50);
    border-radius: 0.375rem;
  }

  .filters-summary h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    color: var(--neutral-800);
  }

  .filters-summary ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.8rem;
    color: var(--neutral-600);
  }

  .filters-summary li {
    margin-bottom: 0.25rem;
  }

  .preview-section h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    color: var(--neutral-800);
  }

  .preview-table-container {
    overflow-x: auto;
    border: 1px solid var(--neutral-200);
    border-radius: 0.375rem;
    max-height: 300px;
    position: relative;
  }

  .preview-table {
    min-width: max-content;
    border-collapse: collapse;
    font-size: 0.75rem;
  }

  .preview-table th {
    text-align: left;
    padding: 0.5rem 0.75rem;
    background: var(--neutral-100);
    color: var(--neutral-700);
    font-weight: 600;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 1;
    border-bottom: 2px solid var(--neutral-300);
  }

  .preview-table td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--neutral-100);
    color: var(--neutral-600);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-table tbody tr:hover {
    background: var(--neutral-50);
  }

  .no-data {
    padding: 2rem;
    text-align: center;
    color: var(--neutral-500);
    font-size: 0.875rem;
  }

  .wizard-footer {
    display: flex;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--neutral-200);
    background: var(--neutral-50);
    border-radius: 0 0 0.5rem 0.5rem;
  }

  .footer-left,
  .footer-right {
    display: flex;
    gap: 0.75rem;
  }

  .btn-secondary,
  .btn-primary {
    padding: 0.625rem 1.25rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary {
    background: var(--white);
    color: var(--neutral-700);
    border: 1px solid var(--neutral-300);
  }

  .btn-secondary:hover {
    background: var(--neutral-100);
  }

  .btn-primary {
    background: var(--chilli-red);
    color: white;
    border: none;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--chilli-red-dark);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .download-btn {
    min-width: 140px;
  }

  @media (max-width: 640px) {
    .wizard-modal {
      margin: 0.5rem;
      max-height: calc(100vh - 1rem);
    }

    .summary-cards {
      grid-template-columns: 1fr;
    }

    .date-inputs {
      grid-template-columns: 1fr;
    }

    .filter-options,
    .column-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
