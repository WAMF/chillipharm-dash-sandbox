# API Refactor Plan: Three Data Access Modes

## Database Structure Analysis

### Key Tables
- **trial_containers**: Contains both Sites (`type = 'Site'`) and Libraries (`type = 'Library'`)
  - Sites: 32 records with country_code, go_live_date, contact info
  - Libraries: 79 records (simpler structure, no location data)

- **assets**: Links to containers via `trial_container_id`
  - Site assets: 103 (have `study_procedure_id` linking to study hierarchy)
  - Library assets: 398 (no study procedure, flat structure)

### Data Relationships
```
Sites Mode (Hierarchical):
  trial_containers (type='Site')
    → study_subjects (site_id)
      → study_events (study_subject_id)
        → study_procedures (study_event_id)
          → assets (study_procedure_id)

Libraries Mode (Flat):
  trial_containers (type='Library')
    → assets (trial_container_id)

All Mode:
  All assets regardless of container type
```

---

## API Design: Three Access Modes

### Mode 1: Generic Asset Access (`/api/v1/assets`)
**Purpose**: Access all assets regardless of organization
**Current**: Already supports `dataViewMode` parameter
**Changes**: Minor refinements only

### Mode 2: Sites-Focused Access (`/api/v1/sites`)
**Purpose**: Hierarchical clinical trial data navigation
**Structure**: Site → Subjects → Events → Procedures → Assets

### Mode 3: Libraries-Focused Access (`/api/v1/libraries`)
**Purpose**: Flat library container access
**Structure**: Library → Assets

---

## Proposed API Endpoints

### 1. Generic Assets API (Existing - Enhance)

```
GET  /api/v1/assets                    # List all assets
GET  /api/v1/assets/:id                # Get single asset
POST /api/v1/assets/query              # Complex query with filters

Query params/body:
  - dataViewMode: 'all' | 'sites' | 'library'
  - trials[], sites[], libraries[], countries[]
  - dateRange, reviewStatus, processedStatus
```

### 2. Sites API (Hierarchical Navigation)

```
# Sites Level
GET  /api/v1/sites                     # List all sites (existing)
GET  /api/v1/sites/:id                 # Get site details (existing)

# Subjects Level (NEW)
GET  /api/v1/sites/:siteId/subjects    # List subjects at site

# Events Level (NEW)
GET  /api/v1/sites/:siteId/subjects/:subjectId/events  # List events for subject

# Procedures Level (NEW)
GET  /api/v1/sites/:siteId/subjects/:subjectId/events/:eventId/procedures  # List procedures

# Assets Level (NEW)
GET  /api/v1/sites/:siteId/assets      # All assets at site (flat)
GET  /api/v1/sites/:siteId/subjects/:subjectId/events/:eventId/procedures/:procedureId/assets  # Assets in procedure
```

### 3. Libraries API (Flat Navigation)

```
# Libraries Level
GET  /api/v1/libraries                 # List all libraries (existing)
GET  /api/v1/libraries/:id             # Get library details (existing)

# Assets Level (NEW)
GET  /api/v1/libraries/:libraryId/assets  # List assets in library
```

### 4. Stats/Aggregation API (NEW/Enhanced)

```
GET  /api/v1/stats                     # Overall stats
GET  /api/v1/stats/sites               # Site-specific aggregations
GET  /api/v1/stats/libraries           # Library-specific aggregations

Query params:
  - dataViewMode: 'all' | 'sites' | 'library'
  - trial_id, site_id, library_id
```

---

## Implementation Details

### Phase 1: Sites Hierarchical Endpoints

