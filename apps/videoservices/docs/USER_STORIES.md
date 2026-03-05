# Video Services Workflow Tool - User Stories

## Authentication

**Successful Login - Regular User** - As a user with valid credentials, I need to successfully authenticate through Firebase, so that I can access the application with my assigned permissions.

**Failed Login - Invalid Credentials** - As a user with incorrect credentials, I need to see a clear error message when authentication fails, so that I understand why my login attempt was rejected and can take corrective action.

**Role-Based Access Control** - As a user logging in, I need my roles to be inherited automatically upon successful authentication, so that I can access only the features and data permitted by my assigned role(s).

**Session Management - Role Verification** - As a logged-in user, I need my roles and permissions to be verified on each protected action, so that I maintain secure access control throughout my session.

**Session Management - Inactivity** - As a logged-in user, I need my session to expire after 1hr of inactivity, so that I maintain secure access control to the application.

**Session Persistence** - As a logged-in user, I need my session to persist across page refreshes, so that I don't have to log in again during normal use.

**Sign Out** - As a logged-in user, I need to be able to sign out from the sidebar, so that I can securely end my session.

## Roles/Permissions

**Roles/permissions setting** - As a system administrator I need to setup roles and permissions to allow users to perform their tasks according to the company workflow/policy.

TBC

| Role | Workflow/Config | Status | Logs |
|------|----------------|--------|------|
| VS Admin | Create/Edit/Delete | Set status (active/inactive) | View |
| VS Operator | Execute | Download/upload/set Ready for QC | View |
| VS QC User | Execute | Set QC approve* | View |
| Sys Admin | - | | |

*VS Quality role cannot QC approve an asset they edited (Status: "ready for QC")

## Workflow Setup

**Workflow - Admin/Setup** - As a VS admin, I need to setup a workflow configuration so that I can define how assets should be processed and distributed.

**Workflow - Source Selection** - As a VS admin, I need to select a source site from available sites, so that operators know where to browse for input assets.

**Workflow - QC Destination** - As a VS admin, I need to optionally configure a QC/QA destination site with field mapping rules, so that processed files go through quality review before final delivery.

**Workflow - Destination config** - As a VS admin, I need to select my destination libraries in my workflow so that I control where processed assets are uploaded (once QC approved).

**Workflow - Primary Destination** - As a VS admin, I need to mark one destination as primary, so that operators know which is the main delivery target.

**Workflow - Metadata mapping** - As a VS admin, I need to select which metadata fields (or none) are uploaded to each destination library so that I can control what information is shared. Four modes are supported: copy all fields, copy no fields, include specific fields, or exclude specific fields.

**Workflow - Field Selection UI** - As a VS admin, I need to see the available fields from the source site and toggle individual fields on/off when using include or exclude mapping modes, so that I can precisely control which metadata is copied.

**Workflow - Saving** - As a VS admin, I need to be able to name and save a workflow so that it can be applied as part of the video management workflow.

**Workflow - Management** - As a VS admin, I need to edit/delete existing workflows so that our processing aligns with our business goals.

**Workflow - Search** - As a VS admin, I need to search workflows by name or source site, so that I can quickly find the workflow I need to manage.

**Workflow - Preview** - As a VS admin or operator, I need to see the source site and destination sites when selecting a workflow, so that I understand where files will flow.

VS Admin only - No other role should be able to setup/edit/amend workflow.

## CPW Integration

**Integration - CPW** - As a sys admin, I need to connect to an external library asset management system (CPW) so that a user can access and process assets from that repository.

## System Logging & Audit

**Logging/Audit** - As a sys administrator, I need all user interactions to be logged in system logs so that we have a complete audit trail. Each log entry to include 1) User Identity, 2) Date/time, and 3) Action performed (valid action list TBC).

**Integrate Logging** - As a sys admin I need to integrate with Sumo-Logic so that any generated logfiles are automatically sync'd to our company logging solution (for compliance/retention in line with our existing policies).

## Task Creation

**Task - Create Task** - As a VS admin, I need to be able to create a task so that we can process assets in a timely and controlled manner. (Task name, Description)

**Task - Two-Step Creation Flow** - As a VS admin, I need to create a task in two steps (1. task details, 2. source asset selection), so that I can configure the task before browsing assets.

**Task - Choose workflow** - As a VS admin, I need to select a workflow so that I setup specific workflow to handle a group of files. When selected, the workflow source and destination sites are previewed.

**Task - Browse asset** - As a VS admin, I need to browse/navigate assets in the external library so that I can identify which asset I want to process.

**Task - Search asset** - As a VS admin, I need to search assets by name in the external library with real-time debounced search (300ms delay), so that I can quickly find the asset I want to process.

**Task - Filter assets by metadata** - As a VS admin, I need to filter assets by visit type, assessment, subject ID, and visit date range, so that I can narrow down the asset list to relevant files.

**Task - Sort assets** - As a VS admin, I need to sort assets by name, created date, file size, or duration in ascending or descending order, so that I can organise the asset list as needed.

**Task - Clear asset filters** - As a VS admin, I need to clear all active filters and reset the asset view, so that I can start a fresh search.

**Tasks - Select asset(s)** - As a VS admin, I need to select one or more assets using checkboxes so that the VS user knows which assets to process. The button label shows the count of selected assets. (Status change - VS Edit in progress, log entry created)

