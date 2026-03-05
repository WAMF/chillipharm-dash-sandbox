@normal-mode
Feature: Task Management
  As a video services operator
  I need to create and manage processing tasks
  So that I can track my video processing work

  Background:
    Given I am logged in as an operator
    And active workflows exist in the system

  # --- Task Creation (Two-Step Flow) ---

  @create @smoke
  Scenario: Create a new task with assignment
    Given I am on the task dashboard
    When I click "New Task"
    Then I should see step 1 "Details"
    When I select the workflow "Redaction"
    And I enter the following task details:
      | Field       | Value                                   |
      | Task Name   | Subject 20308 Refill Week 36            |
      | Description | Redact refill visit recording           |
    And I assign the task to "Stevie Hall"
    And I click "Continue to Source Asset"
    Then the task should be created with status "Todo"
    And I should see step 2 "Source Asset"

  @create
  Scenario: Create task with minimal details
    Given I am on the create task page
    When I select the workflow "Redaction"
    And I enter the task name "Quick Redaction Task"
    And I click "Continue to Source Asset"
    Then a task "Quick Redaction Task" should be created
    And the task should have no description
    And the task should be unassigned

  @create @unassigned
  Scenario: Create task without assignment
    Given I am on the create task page
    When I select a workflow and enter a task name
    And I do not select an assignee
    And I click "Continue to Source Asset"
    Then the task should be created
    And the task should be unassigned

  @validation @negative
  Scenario: Cannot create task without required fields
    Given I am on the create task page
    When I click "Continue to Source Asset" without entering a task name
    Then I should see a validation error "Please enter a task name"
    And the task should not be created

  @validation @negative
  Scenario: Cannot create task without selecting a workflow
    Given I am on the create task page
    When I enter a task name "Test Task"
    But I do not select a workflow
    Then the "Continue to Source Asset" button should be disabled

  # --- Task Assignment ---

  @assign
  Scenario: Assign a task during creation
    Given I am on the create task page
    When I click the "Assign to" field
    Then I should see the user picker dialog
    And I should see users: "Sarah Jenkins", "Stevie Hall", "Jaq Aguila", "Pavlos Georgiou"
    When I select "Stevie Hall"
    Then the "Assign to" field should show "Stevie Hall" with an avatar

  @assign @search
  Scenario: Search for users in the picker
    Given the user picker dialog is open
    When I type "Jaq" in the search field
    Then I should see "Jaq Aguila"
    And I should not see "Stevie Hall"
    And I should not see "Pavlos Georgiou"

  @assign @change
  Scenario: Change task assignment from detail page
    Given I am on the detail page for an assigned task
    When I click on the assigned user
    Then I should see the user picker dialog
    When I select a different user
    Then the assignment should be updated

  @assign @remove
  Scenario: Remove task assignment
    Given I am on the detail page for an assigned task
    When I click on the assigned user
    And I click "Remove assignment" in the user picker
    Then the task should become unassigned

  # --- Task Viewing (Kanban Board) ---

  @view @kanban
  Scenario: View tasks on kanban board
    Given the following tasks exist:
      | Name                       | Status      | Assigned To     |
      | Subject 20312 Visit Wk 48  | todo        | Unassigned      |
      | Subject 20308 Refill Wk 36 | in_progress | Stevie Hall     |
      | Subject 20309 Baseline Wk 0| qa          | Jaq Aguila      |
      | Subject 20310 Visit Wk 12  | approved    | Unassigned      |
      | Subject 20311 Refill Wk 24 | done        | Pavlos Georgiou |
    When I view the task dashboard
    Then I should see 5 kanban columns: "LIVE", "WITH VIDEO SOLUTIONS", "IN QC", "PASSED QC", "DELIVERED"
    And "Subject 20312 Visit Wk 48" should be in the "LIVE" column
    And "Subject 20308 Refill Wk 36" should be in the "WITH VIDEO SOLUTIONS" column
    And "Subject 20309 Baseline Wk 0" should be in the "IN QC" column
    And "Subject 20310 Visit Wk 12" should be in the "PASSED QC" column
    And "Subject 20311 Refill Wk 24" should be in the "DELIVERED" column

  @view @kanban @card
  Scenario: Kanban card displays task information
    Given a task exists with:
      | Field       | Value                    |
      | Name        | Subject 20308 Refill Wk 36 |
      | Workflow    | Redaction                |
      | Assigned To | Stevie Hall              |
      | Created At  | 2024-01-28               |
    When I view the kanban board
    Then the task card should show the workflow name
    And the task card should show the task name
    And the task card should show the first input asset name
    And the task card should show the creation date
    And the task card should show "Stevie" with an avatar

  @filter
  Scenario: Filter tasks by workflow
    Given tasks exist using different workflows
    When I select a workflow from the filter dropdown
    Then I should only see tasks using that workflow
    And the filter should apply across all kanban columns

  @search
  Scenario: Search tasks by name
    Given the following tasks exist:
      | Name                       |
      | Subject 20308 Refill Wk 36 |
      | Subject 20309 Baseline Wk 0|
      | Subject 20310 Visit Wk 12  |
    When I search for "20308"
    Then I should see "Subject 20308 Refill Wk 36"
    And I should not see "Subject 20309 Baseline Wk 0"
    And I should not see "Subject 20310 Visit Wk 12"

  @search
  Scenario: Search matches description and workflow name
    Given a task with description "Urgent redaction needed"
    When I search for "Urgent"
    Then the task should appear in the results

  @filter
  Scenario: Clear search and filters
    Given I have an active search query and workflow filter
    When I click "Clear"
    Then the search field should be empty
    And the workflow filter should reset to "All Workflows"
    And all tasks should be visible

  # --- Task Editing ---

  @edit
  Scenario: Edit task details from detail page
    Given I am on the task detail page for "Subject 20308 Refill Wk 36"
    When I update the task name to "Subject 20308 Refill Week 36 — Updated"
    And I save the changes
    Then the task name should be updated

  # --- Task Deletion ---

  @delete
  Scenario: Delete a task
    Given I am on the task detail page
    When I click "Delete"
    And I confirm the deletion
    Then the task should be removed
    And I should be redirected to the task dashboard