#### Validation Utility
```javascript
async function validateSiteHierarchy(siteId, subjectId = null, eventId = null, procedureId = null) {
    // Validate site exists and is of type 'Site'
    const site = await query(`
        SELECT id FROM trial_containers
        WHERE id = $1 AND type = 'Site' AND deleted_at IS NULL
    `, [siteId]);
    if (site.rows.length === 0) return { valid: false, error: 'Site not found' };

    if (!subjectId) return { valid: true };

    // Validate subject belongs to site
    const subject = await query(`
        SELECT id FROM study_subjects
        WHERE id = $1 AND site_id = $2
    `, [subjectId, siteId]);
    if (subject.rows.length === 0) return { valid: false, error: 'Subject not found at this site' };

    if (!eventId) return { valid: true };

    // Validate event belongs to subject
    const event = await query(`
        SELECT id FROM study_events
        WHERE id = $1 AND study_subject_id = $2 AND deleted_at IS NULL
    `, [eventId, subjectId]);
    if (event.rows.length === 0) return { valid: false, error: 'Event not found for this subject' };

    if (!procedureId) return { valid: true };

    // Validate procedure belongs to event
    const procedure = await query(`
        SELECT id FROM study_procedures
        WHERE id = $1 AND study_event_id = $2 AND deleted_at IS NULL
    `, [procedureId, eventId]);
    if (procedure.rows.length === 0) return { valid: false, error: 'Procedure not found for this event' };

    return { valid: true };
}
```

#### 1.1 GET /api/v1/sites/:siteId/subjects
```javascript
// Query subjects filtered by site
SELECT
    ss.id,
    ss.number,
    ss.active,
    ss.created_at,
    sa.id as arm_id,
    sa.display_name as arm_name,
    COUNT(DISTINCT se.id) as event_count,
    COUNT(DISTINCT sp.id) as procedure_count
FROM study_subjects ss
LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
LEFT JOIN study_events se ON se.study_subject_id = ss.id AND se.deleted_at IS NULL
LEFT JOIN study_procedures sp ON sp.study_event_id = se.id AND sp.deleted_at IS NULL
WHERE ss.site_id = :siteId
GROUP BY ss.id, sa.id, sa.display_name
ORDER BY ss.number
```

#### 1.2 GET /api/v1/sites/:siteId/subjects/:subjectId/events
```javascript
// First: validate subject belongs to site (strict validation)
// Then: query events
SELECT
    se.id,
    se.identifier,
    se.display_name as name,
    se.date,
    se.status,
    sed.display_name as definition_name,
    COUNT(DISTINCT sp.id) as procedure_count,
    COUNT(DISTINCT a.id) as asset_count
FROM study_events se
LEFT JOIN study_event_definitions sed ON se.study_event_definition_id = sed.id
LEFT JOIN study_procedures sp ON sp.study_event_id = se.id AND sp.deleted_at IS NULL
LEFT JOIN assets a ON a.study_procedure_id = sp.id AND a.soft_deleted_at IS NULL
WHERE se.study_subject_id = :subjectId
  AND se.deleted_at IS NULL
GROUP BY se.id, sed.display_name
ORDER BY se.date DESC
```

#### 1.3 GET /api/v1/sites/:siteId/subjects/:subjectId/events/:eventId/procedures
```javascript
// First: validate full hierarchy (site → subject → event)
// Then: query procedures
SELECT
    sp.id,
    sp.identifier,
    sp.display_name as name,
    sp.date,
    sp.status,
    sp.locked,
    spd.display_name as definition_name,
    u.first_name || ' ' || u.last_name as evaluator,
    COUNT(DISTINCT a.id) as asset_count
FROM study_procedures sp
LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
LEFT JOIN users u ON sp.evaluator_id = u.id
LEFT JOIN assets a ON a.study_procedure_id = sp.id AND a.soft_deleted_at IS NULL
WHERE sp.study_event_id = :eventId
  AND sp.deleted_at IS NULL
GROUP BY sp.id, spd.display_name, u.first_name, u.last_name
ORDER BY sp.date DESC
```

#### 1.4 GET /api/v1/sites/:siteId/subjects/:subjectId/events/:eventId/procedures/:procedureId/assets
```javascript
// First: validate full hierarchy
// Then: query assets
SELECT
    a.id,
    a.filename,
    a.filesize,
    a.processed,
    a.created_at,
    a.s3_url,
    a.media_info,
    ar.reviewed,
    ar.review_date
FROM assets a
LEFT JOIN asset_reviews ar ON ar.asset_id = a.id AND ar.deleted_at IS NULL
WHERE a.study_procedure_id = :procedureId
  AND a.soft_deleted_at IS NULL
ORDER BY a.created_at DESC
```

#### 1.5 GET /api/v1/sites/:siteId/assets (Flat view)
```javascript
// All assets at a site regardless of study hierarchy
SELECT a.*, tc.name as site_name
FROM assets a
JOIN trial_containers tc ON a.trial_container_id = tc.id
WHERE tc.id = :siteId
  AND tc.type = 'Site'
  AND a.soft_deleted_at IS NULL
ORDER BY a.created_at DESC
```

