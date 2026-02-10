# Video Services Workflow Tool - Technical Specification

## 1. Overview

### 1.1 Purpose

The Video Services Workflow Tool automates manual video processing operations for the Video Services team, providing configurable workflows and persistent tasks with full traceability.

### 1.2 Modes

| Mode | Users | Purpose |
|------|-------|---------|
| **Admin Mode** | Administrators | Define and manage workflow configurations |
| **Normal Mode** | Operators | Create, manage, and execute tasks using configured workflows |

### 1.3 Workflow Types

| Type | Description | Input | Output |
|------|-------------|-------|--------|
| **Transform** | One-to-one processing | Single video | Single video to one destination |
| **Combine** | Many-to-one processing | Multiple videos | Single video to one destination |
| **Distribute** | One-to-many distribution | Single video | Single video to multiple destinations |

---

## 2. Admin Mode

### 2.1 Workflow Configuration

Administrators create workflows that serve as reusable templates for operators.

#### Workflow Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | Yes | Human-readable identifier |
| `trial_id` | UUID | Yes | Associated trial |
| `workflow_type` | Enum | Yes | transform, combine, or distribute |
| `source_site_id` | UUID | Yes | Site where operators browse for input assets |
| `status` | Enum | No | active (default) or inactive |

#### Destination Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `site_id` | UUID | Yes | Target site for upload |
| `is_primary` | Boolean | No | Marks the main destination (default: false) |
| `field_mapping` | JSON | Yes | Field copying rules |
| `display_order` | Integer | No | Order in UI (default: 0) |

#### Field Mapping Modes

| Mode | Behaviour | Fields Property |
|------|-----------|-----------------|
| `all` | Copy all fields from source | Not used |
| `none` | Copy no fields | Not used |
| `include` | Copy only specified fields | Required - list of field names |
| `exclude` | Copy all except specified fields | Required - list of field names |

**Examples:**

```json
{ "mode": "all" }
```

```json
{ "mode": "none" }
```

```json
{ "mode": "include", "fields": ["subject_id", "assessment_type"] }
```

```json
{ "mode": "exclude", "fields": ["internal_notes", "draft_flag"] }
```

### 2.2 Workflow Validation Rules

- Name is required and must be unique within a trial
- At least one destination is required
- Duplicate destination sites are not allowed
- Source site cannot be the same as any destination site (optional rule - TBD)
- Workflows with existing tasks cannot be deleted, only deactivated

---

## 3. Normal Mode

### 3.1 Task Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | Yes | User-provided task name |
| `workflow_id` | UUID | Yes | The workflow this task uses |
| `description` | Text | No | Freeform notes or context |
| `reference_url` | String | No | URL to related ticket/email/request |
| `status` | Enum | Auto | Current task state |
| `created_by` | UUID | Auto | User who created the task |

### 3.2 Task Lifecycle

```
┌──────────┐    ┌─────────────────┐    ┌──────────┐
│  Created │ →  │ Assets Selected │ →  │ Complete │
└──────────┘    └─────────────────┘    └──────────┘
      │                 │                    
      ↓                 ↓                    
┌──────────┐    ┌─────────────────┐    ┌──────────┐
│ Deleted  │    │     Deleted     │    │  Failed  │
└──────────┘    └─────────────────┘    └──────────┘
```

| Status | Description |
|--------|-------------|
| `created` | Task created, no assets selected |
| `assets_selected` | Input asset(s) chosen, ready for processing |
| `complete` | Files uploaded, correlations recorded |
| `failed` | Upload/distribution failed |
| `deleted` | Task soft-deleted |

### 3.3 Task Membership

- The user who creates a task is automatically added as a member and marked as creator
- Members can add or remove other members (except the creator)
- Only members can view and work on a task
- Any member can complete or delete the task

### 3.4 Completion Flow

The completion process is explicit and atomic:

1. User selects input assets → persisted to database
2. User downloads source files and processes externally
3. User drags processed file into drop zone → **staged in browser memory only**
4. User reviews staged files and destination summary
5. User clicks **Complete** → triggers:
   - Upload to all destinations
   - Field copying per destination rules
   - Correlation record creation
