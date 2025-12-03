# ChilliPharm Database Schema

## Overview

The ChilliPharm platform manages clinical trial video assets through two distinct container types with different hierarchical structures.

## Data Distribution

| Entity | Type | Count |
|--------|------|-------|
| trial_containers | Site | 32 |
| trial_containers | Library | 79 |
| assets | Site | 103 |
| assets | Library | 398 |
| forms | Asset | 114 |
| forms | Study::Procedure | 42 |

---

## Container Types

### 1. Libraries (Flat Structure)

```
Library (trial_container where type='Library')
  └── Assets (direct children)
        └── Asset Info Fields
        └── Forms (optional, attached to Asset)
        └── Asset Review
```

### 2. Sites (Hierarchical Structure)

```
Site (trial_container where type='Site')
  └── Study Subjects
        └── Study Events
              └── Study Procedures
                    ├── Assets
                    ├── Forms (attached to Study::Procedure)
                    ├── Tasks (in study_procedure_tasks_json)
                    └── Updates (in updates_json)
```

---

## Core Tables

### trial_containers

The polymorphic container for both Sites and Libraries.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar | Container name |
| type | varchar | 'Site' or 'Library' |
| account_id | bigint | Parent account |
| identifier | varchar | External identifier |
| country_code | varchar | Country (Sites only) |
| number | varchar | Site number |
| study_protocol_id | integer | Associated protocol (Sites) |
| assets_count | integer | Cached asset count |
| go_live_date | date | When container went live |
| access_status | boolean | Is accessible |
| anonymised_assets | boolean | Whether assets are anonymised |
| uuid | varchar | Unique identifier |
| created_at | timestamp | Creation date |
| deleted_at | time | Soft delete timestamp |

### assets

Video and file assets belonging to containers.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| filename | varchar | Original filename |
| filesize | bigint | File size in bytes |
| file_id | varchar | Storage file identifier |
| file_type | integer | Type of file |
| mime_type | varchar | MIME type |
| trial_container_id | integer | Parent container ID |
| trial_container_type | varchar | 'Site' or 'Library' |
| study_procedure_id | integer | Associated procedure (Sites only) |
| library_id | bigint | Legacy library reference |
| uploader_id | integer | User who uploaded |
| processed | boolean | Processing complete |
| media_info | json | Video metadata |
| exif_data | json | EXIF metadata |
| chapters_json | jsonb | Video chapters |
| s3_url | varchar | S3 storage URL |
| s3_name | varchar | S3 object name |
| checksum | varchar | File checksum |
| created_at | timestamp | Upload date |
| soft_deleted_at | timestamp | Soft delete timestamp |

### asset_infos

Custom field values attached to assets.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| asset_id | integer | Parent asset |
| info_field_id | integer | Field definition |
| value | text | Field value |
| created_at | timestamp | Creation date |
| deleted_at | timestamp | Soft delete |

### asset_reviews

Review status for assets.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| asset_id | integer | Reviewed asset |
| user_id | integer | Reviewer |
| reviewed | boolean | Review complete |
| review_date | timestamp | When reviewed |
| created_at | timestamp | Record creation |

---

## Study Hierarchy (Sites Only)

### study_subjects

Patients/participants enrolled at a site.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| site_id | integer | Parent site (trial_container) |
| number | varchar | Subject identifier |
| study_arm_id | integer | Treatment arm |
| study_cohort_id | integer | Study cohort |
| active | boolean | Is active |
| created_at | timestamp | Enrollment date |

### study_events

Scheduled visits or events for a subject.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| study_subject_id | integer | Parent subject |
| study_event_definition_id | integer | Event template |
| site_id | integer | Site reference |
| study_protocol_id | integer | Protocol reference |
| identifier | varchar | Event identifier |
| display_name | varchar | Display name |
| date | date | Event date |
| status | integer | Event status |
| position | integer | Sort order |
| deleted_at | timestamp | Soft delete |

### study_procedures

Procedures performed within an event.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| study_event_id | integer | Parent event |
| study_subject_id | integer | Subject reference |
| study_procedure_definition_id | integer | Procedure template |
| study_protocol_id | integer | Protocol reference |
| identifier | varchar | Procedure identifier |
| display_name | varchar | Display name |
| date | date | Procedure date |
| status | integer | Procedure status |
| locked | boolean | Is locked |
| evaluator_id | integer | Assigned evaluator |
| assets_count | integer | Number of assets |
| updates_json | jsonb | Procedure updates |
| study_procedure_tasks_json | jsonb | Task list |
| study_procedure_flagged_tasks_json | jsonb | Flagged tasks |
| status_change_date | timestamp | Last status change |
| deleted_at | timestamp | Soft delete |

---

## Definition Tables

### study_protocols

Protocol definitions for studies.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| account_id | integer | Parent account |
| name | varchar | Protocol name |
| version_number | integer | Version |
| issue_date | date | Issue date |
| locked | boolean | Is locked |
| study_event_display_name_json | jsonb | Event naming config |
| study_procedure_display_name_json | jsonb | Procedure naming config |

