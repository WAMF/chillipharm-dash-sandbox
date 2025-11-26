<script lang="ts">
  import type { AssetRecord } from '../types';
  import { assetModalStore } from '../stores/assetModalStore';
  import { format, parseISO } from 'date-fns';

  export let title: string;
  export let assets: AssetRecord[];

  let searchTerm = '';
  let sortField: keyof AssetRecord = 'uploadDate';
  let sortDirection: 'asc' | 'desc' = 'desc';

  const PAGE_SIZE = 25;
  let currentPage = 1;

  $: filteredAssets = assets.filter(asset => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      asset.assetTitle?.toLowerCase().includes(term) ||
      asset.siteName?.toLowerCase().includes(term) ||
      asset.subjectNumber?.toLowerCase().includes(term) ||
      asset.uploadedBy?.toLowerCase().includes(term) ||
      asset.studyProcedure?.toLowerCase().includes(term)
    );
  });

  $: sortedAssets = [...filteredAssets].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime();
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  $: totalPages = Math.ceil(sortedAssets.length / PAGE_SIZE);
  $: paginatedAssets = sortedAssets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  $: if (searchTerm) {
    currentPage = 1;
  }

  function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    try {
      const d = typeof date === 'string' ? parseISO(date) : date;
      return format(d, 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  }

  function handleClose() {
    assetModalStore.closeList();
  }

  function handleRowClick(asset: AssetRecord) {
    assetModalStore.viewAssetFromList(asset);
  }

  function handleViewAsset(event: MouseEvent, asset: AssetRecord) {
    event.stopPropagation();
    if (asset.assetLink) {
      window.open(asset.assetLink, '_blank', 'noopener,noreferrer');
    }
  }

  function handleSort(field: keyof AssetRecord) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'desc';
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-overlay" on:click={handleClose} on:keydown={handleKeydown} role="dialog" aria-modal="true" aria-labelledby="list-modal-title">
  <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="document">
    <div class="modal-header">
      <div class="header-content">
        <h2 id="list-modal-title">{title}</h2>
        <span class="record-count">{filteredAssets.length} record{filteredAssets.length !== 1 ? 's' : ''}</span>
      </div>
      <button class="close-btn" on:click={handleClose} aria-label="Close">
        <span>&times;</span>
      </button>
    </div>

    <div class="modal-toolbar">
      <div class="search-box">
        <input
          type="text"
          placeholder="Search assets..."
          bind:value={searchTerm}
          class="search-input"
        />
        {#if searchTerm}
          <button class="clear-search" on:click={() => searchTerm = ''}>
            &times;
          </button>
        {/if}
      </div>
    </div>

    <div class="modal-body">
      {#if paginatedAssets.length === 0}
        <div class="empty-state">
          <p>No assets found{searchTerm ? ' matching your search' : ''}</p>
        </div>
      {:else}
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="sortable" on:click={() => handleSort('assetTitle')}>
                  Asset
                  {#if sortField === 'assetTitle'}
                    <span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  {/if}
                </th>
                <th class="sortable" on:click={() => handleSort('siteName')}>
                  Site
                  {#if sortField === 'siteName'}
                    <span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  {/if}
                </th>
                <th class="sortable" on:click={() => handleSort('subjectNumber')}>
                  Subject
                  {#if sortField === 'subjectNumber'}
                    <span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  {/if}
                </th>
                <th class="sortable" on:click={() => handleSort('uploadDate')}>
                  Upload Date
                  {#if sortField === 'uploadDate'}
                    <span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  {/if}
                </th>
                <th>Status</th>
                <th class="action-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {#each paginatedAssets as asset}
                <tr class="clickable" on:click={() => handleRowClick(asset)}>
                  <td class="asset-cell">
                    <span class="asset-title">{asset.assetTitle || '-'}</span>
                    {#if asset.studyProcedure}
                      <span class="asset-procedure">{asset.studyProcedure}</span>
                    {/if}
                  </td>
                  <td>{asset.siteName || '-'}</td>
                  <td>{asset.subjectNumber || '-'}</td>
                  <td>{formatDate(asset.uploadDate)}</td>
                  <td>
                    <span class="status-badge" class:reviewed={asset.reviewed} class:pending={!asset.reviewed}>
                      {asset.reviewed ? 'Reviewed' : 'Pending'}
                    </span>
                  </td>
                  <td class="action-col">
                    {#if asset.assetLink}
                      <button
                        class="view-btn"
                        on:click={(e) => handleViewAsset(e, asset)}
                        title="View Asset"
                      >
                        &#8599;
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

    {#if totalPages > 1}
      <div class="pagination">
        <button
          class="page-btn"
          disabled={currentPage === 1}
          on:click={() => goToPage(currentPage - 1)}
        >
          Previous
        </button>
        <span class="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          class="page-btn"
          disabled={currentPage === totalPages}
          on:click={() => goToPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    {/if}

    <div class="modal-footer">
      <button class="btn-secondary" on:click={handleClose}>Close</button>
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

  .modal {
    background: var(--white);
    border-radius: 0.5rem;
    width: 100%;
    max-width: 1000px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .modal-header {
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

  .modal-header h2 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--neutral-800);
    font-weight: 600;
  }

  .record-count {
    font-size: 0.75rem;
    color: var(--neutral-500);
    margin-top: 0.25rem;
    display: block;
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

  .modal-toolbar {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--neutral-100);
    background: var(--white);
  }

  .search-box {
    position: relative;
    max-width: 300px;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid var(--neutral-300);
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--chilli-red);
    box-shadow: 0 0 0 2px rgba(200, 16, 46, 0.1);
  }

  .clear-search {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--neutral-400);
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
  }

  .clear-search:hover {
    color: var(--neutral-600);
  }

  .modal-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .table-container {
    overflow: auto;
    flex: 1;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  thead {
    position: sticky;
    top: 0;
    background: var(--neutral-50);
    z-index: 1;
  }

  th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-weight: 600;
    color: var(--neutral-600);
    border-bottom: 1px solid var(--neutral-200);
    white-space: nowrap;
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
  }

  th.sortable:hover {
    color: var(--chilli-red);
  }

  .sort-indicator {
    font-size: 0.625rem;
    margin-left: 0.25rem;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--neutral-100);
    color: var(--neutral-700);
  }

  tr.clickable {
    cursor: pointer;
  }

  tr.clickable:hover {
    background: var(--neutral-50);
  }

  .asset-cell {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .asset-title {
    font-weight: 500;
    color: var(--neutral-800);
  }

  .asset-procedure {
    font-size: 0.75rem;
    color: var(--neutral-500);
  }

  .action-col {
    width: 60px;
    text-align: center;
  }

  .status-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-badge.reviewed {
    background: var(--success-green-light, #dcfce7);
    color: var(--success-green, #16a34a);
  }

  .status-badge.pending {
    background: var(--warning-orange-light, #fef3c7);
    color: var(--warning-orange, #d97706);
  }

  .view-btn {
    background: var(--chilli-red);
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .view-btn:hover {
    background: var(--chilli-red-dark);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--neutral-500);
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.75rem 1.5rem;
    border-top: 1px solid var(--neutral-100);
    background: var(--white);
  }

  .page-btn {
    padding: 0.375rem 0.75rem;
    background: var(--white);
    border: 1px solid var(--neutral-300);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: var(--neutral-700);
    cursor: pointer;
  }

  .page-btn:hover:not(:disabled) {
    background: var(--neutral-100);
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 0.75rem;
    color: var(--neutral-500);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--neutral-200);
    background: var(--neutral-50);
    border-radius: 0 0 0.5rem 0.5rem;
  }

  .btn-secondary {
    padding: 0.625rem 1.25rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--white);
    color: var(--neutral-700);
    border: 1px solid var(--neutral-300);
  }

  .btn-secondary:hover {
    background: var(--neutral-100);
  }

  @media (max-width: 768px) {
    .modal {
      margin: 0.5rem;
      max-height: calc(100vh - 1rem);
    }

    th, td {
      padding: 0.5rem;
    }

    .modal-toolbar {
      padding: 0.75rem 1rem;
    }

    .search-box {
      max-width: 100%;
    }
  }
</style>
