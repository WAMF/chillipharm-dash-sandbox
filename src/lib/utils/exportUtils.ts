import type { AssetRecord, ExportColumn } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const availableColumns: ExportColumn[] = [
  { key: 'assetId', label: 'Asset ID', selected: true },
  { key: 'assetTitle', label: 'Asset Title', selected: true },
  { key: 'trialName', label: 'Trial Name', selected: true },
  { key: 'siteName', label: 'Site Name', selected: true },
  { key: 'siteCountry', label: 'Country', selected: true },
  { key: 'subjectNumber', label: 'Subject Number', selected: true },
  { key: 'studyArm', label: 'Study Arm', selected: true },
  { key: 'studyEvent', label: 'Study Event', selected: true },
  { key: 'studyProcedure', label: 'Procedure', selected: true },
  { key: 'studyProcedureDate', label: 'Procedure Date', selected: false },
  { key: 'evaluator', label: 'Evaluator', selected: false },
  { key: 'uploadDate', label: 'Upload Date', selected: true },
  { key: 'uploadedBy', label: 'Uploaded By', selected: false },
  { key: 'processed', label: 'Processed', selected: true },
  { key: 'assetDuration', label: 'Duration', selected: true },
  { key: 'reviewed', label: 'Reviewed', selected: true },
  { key: 'reviewedBy', label: 'Reviewed By', selected: false },
  { key: 'reviewedDate', label: 'Review Date', selected: false },
  { key: 'fileSize', label: 'File Size', selected: false },
  { key: 'comments', label: 'Comments', selected: false }
];

function formatDateDDMMYYYY(date: Date | string | null): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return '';

  let stringValue: string;

  if (value instanceof Date) {
    stringValue = formatDateDDMMYYYY(value);
  } else if (typeof value === 'boolean') {
    stringValue = value ? 'Yes' : 'No';
  } else {
    stringValue = String(value);
  }

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function exportToCSV(
  records: AssetRecord[],
  selectedColumns: ExportColumn[],
  filename: string = 'export'
): void {
  const columns = selectedColumns.filter(col => col.selected);

  if (columns.length === 0) {
    alert('Please select at least one column to export');
    return;
  }

  const headers = columns.map(col => col.label);
  const rows = records.map(record =>
    columns.map(col => {
      const value = record[col.key];
      return escapeCSVValue(value);
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}_${formatDateDDMMYYYY(new Date()).replace(/\//g, '-')}.csv`);
}

export function exportMetricsSummaryToCSV(
  metrics: Record<string, unknown>,
  filename: string = 'metrics_summary'
): void {
  const rows = Object.entries(metrics).map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `${escapeCSVValue(label)},${escapeCSVValue(value)}`;
  });

  const csvContent = ['Metric,Value', ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}_${formatDateDDMMYYYY(new Date()).replace(/\//g, '-')}.csv`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function showLoadingOverlay(message: string): void {
  const overlay = document.createElement('div');
  overlay.id = 'pdf-loading-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <div style="
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <p id="pdf-loading-message" style="margin-top: 1rem; font-size: 1.125rem;">${message}</p>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(overlay);
}

function updateLoadingMessage(message: string): void {
  const messageEl = document.getElementById('pdf-loading-message');
  if (messageEl) {
    messageEl.textContent = message;
  }
}

function removeLoadingOverlay(): void {
  const overlay = document.getElementById('pdf-loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

async function captureElementToPDF(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const pdfWidth = 297;
  const pdfHeight = 210;
  const margin = 10;

  const contentWidth = pdfWidth - (margin * 2);
  const contentHeight = pdfHeight - (margin * 2);

  const scale = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const xOffset = (pdfWidth - scaledWidth) / 2;
  const yOffset = margin;

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
  pdf.save(filename);
}

function waitForRender(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 100);
      });
    });
  });
}

