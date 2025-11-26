# Dashboard Enhancement Plan: Filtering, Sorting, PDF & CSV Export

## Overview
Add interactive filtering and sorting capabilities to the dashboard, plus export functionality for PDF and CSV formats.

---

## Phase 1: Filter & Sort Infrastructure

### 1.1 Create Filter Store
**File:** `src/lib/stores/filterStore.ts`

Create a Svelte writable store to manage filter state:
- `selectedSites: string[]` - Multi-select site filter
- `selectedCountries: string[]` - Multi-select country filter
- `selectedStudyArms: string[]` - Multi-select study arm filter
- `dateRange: { start: Date | null; end: Date | null }` - Upload date range
- `reviewStatus: 'all' | 'reviewed' | 'pending'` - Review filter
- `searchTerm: string` - Global text search
- `sortBy: string` - Sort field
- `sortOrder: 'asc' | 'desc'` - Sort direction

### 1.2 Add Filter/Sort Functions
**File:** `src/lib/dataProcessor.ts`

Add new functions:
- `filterRecords(records, filters)` - Apply all active filters
- `sortRecords(records, sortBy, sortOrder)` - Sort by any field
- `getUniqueValues(records, field)` - Extract unique values for dropdowns

---

## Phase 2: Filter Panel Component

### 2.1 Create FilterPanel Component
**File:** `src/lib/components/FilterPanel.svelte`

UI Elements:
- Search input with icon
- Site multi-select dropdown
- Country multi-select dropdown
- Study Arm multi-select dropdown
- Date range picker (start/end)
- Review status toggle (All/Reviewed/Pending)
- Sort dropdown + order toggle
- Clear all filters button
- Active filter pills with individual clear

### 2.2 Styling
- Collapsible panel design (expanded by default)
- Responsive grid layout
- Badge showing count of active filters
- Consistent with existing design system

---

## Phase 3: Integrate Filters into App

### 3.1 Update App.svelte
- Import filterStore
- Create reactive `filteredRecords` derived from filters
- Recalculate all metrics when filters change
- Pass filtered data to all child components

### 3.2 Update Dashboard Components
Components that need filtered data:
- ExecutiveOverview - metrics recalculated from filtered records
- SitePerformance - filtered site data
- StudyAnalytics - filtered study data
- VideoMetrics - filtered video stats
- ReviewPerformance - filtered review data
- ComplianceMonitoring - filtered compliance metrics
- IntegrationHealth - filtered records for activity feed

---

## Phase 4: Export Functionality

### 4.1 CSV Export
**File:** `src/lib/exportUtils.ts`

Functions:
- `exportToCSV(records, filename)` - Export filtered records to CSV
- `exportMetricsToCSV(metrics, filename)` - Export summary metrics

Features:
- Export currently filtered data (not all data)
- Proper CSV escaping for special characters
- Configurable columns
- Auto-download trigger

### 4.2 PDF Export
**File:** `src/lib/exportUtils.ts`

Approach: Use browser print functionality with print-specific CSS

Functions:
- `exportToPDF()` - Trigger print dialog with PDF-optimized view

Features:
- Print-specific stylesheet hides filters, navigation
- Landscape orientation for charts
- Page breaks between sections
- Header with export date and filter summary
- Charts rendered as static images

### 4.3 Export Button Component
**File:** `src/lib/components/ExportButtons.svelte`

UI:
- Dropdown menu with export options
- CSV (Current View)
- CSV (All Data)
- PDF (Print View)
- Loading state during export

---

## Phase 5: UI Integration

### 5.1 Header Enhancement
Add export buttons to header area alongside logout

### 5.2 Filter Summary
Show active filter count in header
Quick filter reset option

### 5.3 Empty State
Handle case when filters return no results
Show helpful message with clear filters option

---

## Technical Decisions

### State Management
- Use Svelte stores for filter state (reactive across components)
- Derived store for filtered records
- Memoize expensive calculations

### CSV Library
- Native implementation (no external library needed)
- Use Blob API for file download

### PDF Approach
- Browser print-to-PDF (no server/library needed)
- `@media print` CSS for layout optimization
- Alternative: html2canvas + jsPDF if charts don't print well

### Performance Considerations
- Debounce search input (300ms)
- Lazy recalculate metrics only when filters change
- Consider Web Workers for large datasets

---

## File Structure After Implementation

```
src/lib/
├── stores/
│   ├── authStore.ts (existing)
│   └── filterStore.ts (new)
├── components/
│   ├── FilterPanel.svelte (new)
│   ├── ExportButtons.svelte (new)
│   └── ... (existing components)
├── utils/
│   └── exportUtils.ts (new)
├── dataProcessor.ts (modified - add filter/sort functions)
└── types/index.ts (modified - add FilterState interface)
```

---

## Implementation Order

1. **filterStore.ts** - Create filter state management
2. **types/index.ts** - Add FilterState interface
3. **dataProcessor.ts** - Add filter/sort/unique value functions
4. **FilterPanel.svelte** - Build filter UI component
5. **App.svelte** - Integrate filters, create filtered data flow
6. **exportUtils.ts** - CSV and PDF export functions
7. **ExportButtons.svelte** - Export UI component
8. **Header.svelte** - Add export buttons
9. **app.css** - Print styles for PDF export
10. **Testing** - Verify all filters, exports work correctly

---

## Estimated Effort

| Phase | Components | Complexity |
|-------|------------|------------|
| Phase 1 | Store + Functions | Low |
| Phase 2 | FilterPanel | Medium |
| Phase 3 | App Integration | Medium |
| Phase 4 | Export Utils | Medium |
| Phase 5 | UI Polish | Low |

---

## Questions to Clarify

1. Should filters persist across sessions (localStorage)?
2. Should there be saved filter presets?
3. For CSV export, which columns should be included?
4. Should PDF export include all tabs or just current view?
5. Any specific date format preferences for exports?
