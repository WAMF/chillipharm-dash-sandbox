<script lang="ts">
  import type { AssetRecord } from '../types';
  import { assetModalStore } from '../stores/assetModalStore';
  import { format, parseISO } from 'date-fns';

  export let asset: AssetRecord;

  function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    try {
      const d = typeof date === 'string' ? parseISO(date) : date;
      return format(d, 'dd/MM/yyyy HH:mm');
    } catch {
      return '-';
    }
  }

  function formatDateOnly(date: string | null | undefined): string {
    if (!date) return '-';
    try {
      return format(parseISO(date), 'dd/MM/yyyy');
    } catch {
      return date;
    }
  }

  function handleClose() {
    assetModalStore.closeDetail();
  }

  function handleViewAsset() {
    if (asset.assetLink) {
      window.open(asset.assetLink, '_blank', 'noopener,noreferrer');
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-overlay" on:click={handleClose} on:keydown={handleKeydown} role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="document">
    <div class="modal-header">
      <div class="header-content">
        <h2 id="modal-title">{asset.assetTitle || 'Asset Details'}</h2>
        <span class="asset-id">ID: {asset.assetId}</span>
      </div>
      <button class="close-btn" on:click={handleClose} aria-label="Close">
        <span>&times;</span>
      </button>
    </div>

    <div class="modal-body">
      <div class="detail-grid">
        <section class="detail-section">
          <h3>Trial & Site</h3>
          <dl>
            <div class="detail-row">
              <dt>Trial</dt>
              <dd>{asset.trialName || '-'}</dd>
            </div>
            <div class="detail-row">
              <dt>Site</dt>
              <dd>{asset.siteName || '-'}</dd>
            </div>
            <div class="detail-row">
              <dt>Country</dt>
              <dd>{asset.siteCountry || '-'}</dd>
            </div>
          </dl>
        </section>

        <section class="detail-section">
          <h3>Subject & Study</h3>
          <dl>
            <div class="detail-row">
              <dt>Subject Number</dt>
              <dd>{asset.subjectNumber || '-'}</dd>
            </div>
            <div class="detail-row">
              <dt>Study Arm</dt>
              <dd>{asset.studyArm || '-'}</dd>
            </div>
            <div class="detail-row">
              <dt>Study Event</dt>
              <dd>{asset.studyEvent || '-'}</dd>
            </div>
            <div class="detail-row">
              <dt>Procedure</dt>
              <dd>{asset.studyProcedure || '-'}</dd>
            </div>
            <div class="detail-row">
              <dt>Procedure Date</dt>
              <dd>{formatDateOnly(asset.studyProcedureDate)}</dd>
            </div>
            <div class="detail-row">
              <dt>Evaluator</dt>
              <dd>{asset.evaluator || '-'}</dd>
            </div>
          </dl>
        </section>

        <section class="detail-section">
          <h3>Upload Info</h3>
          <dl>
            <div class="detail-row">
              <dt>Upload Date</dt>
              <dd>{formatDate(asset.uploadDate)}</dd>
            </div>
            <div class="detail-row">
              <dt>Uploaded By</dt>
              <dd>{asset.uploadedBy || '-'}</dd>
            </div>
            <div class="detail-row">
              <dt>Duration</dt>
              <dd>{asset.assetDuration || '-'}</dd>
            </div>
            <div class="detail-row">
              <dt>File Size</dt>
              <dd>{asset.fileSize || '-'}</dd>
            </div>
          </dl>
        </section>

        <section class="detail-section">
          <h3>Review Status</h3>
          <dl>
            <div class="detail-row">
              <dt>Processed</dt>
              <dd>
                <span class="status-badge" class:success={asset.processed === 'Yes'} class:pending={asset.processed !== 'Yes'}>
                  {asset.processed || 'No'}
                </span>
              </dd>
            </div>
            <div class="detail-row">
              <dt>Reviewed</dt>
              <dd>
                <span class="status-badge" class:success={asset.reviewed} class:pending={!asset.reviewed}>
                  {asset.reviewed ? 'Yes' : 'Pending'}
                </span>
              </dd>
            </div>
            {#if asset.reviewed}
              <div class="detail-row">
                <dt>Reviewed By</dt>
                <dd>{asset.reviewedBy || '-'}</dd>
              </div>
              <div class="detail-row">
                <dt>Review Date</dt>
                <dd>{formatDateOnly(asset.reviewedDate)}</dd>
              </div>
            {/if}
          </dl>
        </section>
      </div>

      {#if asset.comments}
        <section class="comments-section">
          <h3>Comments</h3>
          <div class="comments-content">
            {asset.comments}
          </div>
        </section>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" on:click={handleClose}>Close</button>
      {#if asset.assetLink}
        <button class="btn-primary" on:click={handleViewAsset}>
          <span class="btn-icon">&#8599;</span>
          View Asset
        </button>
      {/if}
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
    max-width: 800px;
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
    min-width: 0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--neutral-800);
    font-weight: 600;
    word-break: break-word;
  }

  .asset-id {
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
    flex-shrink: 0;
  }

  .close-btn:hover {
    color: var(--neutral-700);
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .detail-section {
    background: var(--neutral-50);
    border-radius: 0.375rem;
    padding: 1rem;
  }

  .detail-section h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--chilli-red);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--neutral-200);
  }

  dl {
    margin: 0;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.375rem 0;
    gap: 0.5rem;
  }

  .detail-row:not(:last-child) {
    border-bottom: 1px solid var(--neutral-100);
  }

  dt {
    font-size: 0.75rem;
    color: var(--neutral-500);
    flex-shrink: 0;
  }

  dd {
    font-size: 0.875rem;
    color: var(--neutral-800);
    margin: 0;
    text-align: right;
    word-break: break-word;
  }

  .status-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-badge.success {
    background: var(--success-green-light, #dcfce7);
    color: var(--success-green, #16a34a);
  }

  .status-badge.pending {
    background: var(--warning-orange-light, #fef3c7);
    color: var(--warning-orange, #d97706);
  }

  .comments-section {
    margin-top: 1.5rem;
    background: var(--neutral-50);
    border-radius: 0.375rem;
    padding: 1rem;
  }

  .comments-section h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--chilli-red);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--neutral-200);
  }

  .comments-content {
    font-size: 0.875rem;
    color: var(--neutral-700);
    line-height: 1.5;
    white-space: pre-wrap;
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

  .btn-primary,
  .btn-secondary {
    padding: 0.625rem 1.25rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .btn-icon {
    font-size: 1rem;
  }

  @media (max-width: 640px) {
    .modal {
      margin: 0.5rem;
      max-height: calc(100vh - 1rem);
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }

    .modal-header {
      padding: 1rem;
    }

    .modal-body {
      padding: 1rem;
    }

    .modal-footer {
      padding: 0.75rem 1rem;
    }
  }
</style>
