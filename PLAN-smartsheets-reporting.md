# SmartSheets Reporting Feature - Implementation Plan

## Phase 1: Report Generator with Preview (Current Focus)

Build a Report Wizard that generates and downloads Excel reports with filtering, replacing the current Export functionality.

---

## Report Spec Requirements (MVP Must Have)

| Requirement | Implementation |
|-------------|----------------|
| Pull Asset report with specific columns | Column selection in wizard |
| Filter by Site/Library (all or specific) | Site multi-select filter |
| Filter by File Type (all or specific) | File type filter based on asset extensions |
| Date range filter | Date picker for upload date range |
| Excel attachment | Generate and download .xlsx file |
| Hyperlinks to assets | assetLink column as clickable URLs |

---

## Phase 1 Architecture

### Frontend Components

1. **ReportWizard.svelte** - Multi-step wizard modal (replaces Export dropdown)
   - Step 1: Report Configuration (name, date range)
   - Step 2: Filters (Sites/Libraries, File Types, Trials)
   - Step 3: Column Selection
   - Step 4: Preview & Download

2. **ReportPreview.svelte** - Shows filtered data preview before download

### Report Generation

- Client-side Excel generation using SheetJS (xlsx) library
- No backend changes needed for Phase 1
- Uses existing filtered records from dashboard

---

## Wizard Steps Detail

### Step 1: Report Configuration
- Report name (for filename)
- Date range picker:
  - Upload Date From
  - Upload Date To
  - Quick presets: Last 7 days, Last 30 days, Last 90 days, All Time

### Step 2: Filters
- **Site/Library Filter:**
  - Toggle: All Sites / Specific Sites
  - Multi-select list when "Specific Sites" selected

- **File Type Filter:**
  - Toggle: All File Types / Specific Types
  - Extract unique file extensions from assetTitle
  - Multi-select for extensions (.mp4, .mov, .pdf, etc.)

- **Trial Filter:**
  - Toggle: All Trials / Specific Trials
  - Multi-select list when "Specific Trials" selected

- **Country Filter (optional):**
  - Toggle: All Countries / Specific Countries

### Step 3: Column Selection
- Checkbox grid for all available columns
- Select All / Deselect All buttons
- Columns grouped by category:
  - **Trial Info:** Trial Name, Trial ID
  - **Site Info:** Site Name, Site ID, Site Country
  - **Subject Info:** Subject Number, Study Arm
  - **Study Info:** Study Event, Study Procedure, Procedure Date, Evaluator
  - **Asset Info:** Asset ID, Asset Title, Upload Date, Uploaded By, Duration, File Size
  - **Review Info:** Processed, Reviewed, Reviewed By, Reviewed Date, Comments
  - **Links:** Asset Link (hyperlink)

### Step 4: Preview & Download
- Summary stats:
  - Total records matching filters
  - Date range selected
  - Columns selected count
- Data preview table (first 10 rows)
- "Download Excel" button
- "Back" button to modify settings

---

## Excel Output Format

### File Naming
`{ReportName}_{YYYY-MM-DD}.xlsx`

### Sheet Structure
- Sheet name: "Asset Report"
- Row 1: Column headers (bold, frozen)
- Row 2+: Data rows
- Auto-width columns
- Date columns formatted as DD/MM/YYYY
- Asset Link column: Clickable hyperlinks

### Column Formatting
| Column | Format |
|--------|--------|
| Upload Date | DD/MM/YYYY HH:mm |
| Procedure Date | DD/MM/YYYY |
| Reviewed Date | DD/MM/YYYY |
| Asset Link | Hyperlink (clickable) |
| File Size | As-is (already formatted) |
| Duration | As-is (already formatted) |

---

## Implementation Steps

### 1. Add SheetJS Library
```bash
npm install xlsx
```

### 2. Create Types
```typescript
interface ReportConfig {
  name: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  filters: {
    sites: string[] | 'all';
    fileTypes: string[] | 'all';
    trials: string[] | 'all';
    countries: string[] | 'all';
  };
  columns: string[];
}
```

### 3. Create Components
- `src/lib/components/ReportWizard.svelte`
- `src/lib/components/ReportPreview.svelte`
- `src/lib/components/WizardStep.svelte` (reusable step wrapper)

### 4. Create Excel Export Utility
- `src/lib/utils/excelGenerator.ts`
- Handle hyperlink generation
- Column formatting
- Auto-width calculation

### 5. Update Header
- Replace "Export" button with "Generate Report" button
- Opens ReportWizard modal

### 6. Wire Up Data Flow
- Wizard filters applied to allRecords
- Preview shows filtered result
- Download generates Excel from filtered data

---

## File Types Detection

Extract from asset filenames:
```typescript
function getFileTypes(records: AssetRecord[]): string[] {
  const extensions = records
    .map(r => {
      const match = r.assetTitle.match(/\.([^.]+)$/);
      return match ? match[1].toLowerCase() : null;
    })
    .filter(Boolean);
  return [...new Set(extensions)].sort();
}
```

---

## UI/UX Notes

