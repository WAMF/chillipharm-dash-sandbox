# Dashboard Refactor Plan: Site vs Library Data Organization

## Overview

Refactor the dashboard to support two distinct data organization modes:

1. **Sites Mode** - Hierarchical structure: Site → Subject → Study Event → Study Procedure → Assets
2. **Library Mode** - Flat structure: Library containers with assets (no site association)
3. **All Assets Mode** - Generic overview showing all assets regardless of organization

## Current State Analysis

### Database Structure
- `trial_containers` table has a `type` column ('Site' currently used)
- Assets link to `trial_containers` via `trial_container_id`
- Current queries filter `tc.type = 'Site'`, meaning Library assets return `site: null`
- Site assets have hierarchical study data (subject, event, procedure)

### Key Files to Modify
- `libs/types/src/` - Type definitions
- `libs/api-client/src/` - API client endpoints
- `apps/functions/src/routes/` - Backend API routes
- `apps/dashboard/contexts/` - State management
- `apps/dashboard/components/` - UI components
- `apps/dashboard/app/dashboard/` - Page routes

---

## Implementation Plan

### Phase 1: Type Definitions & Constants

#### 1.1 Add DataViewMode type
**File:** `libs/types/src/dataView.ts` (new)

```typescript
export type DataViewMode = 'sites' | 'library' | 'all';

export interface DataViewState {
    mode: DataViewMode;
}
```

#### 1.2 Update FilterState type
**File:** `libs/types/src/filter.ts`

Add `dataViewMode: DataViewMode` to FilterState interface and DEFAULT_FILTER_STATE.

#### 1.3 Update AssetRecord type
**File:** `libs/types/src/asset.ts`

Add optional `libraryId` and `libraryName` fields to support library organization:
```typescript
libraryId?: number;
libraryName?: string;
```

#### 1.4 Add Library type
**File:** `libs/types/src/library.ts` (new)

```typescript
export interface Library {
    id: number;
    name: string;
    trialId: number;
    trialName: string;
    assetCount: number;
    createdAt: string;
}
```

#### 1.5 Export new types
**File:** `libs/types/src/index.ts`

Add exports for new types.

---

### Phase 2: Backend API Updates

#### 2.1 Add Libraries Route
**File:** `apps/functions/src/routes/libraries.js` (new)

Create new route for library endpoints:
- `GET /api/libraries` - List all libraries (trial_containers where type != 'Site')
- `GET /api/libraries/:id` - Get single library
- `GET /api/libraries/:id/assets` - Get assets in a library

#### 2.2 Update Assets Route
**File:** `apps/functions/src/routes/assets.js`

Add `data_view` query parameter to filter by mode:
- `data_view=sites` - Only assets with site_id (trial_container.type = 'Site')
- `data_view=library` - Only assets without site association or in library containers
- `data_view=all` (default) - All assets

Modify the WHERE clause builder:
```javascript
if (req.query.data_view === 'sites') {
    filters.push("tc.type = 'Site' AND tc.id IS NOT NULL");
}
if (req.query.data_view === 'library') {
    filters.push("(tc.id IS NULL OR tc.type != 'Site')");
}
```

Update the query POST endpoint similarly.

#### 2.3 Update Sites Route
**File:** `apps/functions/src/routes/sites.js`

Add hierarchical navigation endpoints:
- `GET /api/sites/:id/subjects` - List subjects at a site
- `GET /api/sites/:id/subjects/:subjectId/events` - List events for a subject
- `GET /api/sites/:id/subjects/:subjectId/events/:eventId/procedures` - List procedures

#### 2.4 Register Libraries Route
**File:** `apps/functions/index.js`

Import and register the new libraries router.

---

### Phase 3: API Client Updates

#### 3.1 Add Libraries Endpoint
**File:** `libs/api-client/src/endpoints/libraries.ts` (new)

Create LibrariesApi class extending BaseApi with methods for library operations.

#### 3.2 Update Assets Endpoint
**File:** `libs/api-client/src/endpoints/assets.ts`

Add `data_view` to AssetFilters interface and include in API calls.

#### 3.3 Update Sites Endpoint
**File:** `libs/api-client/src/endpoints/sites.ts`

Add methods for hierarchical navigation:
- `getSubjects(siteId)`
- `getEvents(siteId, subjectId)`
- `getProcedures(siteId, subjectId, eventId)`

#### 3.4 Update Data Loader
**File:** `libs/api-client/src/data-loader.ts`

Add support for loading data by view mode.

#### 3.5 Update Client
**File:** `libs/api-client/src/client.ts`

Add `libraries` property to ApiClient.

#### 3.6 Update Index Exports
**File:** `libs/api-client/src/index.ts`

Export new libraries endpoint.

---

### Phase 4: Data Processing Updates

#### 4.1 Update Filtering
**File:** `libs/data-processing/src/filtering.ts`

Add `filterByDataViewMode` function:
```typescript
export function filterByDataViewMode(
    records: AssetRecord[],
    mode: DataViewMode
): AssetRecord[] {
    switch (mode) {
        case 'sites':
            return records.filter(r => r.siteId && r.siteName);
        case 'library':
            return records.filter(r => !r.siteId || r.libraryId);
        case 'all':
        default:
            return records;
    }
}
```

#### 4.2 Add Library Aggregation
**File:** `libs/data-processing/src/aggregation.ts`

Add functions for library-specific calculations:
- `calculateLibraryMetrics()`
- `getLibraryDistribution()`

---

### Phase 5: Context & State Management

#### 5.1 Create DataViewContext
**File:** `apps/dashboard/contexts/DataViewContext.tsx` (new)