### Phase 2: Libraries Assets Endpoint

#### 2.1 GET /api/v1/libraries/:libraryId/assets
```javascript
SELECT a.*
FROM assets a
JOIN trial_containers tc ON a.trial_container_id = tc.id
WHERE tc.id = :libraryId
  AND tc.type != 'Site'
  AND a.soft_deleted_at IS NULL
```

### Phase 3: Enhanced Stats Endpoints

#### 3.1 GET /api/v1/stats/sites
```javascript
// Site-centric statistics
{
  totalSites: number,
  totalSubjects: number,
  totalAssets: number,
  assetsPerSite: { siteId, siteName, count }[],
  subjectsPerSite: { siteId, siteName, count }[],
  countriesDistribution: { country, siteCount, assetCount }[]
}
```

#### 3.2 GET /api/v1/stats/libraries
```javascript
// Library-centric statistics
{
  totalLibraries: number,
  totalAssets: number,
  assetsPerLibrary: { libraryId, libraryName, count }[],
  trialDistribution: { trialId, trialName, libraryCount, assetCount }[]
}
```

---

## File Changes Required

### New Files
```
apps/functions/src/routes/
  └── sites.js          # Extend with hierarchical endpoints
  └── libraries.js      # Extend with assets endpoint
  └── stats.js          # Extend with mode-specific stats
```

### Modified Files
```
apps/functions/src/routes/
  ├── sites.js          # Add subjects/events/procedures/assets sub-routes
  ├── libraries.js      # Add assets sub-route
  ├── stats.js          # Add sites/libraries breakdown endpoints
  └── assets.js         # Ensure dataViewMode works correctly

apps/functions/src/
  └── openapi.js        # Document new endpoints

libs/api-client/src/endpoints/
  ├── sites.ts          # Add hierarchical navigation methods
  ├── libraries.ts      # Add getAssets method
  └── stats.ts          # Add mode-specific stat methods

libs/types/src/
  ├── api.ts            # Add new response types
  └── index.ts          # Export new types
```

---

## API Response Structures

### Site Hierarchy Response
```typescript
interface SiteSubjectsResponse {
  success: boolean;
  data: {
    id: number;
    number: string;
    active: boolean;
    arm: { id: number; name: string } | null;
    stats: { eventCount: number; procedureCount: number };
  }[];
  meta: PaginationMeta;
}

interface SubjectEventsResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    date: string;
    status: number;
    stats: { procedureCount: number };
  }[];
}

interface EventProceduresResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    date: string;
    status: number;
    evaluator: { name: string } | null;
    stats: { assetCount: number };
  }[];
}
```

### Library Assets Response
```typescript
interface LibraryAssetsResponse {
  success: boolean;
  data: AssetSummary[];
  meta: PaginationMeta;
}
```

---

## Implementation Order

1. **Sites hierarchical endpoints** (highest value for clinical workflow)
   - Add `/sites/:id/subjects`
   - Add `/sites/:id/subjects/:subjectId/events`
   - Add `/sites/:id/subjects/:subjectId/events/:eventId/procedures`
   - Add `/sites/:id/assets`

2. **Libraries assets endpoint**
   - Add `/libraries/:id/assets`

3. **Stats mode-specific endpoints**
   - Add `/stats/sites`
   - Add `/stats/libraries`

4. **API Client updates**
   - Update sites.ts with hierarchical methods
   - Update libraries.ts with getAssets
   - Update stats.ts with mode methods

5. **OpenAPI documentation**
   - Document all new endpoints

---

## Design Decisions

1. **URL Structure**: Deep nesting for clear hierarchy
   - `/sites/:siteId/subjects/:subjectId/events/:eventId/procedures/:procedureId/assets`
   - Full context in URL, self-documenting API

2. **Validation**: Strict parent-child validation
   - Every request validates the full hierarchy chain
   - Returns 404 if subject doesn't belong to site, event to subject, etc.
   - Prevents data leakage across organizational boundaries

3. **Pagination**: Yes, with 50 per page default

4. **Filtering**: Minimal filters per sub-resource (date, status)