function waitForMapTiles(element: HTMLElement, timeout: number = 3000): Promise<void> {
  return new Promise(resolve => {
    const startTime = Date.now();

    const checkTiles = () => {
      const mapContainer = element.querySelector('.leaflet-container');
      if (mapContainer) {
        const tiles = mapContainer.querySelectorAll('.leaflet-tile-loaded');
        const pendingTiles = mapContainer.querySelectorAll('.leaflet-tile:not(.leaflet-tile-loaded)');

        if (pendingTiles.length === 0 && tiles.length > 0) {
          setTimeout(resolve, 500);
          return;
        }
      }

      if (Date.now() - startTime > timeout) {
        resolve();
        return;
      }

      setTimeout(checkTiles, 200);
    };

    checkTiles();
  });
}

async function captureMultipleElementsToPDF(elements: HTMLElement[], filename: string, titles: string[]): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 297;
  const pdfHeight = 210;
  const margin = 10;
  const titleHeight = 15;

  for (let i = 0; i < elements.length; i++) {
    updateLoadingMessage(`Rendering page ${i + 1} of ${elements.length}...`);

    if (i > 0) {
      pdf.addPage();
    }

    pdf.setFontSize(16);
    pdf.setTextColor(200, 16, 46);
    pdf.text(titles[i], margin, margin + 5);

    const element = elements[i];

    element.scrollIntoView({ behavior: 'instant', block: 'start' });

    await waitForRender();

    window.dispatchEvent(new Event('resize'));
    await waitForRender();

    if (element.querySelector('.leaflet-container')) {
      updateLoadingMessage(`Loading map tiles for page ${i + 1}...`);
      await waitForMapTiles(element);
    }

    updateLoadingMessage(`Capturing page ${i + 1} of ${elements.length}...`);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2) - titleHeight;

    const scale = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    const xOffset = (pdfWidth - scaledWidth) / 2;
    const yOffset = margin + titleHeight;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
  }

  pdf.save(filename);
}

export async function exportToPDF(tabName: string): Promise<void> {
  showLoadingOverlay('Preparing to capture...');

  try {
    const contentElement = document.querySelector('.screen-content') as HTMLElement;
    if (!contentElement) {
      throw new Error('Content element not found');
    }

    await waitForRender();

    if (contentElement.querySelector('.leaflet-container')) {
      updateLoadingMessage('Waiting for map tiles...');
      await waitForMapTiles(contentElement);
    }

    updateLoadingMessage('Capturing current view...');

    const title = getTabTitle(tabName);
    const filename = `ChilliPharm_${title.replace(/\s+/g, '_')}_${formatDateDDMMYYYY(new Date()).replace(/\//g, '-')}.pdf`;

    await captureElementToPDF(contentElement, filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Failed to export PDF. Please try again.');
  } finally {
    removeLoadingOverlay();
  }
}

export async function exportFullReportToPDF(): Promise<void> {
  showLoadingOverlay('Preparing full report...');

  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const sections = document.querySelectorAll('.print-tab-section');
    if (sections.length === 0) {
      throw new Error('No report sections found');
    }

    document.body.classList.add('print-full-report');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const elements: HTMLElement[] = [];
    const titles: string[] = [];

    sections.forEach((section) => {
      const titleEl = section.querySelector('.print-section-title');
      titles.push(titleEl?.textContent || 'Section');
      elements.push(section as HTMLElement);
    });

    const filename = `ChilliPharm_Full_Report_${formatDateDDMMYYYY(new Date()).replace(/\//g, '-')}.pdf`;

    await captureMultipleElementsToPDF(elements, filename, titles);
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Failed to export PDF. Please try again.');
  } finally {
    document.body.classList.remove('print-full-report');
    removeLoadingOverlay();
  }
}

function getTabTitle(tabName: string): string {
  const titles: Record<string, string> = {
    overview: 'Executive Overview',
    sites: 'Site Performance',
    study: 'Study Analytics',
    video: 'Video Metrics',
    reviews: 'Review Performance',
    compliance: 'Compliance Monitoring',
    integration: 'Integration Health'
  };
  return titles[tabName] || 'Dashboard';
}

export function getExportFilename(tabName: string): string {
  const baseName = getTabTitle(tabName).toLowerCase().replace(/\s+/g, '_');
  return `chillipharm_${baseName}`;
}