6. Success → task status becomes `complete`
7. Failure → task status becomes `failed` with error details

**Important:** Staged files are held in browser memory. If the user navigates away or closes the browser before clicking Complete, the staged files are lost but the task persists.

---

## 4. Data Model

### 4.1 Workflows Table

```sql
CREATE TABLE vs_workflows (
    workflow_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    trial_id            UUID NOT NULL REFERENCES trials(trial_id),
    workflow_type       VARCHAR(20) NOT NULL CHECK (workflow_type IN ('transform', 'combine', 'distribute')),
    source_site_id      UUID NOT NULL REFERENCES sites(site_id),
    status              VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by          UUID NOT NULL REFERENCES users(user_id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vs_workflows_trial ON vs_workflows(trial_id);
CREATE INDEX idx_vs_workflows_status ON vs_workflows(status);
```

### 4.2 Workflow Destinations Table

```sql
CREATE TABLE vs_workflow_destinations (
    destination_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id         UUID NOT NULL REFERENCES vs_workflows(workflow_id) ON DELETE CASCADE,
    site_id             UUID NOT NULL REFERENCES sites(site_id),
    is_primary          BOOLEAN NOT NULL DEFAULT FALSE,
    field_mapping       JSONB NOT NULL,
    display_order       INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(workflow_id, site_id)
);

CREATE INDEX idx_vs_workflow_destinations_workflow ON vs_workflow_destinations(workflow_id);
```

### 4.3 Tasks Table

```sql
CREATE TABLE vs_tasks (
    task_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id         UUID NOT NULL REFERENCES vs_workflows(workflow_id),
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    reference_url       VARCHAR(500),
    status              VARCHAR(20) NOT NULL DEFAULT 'created' 
                        CHECK (status IN ('created', 'assets_selected', 'complete', 'failed', 'deleted')),
    error_message       TEXT,
    created_by          UUID NOT NULL REFERENCES users(user_id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMP,
    completed_by        UUID REFERENCES users(user_id),
    deleted_at          TIMESTAMP,
    deleted_by          UUID REFERENCES users(user_id)
);

CREATE INDEX idx_vs_tasks_workflow ON vs_tasks(workflow_id);
CREATE INDEX idx_vs_tasks_status ON vs_tasks(status);
CREATE INDEX idx_vs_tasks_created_by ON vs_tasks(created_by);
```

### 4.4 Task Members Table

```sql
CREATE TABLE vs_task_members (
    task_member_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID NOT NULL REFERENCES vs_tasks(task_id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(user_id),
    is_creator          BOOLEAN NOT NULL DEFAULT FALSE,
    added_by            UUID NOT NULL REFERENCES users(user_id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(task_id, user_id)
);

CREATE INDEX idx_vs_task_members_task ON vs_task_members(task_id);
CREATE INDEX idx_vs_task_members_user ON vs_task_members(user_id);
```

### 4.5 Task Inputs Table

```sql
CREATE TABLE vs_task_inputs (
    task_input_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID NOT NULL REFERENCES vs_tasks(task_id) ON DELETE CASCADE,
    asset_id            UUID NOT NULL REFERENCES assets(asset_id),
    site_id             UUID NOT NULL REFERENCES sites(site_id),
    sequence_order      INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vs_task_inputs_task ON vs_task_inputs(task_id);
```

### 4.6 Asset Correlations Table

```sql
CREATE TABLE vs_asset_correlations (
    correlation_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID NOT NULL REFERENCES vs_tasks(task_id),
    job_id              UUID NOT NULL,
    source_asset_id     UUID NOT NULL REFERENCES assets(asset_id),
    source_site_id      UUID NOT NULL REFERENCES sites(site_id),
    output_asset_id     UUID NOT NULL REFERENCES assets(asset_id),
    output_site_id      UUID NOT NULL REFERENCES sites(site_id),
    fields_copied       JSONB,
    processed_by        UUID NOT NULL REFERENCES users(user_id),
    processed_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vs_correlations_task ON vs_asset_correlations(task_id);
CREATE INDEX idx_vs_correlations_job ON vs_asset_correlations(job_id);
CREATE INDEX idx_vs_correlations_source ON vs_asset_correlations(source_asset_id);
CREATE INDEX idx_vs_correlations_output ON vs_asset_correlations(output_asset_id);
CREATE INDEX idx_vs_correlations_processed_at ON vs_asset_correlations(processed_at);
```

