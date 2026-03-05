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
- Destination site(s) (where processed files get uploaded)
- Field mapping rules per destination (which metadata fields to copy)

### Normal Mode
Operators execute workflows by:
- Creating named tasks with reference links and descriptions
- Selecting input assets from the configured source site
- Downloading and processing videos externally
- Dragging processed files into a drop zone
- Clicking Complete to trigger automated upload and field copying

## Workflow Types

| Type | Input | Output | Use Case |
|------|-------|--------|----------|
| **Transform** | Single video | Single video to one site | Basic redaction |
| **Combine** | Multiple videos | Single video to one site | Compilation |
| **Distribute** | Single video | Single video to multiple sites | Multi-reviewer distribution |

## Key Features

### Task Persistence
- Tasks can be created, named, and resumed across sessions
- Reference links connect tasks to Jira tickets or email requests
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

- **Authentication**: Auth0
- **Database**: New tables for workflows, tasks, task members, and correlations
- **API**: RESTful endpoints for all operations
- **Frontend**: Browser-based with drag-and-drop file staging

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