- Wizard uses same modal styling as current column selection modal
- Progress indicator showing current step (1/4, 2/4, etc.)
- "Back" and "Next" navigation buttons
- Validation before proceeding:
  - Step 1: Name required, valid date range
  - Step 2: At least one filter selection
  - Step 3: At least one column selected
- Loading state during Excel generation

---

## Phase 2 (Future): Scheduled Reports

After Phase 1 is complete:
- Add scheduling options (daily/weekly/monthly)
- Email delivery via SendGrid
- Backend Firebase functions
- Report management UI

---

## Won't Have (Per Spec)

- Combining Assets + Forms in single report
- Event-triggered reports
- Comments/updates as separate inclusion (comments already in data)
- Form association data

---

# Phase 1B: Dashboard Drill-Down & Asset Links

## Overview

Add drill-down functionality and asset links throughout the dashboard to enable users to access individual assets from aggregated views.

---

## New Components

### 1. AssetDetailModal.svelte
Displays full details for a single asset with link to view the actual asset.

**Contents:**
- Asset title, ID
- Trial & Site info
- Subject & Study info (arm, event, procedure)
- Upload info (date, uploader)
- Review status (reviewed by, date)
- Processing status
- File info (duration, size)
- Comments
- **"View Asset" button** → opens `assetLink` URL

### 2. AssetListModal.svelte
Shows a filtered list of assets with search and sorting.

**Features:**
- Title showing context (e.g., "Assets for Site: London")
- Sortable columns
- Search within results
- Click row → AssetDetailModal
- Quick "View" link per row
- Record count
- Export filtered list button

---

## Drill-Down Implementation by Component

### IntegrationHealth (Priority: Critical)
- **Activity list items**: Click → AssetDetailModal
- **Add "View" link** next to each activity item
- **Evaluator bars**: Click → AssetListModal (assets by evaluator)
- **Country on map**: Click → AssetListModal (assets by country)

### SitePerformance (Priority: High)
- **Site table rows**: Click → AssetListModal (assets for site)
- **Show site name in modal title**
- **Include review status breakdown**

### ReviewPerformance (Priority: High)
- **Reviewer table rows**: Click → AssetListModal (assets reviewed by person)
- **Turnaround buckets**: Click → AssetListModal (assets in that range)

### StudyAnalytics (Priority: High)
- **Study Event bars/rows**: Click → AssetListModal (assets for event)
- **Procedure table rows**: Click → AssetListModal (assets for procedure)
- **Commenter names**: Click → AssetListModal (assets with their comments)
- **Study Arm segments**: Click → AssetListModal (assets in arm)

### ComplianceMonitoring (Priority: High)
- **Compliance cards**: Click non-compliant count → AssetListModal
- **Show "Non-Compliant" or "Unknown" assets**

### VideoMetrics (Priority: Medium)
- **Duration bucket rows**: Click → AssetListModal (assets in duration range)
- **Size bucket rows**: Click → AssetListModal (assets in size range)

### ExecutiveOverview (Priority: Medium)
- **Total Assets card**: Click → AssetListModal (all assets)
- **Processing Rate**: Click → AssetListModal (unprocessed assets)
- **Review Rate**: Click → AssetListModal (pending review)

---

## State Management

### New Store: assetModalStore.ts

```typescript
interface AssetModalState {
  showDetail: boolean;
  showList: boolean;
  selectedAsset: AssetRecord | null;
  listTitle: string;
  listFilter: (record: AssetRecord) => boolean;
}

// Actions
openAssetDetail(asset: AssetRecord)
openAssetList(title: string, filterFn: (r: AssetRecord) => boolean)
closeModals()
```

---

## Implementation Order

### Step 1: Core Components
1. Create `AssetDetailModal.svelte`
2. Create `AssetListModal.svelte`
3. Create `assetModalStore.ts`
4. Add modals to `App.svelte`

### Step 2: IntegrationHealth (Quick Win)
1. Make activity items clickable
2. Add "View" links
3. Wire up evaluator click → list

### Step 3: SitePerformance & ReviewPerformance
1. Add click handlers to table rows
2. Wire up to AssetListModal

### Step 4: StudyAnalytics
1. Add click handlers to events, procedures, commenters
2. Wire up to AssetListModal

### Step 5: ComplianceMonitoring
1. Make compliance counts clickable
2. Filter to non-compliant/unknown

### Step 6: VideoMetrics & ExecutiveOverview
1. Add click handlers to distribution tables
2. Add click handlers to metric cards

---

## UI/UX Considerations

- **Cursor**: Change to pointer on clickable elements
- **Hover state**: Subtle highlight on clickable rows
- **Visual indicator**: Small arrow or ">" icon on clickable items
- **Consistent behavior**: Same modal pattern throughout
- **Escape to close**: Keyboard support for modals
- **Click outside**: Close modal on backdrop click

---

## Data Flow

```
Dashboard Component
  ↓ (user clicks item)
assetModalStore.openAssetList(title, filterFn)
  ↓
App.svelte renders AssetListModal
  ↓ (user clicks asset row)
assetModalStore.openAssetDetail(asset)
  ↓
App.svelte renders AssetDetailModal
  ↓ (user clicks "View Asset")
window.open(asset.assetLink)
```
