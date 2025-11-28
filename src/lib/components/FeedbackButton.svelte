<script lang="ts">
  import html2canvas from 'html2canvas';
  import { trackFeedback } from '../firebase';

  export let activeTab: string = 'overview';
  export let feedbackEmail: string = 'leeh@chillipharm.com';

  let isCapturing = false;
  let showModal = false;
  let feedbackText = '';
  let screenshotDataUrl = '';

  const tabNames: Record<string, string> = {
    'overview': 'Executive Overview',
    'sites': 'Site Performance',
    'study': 'Study Analytics',
    'video': 'Video Metrics',
    'reviews': 'Review Performance',
    'compliance': 'Compliance',
    'integration': 'Integration Health'
  };

  async function captureScreenshot(): Promise<string> {
    const contentElement = document.querySelector('.content');
    if (!contentElement) return '';

    const canvas = await html2canvas(contentElement as HTMLElement, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f9fafb',
      logging: false
    });

    return canvas.toDataURL('image/png');
  }

  async function handleFeedbackClick() {
    isCapturing = true;
    try {
      screenshotDataUrl = await captureScreenshot();
      showModal = true;
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      showModal = true;
    }
    isCapturing = false;
  }

  function downloadScreenshot() {
    if (!screenshotDataUrl) return;

    const link = document.createElement('a');
    link.download = `chillipharm-dashboard-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = screenshotDataUrl;
    link.click();
  }

  function sendFeedback() {
    const tabName = tabNames[activeTab] || activeTab;
    const timestamp = new Date().toLocaleString();
    const userAgent = navigator.userAgent;

    trackFeedback(activeTab, !!screenshotDataUrl, feedbackText.length);

    const subject = encodeURIComponent(`Dashboard Feedback: ${tabName}`);
    const body = encodeURIComponent(
`Dashboard Feedback
==================

Tab: ${tabName}
Date: ${timestamp}
Browser: ${userAgent}

Feedback:
---------
${feedbackText}

---
Note: Please attach the downloaded screenshot if applicable.
`);

    if (screenshotDataUrl) {
      downloadScreenshot();
    }

    window.location.href = `mailto:${feedbackEmail}?subject=${subject}&body=${body}`;

    closeModal();
  }

  function closeModal() {
    showModal = false;
    feedbackText = '';
    screenshotDataUrl = '';
  }
</script>

<button
  class="feedback-btn"
  on:click={handleFeedbackClick}
  disabled={isCapturing}
  title="Send Feedback"
>
  {#if isCapturing}
    <span class="spinner"></span>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  {/if}
  <span class="btn-text">Feedback</span>
</button>

{#if showModal}
  <div class="modal-overlay" on:click={closeModal} on:keydown={(e) => e.key === 'Escape' && closeModal()} role="dialog" aria-modal="true">
    <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="document">
      <div class="modal-header">
        <h3>Send Feedback</h3>
        <button class="close-btn" on:click={closeModal} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        {#if screenshotDataUrl}
          <div class="screenshot-preview">
            <img src={screenshotDataUrl} alt="Dashboard screenshot" />
            <div class="screenshot-label">Screenshot captured</div>
          </div>
        {/if}

        <div class="form-group">
          <label for="feedback-text">Your feedback</label>
          <textarea
            id="feedback-text"
            bind:value={feedbackText}
            placeholder="Tell us what you think about this dashboard view..."
            rows="4"
          ></textarea>
        </div>

        <div class="info-note">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>The screenshot will be downloaded for you to attach to the email.</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" on:click={closeModal}>Cancel</button>
        <button class="btn-primary" on:click={sendFeedback}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Send Feedback
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .feedback-btn {
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

  .feedback-btn:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .feedback-btn:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
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
    padding: 1rem;
  }

  .modal {
    background: var(--white);
    border-radius: 0.5rem;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

  .close-btn {
    background: none;
    border: none;
    color: var(--neutral-500);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: var(--neutral-100);
    color: var(--neutral-700);
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .screenshot-preview {
    border: 1px solid var(--neutral-200);
    border-radius: 0.375rem;
    overflow: hidden;
    background: var(--neutral-100);
  }

  .screenshot-preview img {
    width: 100%;
    max-height: 150px;
    object-fit: cover;
    object-position: top;
    display: block;
  }

  .screenshot-label {
    padding: 0.5rem;
    font-size: 0.75rem;
    color: var(--neutral-600);
    text-align: center;
    background: var(--neutral-50);
    border-top: 1px solid var(--neutral-200);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--neutral-700);
  }

  .form-group textarea {
    padding: 0.75rem;
    border: 1px solid var(--neutral-300);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
  }

  .form-group textarea:focus {
    outline: none;
    border-color: var(--chilli-red);
    box-shadow: 0 0 0 3px rgba(200, 16, 46, 0.1);
  }

  .info-note {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--neutral-50);
    border-radius: 0.375rem;
    font-size: 0.75rem;
    color: var(--neutral-600);
  }

  .info-note svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  @media (max-width: 480px) {
    .btn-text {
      display: none;
    }

    .feedback-btn {
      padding: 0.5rem;
    }
  }

  @media print {
    .feedback-btn {
      display: none;
    }
  }
</style>
