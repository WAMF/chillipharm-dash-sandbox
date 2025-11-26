<script lang="ts">
  import type { AssetRecord, ExportColumn } from '../types';
  import {
    availableColumns,
    exportToCSV,
    exportToPDF,
    exportFullReportToPDF,
    getExportFilename
  } from '../utils/exportUtils';

  export let records: AssetRecord[] = [];
  export let activeTab: string = 'overview';

  let showDropdown = false;
  let showColumnModal = false;
  let columns: ExportColumn[] = [...availableColumns];

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function closeDropdown() {
    showDropdown = false;
  }

  function handleCSVExport() {
    showColumnModal = true;
    showDropdown = false;
  }

  function handleCSVExportAllColumns() {
    const allSelected = columns.map(col => ({ ...col, selected: true }));
    exportToCSV(records, allSelected, getExportFilename(activeTab));
    showDropdown = false;
  }

  function confirmCSVExport() {
    exportToCSV(records, columns, getExportFilename(activeTab));
    showColumnModal = false;
  }

  async function handlePDFExport() {
    showDropdown = false;
    await exportToPDF(activeTab);
  }

  async function handleFullReportPDF() {
    showDropdown = false;
    await exportFullReportToPDF();
  }

  function toggleColumn(index: number) {
    columns[index].selected = !columns[index].selected;
    columns = columns;
  }

  function selectAllColumns() {
    columns = columns.map(col => ({ ...col, selected: true }));
  }

  function deselectAllColumns() {
    columns = columns.map(col => ({ ...col, selected: false }));
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.export-container')) {
      closeDropdown();
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="export-container">
  <button class="export-btn" on:click|stopPropagation={toggleDropdown}>
    <span class="export-icon">↓</span>
    Export
    <span class="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
  </button>

  {#if showDropdown}
    <div class="dropdown-menu" on:click|stopPropagation>
      <div class="dropdown-section">
        <div class="section-label">CSV Export</div>
        <button class="dropdown-item" on:click={handleCSVExport}>
          <span class="item-icon">📄</span>
          <span class="item-text">
            <span class="item-title">Export to CSV</span>
            <span class="item-desc">Choose columns to include</span>
          </span>
        </button>
        <button class="dropdown-item" on:click={handleCSVExportAllColumns}>
          <span class="item-icon">📋</span>
          <span class="item-text">
            <span class="item-title">Export All Columns</span>
            <span class="item-desc">Include all available fields</span>
          </span>
        </button>
      </div>

      <div class="dropdown-divider"></div>

      <div class="dropdown-section">
        <div class="section-label">PDF Export</div>
        <button class="dropdown-item" on:click={handlePDFExport}>
          <span class="item-icon">📑</span>
          <span class="item-text">
            <span class="item-title">Export Current Tab</span>
            <span class="item-desc">Print current view as PDF</span>
          </span>
        </button>
        <button class="dropdown-item" on:click={handleFullReportPDF}>
          <span class="item-icon">📚</span>
          <span class="item-text">
            <span class="item-title">Full Report</span>
            <span class="item-desc">Print all dashboard tabs</span>
          </span>
        </button>
      </div>

      <div class="dropdown-footer">
        <span class="record-info">{records.length.toLocaleString()} records</span>
      </div>
    </div>
  {/if}
</div>

{#if showColumnModal}
  <div class="modal-overlay" on:click={() => showColumnModal = false}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h3>Select Columns to Export</h3>
        <button class="modal-close" on:click={() => showColumnModal = false}>×</button>
      </div>

      <div class="modal-body">
        <div class="column-actions">
          <button class="action-btn" on:click={selectAllColumns}>Select All</button>
          <button class="action-btn" on:click={deselectAllColumns}>Deselect All</button>
          <span class="selected-count">
            {columns.filter(c => c.selected).length} of {columns.length} selected
          </span>
        </div>

        <div class="columns-grid">
          {#each columns as column, index}
            <label class="column-checkbox">
              <input
                type="checkbox"
                checked={column.selected}
                on:change={() => toggleColumn(index)}
              />
              <span class="checkbox-label">{column.label}</span>
            </label>
          {/each}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" on:click={() => showColumnModal = false}>Cancel</button>
        <button
          class="btn-primary"
          on:click={confirmCSVExport}
          disabled={columns.filter(c => c.selected).length === 0}
        >
          Export {records.length.toLocaleString()} Records
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .export-container {
    position: relative;
  }

  .export-btn {
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

  .export-btn:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .export-icon {
    font-size: 1rem;
  }

  .dropdown-arrow {
    font-size: 0.625rem;
    margin-left: 0.25rem;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: var(--white);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-lg);
    min-width: 280px;
    z-index: 1000;
    overflow: hidden;
  }

  .dropdown-section {
    padding: 0.5rem 0;
  }

  .section-label {
    padding: 0.5rem 1rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--neutral-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .dropdown-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;
  }

  .dropdown-item:hover {
    background: var(--neutral-50);
  }

  .item-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .item-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .item-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--neutral-800);
  }

  .item-desc {
    font-size: 0.75rem;
    color: var(--neutral-500);
  }

  .dropdown-divider {
    height: 1px;
    background: var(--neutral-200);
    margin: 0;
  }

  .dropdown-footer {
    padding: 0.75rem 1rem;
    background: var(--neutral-50);
    border-top: 1px solid var(--neutral-200);
  }

  .record-info {
    font-size: 0.75rem;
    color: var(--neutral-500);
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
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--neutral-200);
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--neutral-800);
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--neutral-500);
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .modal-close:hover {
    color: var(--neutral-700);
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .column-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--neutral-100);
  }

  .action-btn {
    padding: 0.375rem 0.75rem;
    background: var(--neutral-100);
    border: 1px solid var(--neutral-200);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: var(--neutral-700);
    cursor: pointer;
    transition: all 0.15s;
  }

  .action-btn:hover {
    background: var(--neutral-200);
  }

  .selected-count {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--neutral-500);
  }

  .columns-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .column-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .column-checkbox:hover {
    background: var(--neutral-50);
  }

  .column-checkbox input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--chilli-red);
  }

  .checkbox-label {
    font-size: 0.875rem;
    color: var(--neutral-700);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--neutral-200);
    background: var(--neutral-50);
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.625rem 1.25rem;
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

  .btn-primary:hover:not(:disabled) {
    background: var(--chilli-red-dark);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: var(--white);
    color: var(--neutral-700);
    border: 1px solid var(--neutral-300);
  }

  .btn-secondary:hover {
    background: var(--neutral-100);
  }

  @media (max-width: 640px) {
    .modal {
      margin: 1rem;
      max-height: calc(100vh - 2rem);
    }

    .columns-grid {
      grid-template-columns: 1fr;
    }
  }

  @media print {
    .export-container {
      display: none;
    }
  }
</style>