Create new context for managing data view mode:
```typescript
interface DataViewContextValue {
    mode: DataViewMode;
    setMode: (mode: DataViewMode) => void;
}
```

Include localStorage persistence for user preference.

#### 5.2 Update FilterContext
**File:** `apps/dashboard/contexts/FilterContext.tsx`

Integrate dataViewMode into filter state and reducer actions.

#### 5.3 Update DashboardContext
**File:** `apps/dashboard/contexts/DashboardContext.tsx`

- Import DataViewContext
- Filter records based on current view mode
- Add library-specific metrics when in library mode
- Conditionally calculate metrics based on mode

---

### Phase 6: UI Components

#### 6.1 Create DataViewSwitcher Component
**File:** `apps/dashboard/components/DataViewSwitcher.tsx` (new)

Segmented control or tab-style switcher with three options:
- Sites (building icon)
- Library (folder/archive icon)
- All Assets (grid icon)

Design: Prominent placement in header or above filter panel.

#### 6.2 Update FilterPanel
**File:** `apps/dashboard/components/FilterPanel.tsx`

- Add DataViewSwitcher at top of panel
- Conditionally show/hide filters based on mode:
  - Sites mode: Show site, country, subject, event, procedure filters
  - Library mode: Show library filter (new), hide site-specific filters
  - All mode: Show all filters

#### 6.3 Create LibraryBrowser Component
**File:** `apps/dashboard/components/LibraryBrowser.tsx` (new)

Card-based or list view for browsing libraries when in library mode.

#### 6.4 Create SiteHierarchyBrowser Component
**File:** `apps/dashboard/components/SiteHierarchyBrowser.tsx` (new)

Tree-view or drill-down component for Site → Subject → Event → Procedure navigation.

#### 6.5 Update ExecutiveOverview
**File:** `apps/dashboard/components/ExecutiveOverview.tsx`

Adapt metrics and visualizations based on current view mode:
- Sites mode: Show site-centric metrics, geography map
- Library mode: Show library statistics, asset type distribution
- All mode: Show combined overview

#### 6.6 Update MetricCard (if needed)
**File:** `apps/dashboard/components/MetricCard.tsx`

Ensure it handles mode-specific metric labels gracefully.

---

### Phase 7: Page Updates

#### 7.1 Update Dashboard Layout
**File:** `apps/dashboard/app/dashboard/layout.tsx`

- Wrap with DataViewProvider
- Integrate DataViewSwitcher into header (between logo and nav)
- Update navigation items to be context-aware

#### 7.2 Update Sites Page
**File:** `apps/dashboard/app/dashboard/sites/page.tsx`

- Add site hierarchy navigation when in sites mode
- Show message/redirect when not in sites mode

#### 7.3 Create Libraries Page
**File:** `apps/dashboard/app/dashboard/libraries/page.tsx` (new)

New page for library browsing:
- Library list/grid
- Library detail drill-down
- Asset list within library

#### 7.4 Update Navigation
**File:** `apps/dashboard/app/dashboard/layout.tsx`

Add "Libraries" nav item:
```typescript
{ href: '/dashboard/libraries', label: 'Libraries', icon: 'folder' }
```

---

### Phase 8: Testing & Validation

#### 8.1 Type Checking
Run `npx tsc --noEmit` and `npm run lint` to verify type safety.

#### 8.2 API Testing
Test new endpoints return correct filtered data.

#### 8.3 UI Testing
Verify mode switching updates all components correctly.

---

## File Change Summary

### New Files
- `libs/types/src/dataView.ts`
- `libs/types/src/library.ts`
- `apps/functions/src/routes/libraries.js`
- `libs/api-client/src/endpoints/libraries.ts`
- `apps/dashboard/contexts/DataViewContext.tsx`
- `apps/dashboard/components/DataViewSwitcher.tsx`
- `apps/dashboard/components/LibraryBrowser.tsx`
- `apps/dashboard/components/SiteHierarchyBrowser.tsx`
- `apps/dashboard/app/dashboard/libraries/page.tsx`

### Modified Files
- `libs/types/src/filter.ts`
- `libs/types/src/asset.ts`
- `libs/types/src/index.ts`
- `apps/functions/src/routes/assets.js`
- `apps/functions/src/routes/sites.js`
- `apps/functions/index.js`
- `libs/api-client/src/endpoints/assets.ts`
- `libs/api-client/src/endpoints/sites.ts`
- `libs/api-client/src/data-loader.ts`
- `libs/api-client/src/client.ts`
- `libs/api-client/src/index.ts`
- `libs/data-processing/src/filtering.ts`
- `libs/data-processing/src/aggregation.ts`
- `apps/dashboard/contexts/FilterContext.tsx`
- `apps/dashboard/contexts/DashboardContext.tsx`
- `apps/dashboard/components/FilterPanel.tsx`
- `apps/dashboard/components/ExecutiveOverview.tsx`
- `apps/dashboard/app/dashboard/layout.tsx`
- `apps/dashboard/app/dashboard/sites/page.tsx`

---

## Implementation Order

1. **Types first** - Define all new types to ensure type safety throughout
2. **Backend API** - Add filtering capability and new endpoints
3. **API Client** - Update client to use new API features
4. **Data Processing** - Add filtering and aggregation logic
5. **Contexts** - Add state management for view mode
6. **UI Components** - Build mode switcher and mode-specific components
7. **Pages** - Update routing and page layouts
8. **Testing** - Validate complete flow

---

## Notes

- Library detection assumes `trial_containers.type != 'Site'` or `trial_container_id IS NULL`
- May need to verify actual Library type value in production database
- Consider adding database migration if Library type doesn't exist
- Preserve backward compatibility - default to 'all' mode
- LocalStorage persistence for user's preferred view mode