---

## 5. API Specification

### 5.1 Admin Mode - Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflows` | List all workflows |
| POST | `/api/v1/workflows` | Create workflow |
| GET | `/api/v1/workflows/{id}` | Get workflow details |
| PUT | `/api/v1/workflows/{id}` | Update workflow |
| DELETE | `/api/v1/workflows/{id}` | Deactivate workflow |
| POST | `/api/v1/workflows/{id}/destinations` | Add destination |
| PUT | `/api/v1/workflows/{id}/destinations/{destId}` | Update destination |
| DELETE | `/api/v1/workflows/{id}/destinations/{destId}` | Remove destination |

### 5.2 Normal Mode - Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | List tasks where user is member |
| POST | `/api/v1/tasks` | Create task |
| GET | `/api/v1/tasks/{id}` | Get task details |
| PUT | `/api/v1/tasks/{id}` | Update task |
| DELETE | `/api/v1/tasks/{id}` | Soft delete task |
| POST | `/api/v1/tasks/{id}/inputs` | Add input asset(s) |
| DELETE | `/api/v1/tasks/{id}/inputs/{inputId}` | Remove input asset |
| POST | `/api/v1/tasks/{id}/complete` | Upload output and complete |

### 5.3 Task Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks/{id}/members` | List task members |
| POST | `/api/v1/tasks/{id}/members` | Add member |
| DELETE | `/api/v1/tasks/{id}/members/{userId}` | Remove member |

### 5.4 Asset Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sites/{siteId}/assets` | Browse assets |
| GET | `/api/v1/assets/{id}/download-url` | Get secure download URL |

### 5.5 Correlations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/correlations` | Query correlations |
| GET | `/api/v1/correlations/job/{jobId}` | Get correlations for job |

---

## 6. API Request/Response Examples

### 6.1 Create Workflow

**Request:**

```http
POST /api/v1/workflows
Content-Type: application/json

{
  "name": "Scholar Rock VHOT Redaction",
  "trial_id": "550e8400-e29b-41d4-a716-446655440000",
  "workflow_type": "distribute",
  "source_site_id": "660e8400-e29b-41d4-a716-446655440001",
  "destinations": [
    {
      "site_id": "770e8400-e29b-41d4-a716-446655440002",
      "is_primary": true,
      "field_mapping": {
        "mode": "include",
        "fields": ["subject_id", "assessment_type"]
      }
    },
    {
      "site_id": "880e8400-e29b-41d4-a716-446655440003",
      "is_primary": false,
      "field_mapping": {
        "mode": "none"
      }
    }
  ]
}
```

**Response:**

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "workflow_id": "990e8400-e29b-41d4-a716-446655440004",
  "name": "Scholar Rock VHOT Redaction",
  "trial_id": "550e8400-e29b-41d4-a716-446655440000",
  "workflow_type": "distribute",
  "source_site_id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "active",
  "destinations": [
    {
      "destination_id": "aa0e8400-e29b-41d4-a716-446655440005",
      "site_id": "770e8400-e29b-41d4-a716-446655440002",
      "site_name": "Reviewer Site Alpha",
      "is_primary": true,
      "field_mapping": {
        "mode": "include",
        "fields": ["subject_id", "assessment_type"]
      },
      "display_order": 0
    },
    {
      "destination_id": "bb0e8400-e29b-41d4-a716-446655440006",
      "site_id": "880e8400-e29b-41d4-a716-446655440003",
      "site_name": "Reviewer Site Beta",
      "is_primary": false,
      "field_mapping": {
        "mode": "none"
      },
      "display_order": 1
    }
  ],
  "created_by": "cc0e8400-e29b-41d4-a716-446655440007",
  "created_at": "2025-05-27T10:30:00Z"
}
```

### 6.2 Create Task

**Request:**

```http
POST /api/v1/tasks
Content-Type: application/json