### study_event_definitions

Templates for study events.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| study_protocol_id | integer | Parent protocol |
| account_id | integer | Account |
| identifier | varchar | Event type identifier |
| display_name | varchar | Display name |
| position | integer | Sort order |
| study_arm_id | integer | Arm-specific event |

### study_procedure_definitions

Templates for study procedures.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| study_protocol_id | integer | Parent protocol |
| account_id | integer | Account |
| identifier | varchar | Procedure type identifier |
| display_name | varchar | Display name |
| position | integer | Sort order |
| required_form_templates | jsonb | Required forms |

### study_arms

Treatment arms within a protocol.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| study_protocol_id | integer | Parent protocol |
| account_id | integer | Account |
| display_name | varchar | Arm name |

---

## Forms System

### form_templates

Form definitions with field configurations.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| account_id | integer | Parent account |
| title | varchar | Form title |
| description | varchar | Form description |
| version_number | integer | Template version |
| active | boolean | Is active |
| fields_json | jsonb | Field definitions |
| workflow_definition_id | integer | Associated workflow |
| user_id | integer | Creator |

### forms

Completed form instances.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| form_template_id | integer | Template used |
| form_template_version | integer | Template version |
| asset_id | integer | Attached asset (Library forms) |
| form_container_id | integer | Container ID |
| form_container_type | varchar | 'Asset' or 'Study::Procedure' |
| account_id | integer | Account |
| user_id | integer | Submitter |
| values_json | jsonb | Form values |
| version_number | integer | Form version |
| uuid | varchar | Unique identifier |

### form_template_trial_containers

Links form templates to containers.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| form_template_id | integer | Form template |
| trial_container_id | integer | Container |

### info_fields

Custom field definitions for asset info.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| account_id | integer | Parent account |
| name | varchar | Field name |
| key | varchar | Field key |
| field_type | integer | Field type (text, dropdown, etc.) |
| required | boolean | Is required |
| system | boolean | System field |
| dropdown_options | array | Options for dropdowns |
| placeholder | varchar | Placeholder text |
| instructions | varchar | Help text |
| position | integer | Sort order |

---

## Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          LIBRARY PATH                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  trial_containers ──────────────> assets ──────────> asset_infos    │
│  (type='Library')                    │                               │
│                                      ├──────────> asset_reviews      │
│                                      │                               │
│                                      └──────────> forms              │
│                                          (form_container_type='Asset')│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           SITE PATH                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  trial_containers ──> study_subjects ──> study_events               │
│  (type='Site')              │                  │                     │
│        │                    │                  v                     │
│        │                    │           study_procedures             │
│        │                    │                  │                     │
│        │                    │    ┌─────────────┼─────────────┐       │
│        │                    │    │             │             │       │
│        │                    │    v             v             v       │
│        │                    │  assets       forms         tasks      │
│        │                    │    │      (Study::Procedure) (JSON)    │
│        v                    │    v                                   │
│  study_protocol ────────────┘  asset_reviews                        │
│        │                                                             │
│        ├──> study_event_definitions                                  │
│        ├──> study_procedure_definitions                              │
│        └──> study_arms                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Report Structures

### Library Report
Each row represents an **Asset** with:
- Asset metadata (filename, size, duration, upload date)
- Asset info field values
- Selected form template fields

### Site Report
Each row represents a **Study Procedure** with:
- Procedure metadata (date, status, evaluator)
- Subject and event context
- Selected form template fields
- Asset counts

---

## Key Joins

### Library Assets with Info
```sql
SELECT a.*, ai.value, if.name as field_name
FROM assets a
JOIN trial_containers tc ON a.trial_container_id = tc.id
LEFT JOIN asset_infos ai ON ai.asset_id = a.id
LEFT JOIN info_fields if ON if.id = ai.info_field_id
WHERE tc.type = 'Library'
```

### Site Procedure Hierarchy
```sql
SELECT
    tc.name as site_name,
    ss.number as subject_number,
    se.display_name as event_name,
    sp.display_name as procedure_name,
    sp.date as procedure_date,
    u.first_name || ' ' || u.last_name as evaluator
FROM study_procedures sp
JOIN study_events se ON sp.study_event_id = se.id
JOIN study_subjects ss ON sp.study_subject_id = ss.id
JOIN trial_containers tc ON ss.site_id = tc.id
LEFT JOIN users u ON sp.evaluator_id = u.id
WHERE tc.type = 'Site'
```

### Forms by Container Type
```sql
-- Library forms (attached to assets)
SELECT f.*, ft.title as template_name, a.filename
FROM forms f
JOIN form_templates ft ON f.form_template_id = ft.id
JOIN assets a ON f.asset_id = a.id
WHERE f.form_container_type = 'Asset'

-- Site forms (attached to procedures)
SELECT f.*, ft.title as template_name, sp.display_name as procedure_name
FROM forms f
JOIN form_templates ft ON f.form_template_id = ft.id
JOIN study_procedures sp ON f.form_container_id = sp.id
WHERE f.form_container_type = 'Study::Procedure'
```
