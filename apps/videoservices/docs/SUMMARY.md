# Video Services Workflow Tool - Summary

## Overview

The Video Services Workflow Tool automates manual video processing operations currently performed by the Video Services team. It replaces manual downloading, uploading, and metadata copying with a configurable, trial-specific workflow system that maintains full traceability between source and output assets.

## Problem Statement

Video Services currently performs manual operations including:

- Downloading source videos from the ChilliPharm platform
- Applying transformations externally (redaction, combining, etc.)
- Re-uploading processed files to potentially multiple destination libraries
- Manually copying metadata fields with trial-specific rules about which fields to copy
- No systematic way to correlate source and output assets for downstream reporting

## Solution

A workflow automation application with two modes:

### Admin Mode
Administrators configure reusable workflows that define:
- Source site (where operators browse for input assets)
- Optional QA destination (where processed files go for quality review)
- Delivery destination(s) (where approved files get uploaded)
- Field mapping rules per destination (which metadata fields to copy)

### Normal Mode
Operators execute workflows by:
- Creating named tasks with descriptions, optionally assigning to a team member
- Selecting input assets from the configured source site (with search, filter, and sort)
- Downloading and processing videos externally
- Dragging processed files into a drop zone
- Submitting to QA for review (if workflow has a QA destination)
- Clicking Complete to trigger automated upload and field copying to all delivery destinations

## Key Features

### Kanban Task Board
- Tasks displayed as a kanban board with columns: Live, With Video Solutions, In QC, Passed QC, Delivered
- Search by task name, description, or workflow name
- Filter by workflow
- Each card shows workflow, task name, source asset, date, and assignee

### Task Assignment
- Tasks can be assigned to a team member during creation or from the task detail page
- User picker dialog with search to find and select users
- Assignee displayed on kanban cards and task detail page
- Assignment can be changed or removed at any time

### Asset Selection with Filtering
- Multi-asset selection via checkbox UI during task creation
- Search assets by name with debounced input (300ms)
- Filter by visit type, assessment, subject ID, and date range
- Sort by name, date, file size, or duration (ascending/descending)

### QA Review Workflow
- Workflows can define an optional QA destination
- Processed files are first submitted to QA for review
- QA reviewer can approve (advancing to delivery) or reject (returning to in-progress)
- Full audit trail of QA submissions, approvals, and rejections

### Task Persistence
- Tasks can be created, named, and resumed across sessions
- Two-step creation flow: task details then source asset selection
- Task membership allows collaboration between team members

### Explicit Completion
- Files are staged in browser memory when dropped
- Upload and distribution only occurs when user clicks Complete
- Atomic operation ensures all-or-nothing processing

### Correlation Tracking
- Every completion creates correlation records
- Links source asset(s) to output asset(s)
- Enables automated downstream reporting

### Field Mapping Flexibility
- Per-destination configuration
- Four modes: All fields, No fields, Include specific, Exclude specific
- Supports complex multi-reviewer scenarios with different requirements

## User Roles

| Role | Capabilities |
|------|--------------|
| **Administrator** | Create and manage workflow configurations |
| **Operator** | Create tasks, select assets, upload processed files, complete tasks |

## Technology Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Authentication**: Firebase Authentication
- **Styling**: Tailwind CSS
- **Database**: In-memory mock data (production would use PostgreSQL)
- **API**: RESTful Next.js API routes
- **Frontend**: React with drag-and-drop file staging and kanban board

## Success Criteria

- Elimination of manual upload/download cycles
- Consistent field mapping based on trial configuration
- Complete audit trail via correlation records
- Reduced processing time and error rate
- Seamless integration with existing ChilliPharm platform

## Documents

| Document | Description |
|----------|-------------|
| [SPECIFICATION.md](./SPECIFICATION.md) | Detailed technical specification |
| [features/](./features/) | BDD feature files for all functionality |