{
  "workflow_id": "990e8400-e29b-41d4-a716-446655440004",
  "name": "SUB001 Visit 3 Redaction",
  "reference_url": "https://jira.chillipharm.com/browse/VS-1234",
  "description": "Redaction requested by Dr Smith. Patient face visible at 2:30-3:15."
}
```

**Response:**

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "task_id": "dd0e8400-e29b-41d4-a716-446655440008",
  "workflow_id": "990e8400-e29b-41d4-a716-446655440004",
  "workflow_name": "Scholar Rock VHOT Redaction",
  "name": "SUB001 Visit 3 Redaction",
  "reference_url": "https://jira.chillipharm.com/browse/VS-1234",
  "description": "Redaction requested by Dr Smith. Patient face visible at 2:30-3:15.",
  "status": "created",
  "members": [
    {
      "user_id": "cc0e8400-e29b-41d4-a716-446655440007",
      "name": "Stevie Jones",
      "is_creator": true
    }
  ],
  "inputs": [],
  "created_by": "cc0e8400-e29b-41d4-a716-446655440007",
  "created_at": "2025-05-27T11:00:00Z"
}
```

### 6.3 Complete Task

**Request:**

```http
POST /api/v1/tasks/dd0e8400-e29b-41d4-a716-446655440008/complete
Content-Type: multipart/form-data

file: <binary file data>
```

**Response (Success):**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "complete",
  "job_id": "ee0e8400-e29b-41d4-a716-446655440009",
  "completed_at": "2025-05-27T14:32:00Z",
  "completed_by": {
    "user_id": "cc0e8400-e29b-41d4-a716-446655440007",
    "name": "Stevie Jones"
  },
  "outputs": [
    {
      "site_id": "770e8400-e29b-41d4-a716-446655440002",
      "site_name": "Reviewer Site Alpha",
      "asset_id": "ff0e8400-e29b-41d4-a716-446655440010",
      "fields_copied": ["subject_id", "assessment_type"],
      "status": "success"
    },
    {
      "site_id": "880e8400-e29b-41d4-a716-446655440003",
      "site_name": "Reviewer Site Beta",
      "asset_id": "000e8400-e29b-41d4-a716-446655440011",
      "fields_copied": [],
      "status": "success"
    }
  ]
}
```

**Response (Partial Failure):**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "failed",
  "job_id": "ee0e8400-e29b-41d4-a716-446655440009",
  "error": "Upload to Reviewer Site Beta failed: Connection timeout",
  "outputs": [
    {
      "site_id": "770e8400-e29b-41d4-a716-446655440002",
      "site_name": "Reviewer Site Alpha",
      "asset_id": "ff0e8400-e29b-41d4-a716-446655440010",
      "fields_copied": ["subject_id", "assessment_type"],
      "status": "success"
    },
    {
      "site_id": "880e8400-e29b-41d4-a716-446655440003",
      "site_name": "Reviewer Site Beta",
      "status": "failed",
      "error": "Connection timeout"
    }
  ]
}
```

---

## 7. User Interface Specifications

### 7.1 Admin Mode - Workflow List