**Tasks - Asset metadata display** - As a VS admin, I need to see metadata tags (subject ID, visit type, assessment) on each asset card, so that I can identify the correct assets without opening them.

**Task - Choose quality** - As a VS admin, I need to select the video quality of asset to process so that we are using the editing the correct file to support the rest of the trail process (default is 'HD Web Proxy').

**Tasks - Assign VS Operator** - As a VS admin I need to be able to assign a VS operator to a task using a user picker dialog with search, so that the operator knows to pick up the asset and process it according to the agreed process.

**Tasks - Assign QC User** - As a VS admin I need to be able to assign a QC user to a task so that the user knows to quality check the asset according to the agreed process.

**Tasks - Change Assignment** - As a VS admin, I need to change or remove a task assignment from the task detail page, so that tasks can be reassigned as workload changes.

**Tasks - Unassign** - As a VS admin, I need to be able to remove the assigned user from a task, so that it returns to an unassigned state.

## Asset Processing Workflow

**Process - Download** - As a VS operator, I need to download an asset for external processing so that I can edit it in external software. (No status change, log entry created)

**Process - File Drop Zone** - As a VS operator, I need to drag and drop a processed video file into a drop zone, so that the file is staged in browser memory ready for submission.

**Process - File Browse** - As a VS operator, I need to click to browse and select a file for upload, so that I have an alternative to drag-and-drop.

**Process - File Staging** - As a VS operator, I need to see the staged file name and size with a warning that the file is in browser memory, so that I know not to close the browser before submitting.

**Process - Clear Staged File** - As a VS operator, I need to clear a staged file before submission, so that I can select a different file if needed.

**Process - Upload/Submit to QC** - As a VS operator, I need to upload the processed asset to the QC destination so that it can be quality reviewed. (Status change - Ready for QC)

**Process - QC Status Display** - As a VS operator, I need to see "Awaiting QC review" with the submission timestamp when a file is submitted to QC, so that I know the current state.

**Process - QC approval** - As a VS QC user, I need to be able to confirm QC approval so that the asset can proceed to final distribution.

**Process - QC decline** - As a VS QC user, I need to be able to decline QC approval so that the asset can return to VS operator for additional editing. (Status change - VS Edit in progress, log entry created)

**Process - QC Rejection Display** - As a VS operator, I need to see a "Returned from QC" alert with the rejection timestamp when my task is rejected, so that I know to re-edit the file.

**Process - Workflow Progress Stepper** - As a VS user, I need to see a 3-step visual progress indicator (Submit to QC → QC Review → Complete), so that I understand where the task is in the overall process.

**Process - File distribution** - As a VS QC user, I need the system to automatically upload the QC-confirmed file to all configured destination libraries with their specified metadata so that distribution is automated and accurate.

**Process - Distribution [auto] Retry** - As an application, I need to retry any failed distributions [up to] 5 times so that we reduce the number of outstanding errors.

**Process - Distribution [manual] Retry** - As a VS user (all roles), I need to be able to manually retry any failed distributions so that we reduce the number of outstanding errors.

**Process - Distribution Complete** - As an application, I need to set asset status to complete upon successful distribution so that we know the files were copied to the libraries successfully and the process is finished.

**Process - Distribution failed** - As an application, I need to set asset status to Failed upon copy process failure (inc retry) so that we know the files copied to the libraries unsuccessfully and we need to take corrective action. (failure reason?)

**Process - Task History Timeline** - As a VS user, I need to see a timeline of events on the task detail page (creation, QC submission, QC approval/rejection, completion) with timestamps and user info, so that I have full traceability.

**Process - Manual Status Transition** - As a VS admin, I need to be able to manually move a task between any status using a "Move to" dropdown, so that I can correct status issues or skip steps when appropriate.

## Dashboard/Reporting

**Homepage Dashboard - Kanban Board** - As a system user, I need to see tasks displayed as a kanban board with 5 status columns (LIVE, WITH VIDEO SOLUTIONS, IN QC, PASSED QC, DELIVERED), so that I can see the overall workflow state at a glance. Each column shows a task count.

**Dashboard - Task Cards** - As a system user, I need each kanban card to show the workflow name, task name, first source asset, creation date, and assigned user (with avatar), so that I can identify tasks without opening them.

**Dashboard - Assignee Display** - As a system user, I need to see the assigned user's first name and avatar on each task card (or "Unassigned"), so that I know who is responsible for each task.

**Dashboard filtering - Workflow** - As a system user, I need to be able to filter the kanban board by workflow, so that I can focus on tasks for a specific workflow.

**Dashboard Search** - As a system user, I need to be able to search for specific tasks by name, description, or workflow name, so that I can quickly navigate to my work items.

**Dashboard - Clear Filters** - As a system user, I need to clear the search and workflow filter to reset the view, so that I can see all tasks again.

**Dashboard - Task Count** - As a system user, I need to see the total number of tasks displayed at the top of the page, so that I have a quick summary.

## Responsive Design

**Mobile Navigation** - As a mobile user, I need a bottom navigation bar optimised for touch, so that I can navigate the application on small screens.

**Desktop Sidebar** - As a desktop user, I need a collapsible sidebar navigation with links to Tasks and Workflows, so that I can navigate efficiently.

**Mobile Header** - As a mobile user, I need a sticky header with the application title, so that I always know which application I am using.