```
┌─────────────────────────────────────────────────────────────┐
│  Workflow Administration                         [User ▾]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Workflows                              [+ Create Workflow] │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Scholar Rock VHOT Redaction              [Transform]  │ │
│  │ Trial: SR-2025-001                                    │ │
│  │ Source: Main Collection → 3 destinations              │ │
│  │ Status: Active                                        │ │
│  │                                    [Edit] [Deactivate]│ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Normal Mode - Task Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Video Services                                  [User ▾]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Search tasks...                            [Search] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Filter: [All Statuses ▾]  [All Workflows ▾]  [+ New Task] │
│                                                             │
│  My Tasks                                                   │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SUB001 Visit 3 Redaction                            │   │
│  │ Workflow: Scholar Rock VHOT Redaction               │   │
│  │ Status: Assets Selected                 ● Ready     │   │
│  │ Members: You, Sarah M.                              │   │
│  │ Created: 2 hours ago                                │   │
│  │                                         [Open →]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Normal Mode - Task Detail (File Staged)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Tasks    SUB001 Visit 3 Redaction              [Delete]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Workflow: Scholar Rock VHOT Redaction                      │
│  Reference: https://jira.chillipharm.com/VS-1234   [Open]   │
│  Description: Redaction requested by Dr Smith.              │
│                                                             │
│  Members: You, Sarah M.                    [Manage Members] │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Input Assets                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ SUB001_VHOT_V3_20250527.mp4                       │   │
│  │   Duration: 4:32 | Size: 1.2GB                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Output File                                     [Clear]    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ SUB001_VHOT_V3_REDACTED.mp4                       │   │
│  │   Size: 1.1GB | Staged in browser                   │   │
│  │                                                     │   │
│  │   ⚠ File is in memory. Do not close browser        │   │
│  │     before clicking Complete.                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  On Complete, this file will be uploaded to:                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Reviewer Site Alpha                               │   │
│  │   Copy fields: subject_id, assessment_type          │   │
│  │                                                     │   │
│  │ • Reviewer Site Beta                                │   │
│  │   Copy fields: none                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                                [Complete]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Authentication and Authorization

### 8.1 Auth0 Integration

The application uses Auth0 for authentication. Users must authenticate before accessing any functionality.

### 8.2 Permissions

| Permission | Description | Admin | Operator |
|------------|-------------|:-----:|:--------:|
| `vs:admin` | Access Admin Mode | ✓ | |
| `vs:workflows:read` | View workflows | ✓ | ✓ |
| `vs:workflows:write` | Create/edit workflows | ✓ | |
| `vs:tasks:read` | View tasks (filtered by membership) | ✓ | ✓ |
| `vs:tasks:write` | Create/manage tasks | ✓ | ✓ |
| `vs:assets:browse` | Browse source assets | ✓ | ✓ |
| `vs:assets:download` | Download source assets | ✓ | ✓ |
| `vs:assets:upload` | Upload processed files | ✓ | ✓ |
| `vs:correlations:read` | View correlation records | ✓ | ✓ |

### 8.3 Access Rules

- Operators can use any active workflow
- Operators can only see tasks where they are members
- Any task member can add/remove other members (except the creator)
- Any task member can complete or delete the task

---

## 9. Error Handling

### 9.1 Validation Errors

```json
{
  "error": "validation_error",
  "message": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "workflow_id",
      "message": "Workflow must be selected"
    }
  ]
}
```

### 9.2 Authorization Errors

```json
{
  "error": "forbidden",
  "message": "You do not have permission to perform this action"
}
```

### 9.3 Not Found Errors

```json
{
  "error": "not_found",
  "message": "Task not found"
}
```

### 9.4 Completion Errors

```json
{
  "error": "completion_failed",
  "message": "Failed to complete task",
  "details": {
    "failed_destinations": [
      {
        "site_id": "880e8400-e29b-41d4-a716-446655440003",
        "site_name": "Reviewer Site Beta",
        "error": "Connection timeout"
      }
    ],
    "successful_destinations": [
      {
        "site_id": "770e8400-e29b-41d4-a716-446655440002",
        "site_name": "Reviewer Site Alpha",
        "asset_id": "ff0e8400-e29b-41d4-a716-446655440010"
      }
    ]
  }
}
```

---

## 10. Future Considerations

### 10.1 Potential Enhancements

- Task assignment (assign to specific team member)
- Priority/due date tracking
- Task templates (pre-fill common configurations)
- Bulk task creation
- Notification system
- Automated retry for failed uploads
- Rollback capability for completed tasks

### 10.2 Integration Points

- Existing ChilliPharm asset management system
- Audit logging infrastructure
- Reporting and analytics systems
