@normal-mode
Feature: Task Management
  As a video services operator
  I need to create and manage processing tasks
  So that I can track my video processing work

  Background:
    Given I am logged in as an operator
    And I have the "vs:tasks:write" permission
    And active workflows exist in the system

  # --- Task Creation ---

  @create @smoke
  Scenario: Create a new task
    Given I am on the task dashboard
    When I click "New Task"
    And I select the workflow "Scholar Rock VHOT Redaction"
    And I enter the following task details:
      | Field          | Value                                       |
      | Name           | SUB001 Visit 3 Redaction                    |
      | Reference Link | https://jira.chillipharm.com/browse/VS-1234 |
      | Description    | Redaction requested by Dr Smith             |
    And I click "Create Task"
    Then a task "SUB001 Visit 3 Redaction" should be created
    And the task status should be "Created"
    And I should be a member of the task
    And I should be marked as the task creator

  @create
  Scenario: Create task with minimal details
    Given I am on the task dashboard
    When I click "New Task"
    And I select the workflow "Scholar Rock VHOT Redaction"
    And I enter the task name "Quick Redaction Task"
    And I click "Create Task"
    Then a task "Quick Redaction Task" should be created
    And the task should have no reference link
    And the task should have no description

  @validation @negative
  Scenario: Cannot create task without required fields
    Given I am on the create task modal
    When I click "Create Task" without entering a task name
    Then I should see a validation error for "Name"
    And the task should not be created

  @validation @negative
  Scenario: Cannot create task without selecting a workflow
    Given I am on the create task modal
    When I enter a task name "Test Task"
    But I do not select a workflow
    And I click "Create Task"
    Then I should see a validation error for "Workflow"
    And the task should not be created

  # --- Task Viewing and Filtering ---

  @view
  Scenario: View my tasks on dashboard
    Given I am a member of the following tasks:
      | Name                      | Status          |
      | SUB001 Visit 3 Redaction  | Assets Selected |
      | SUB002 Visit 1 Redaction  | Complete        |
      | SUB003 Compilation        | Created         |
    When I view the task dashboard
    Then I should see all 3 tasks
    And the tasks should be ordered by most recently updated

  @filter
  Scenario: Filter tasks by status
    Given I am a member of tasks with various statuses
    When I filter by status "Complete"
    Then I should only see tasks with status "Complete"

  @filter
  Scenario: Filter tasks by workflow
    Given I am a member of tasks using different workflows
    When I filter by workflow "Scholar Rock VHOT Redaction"
    Then I should only see tasks using that workflow

  @search
  Scenario: Search tasks by name
    Given I am a member of the following tasks:
      | Name                      |
      | SUB001 Visit 3 Redaction  |
      | SUB002 Visit 1 Redaction  |
      | SUB003 Compilation        |
    When I search for "SUB001"
    Then I should see "SUB001 Visit 3 Redaction"
    And I should not see "SUB002 Visit 1 Redaction"
    And I should not see "SUB003 Compilation"

  @security
  Scenario: Cannot see tasks where I am not a member
    Given a task "Secret Task" exists
    And I am not a member of "Secret Task"
    When I view the task dashboard
    Then I should not see "Secret Task"

  # --- Task Editing ---

  @edit
  Scenario: Edit task details
    Given I am a member of task "SUB001 Visit 3 Redaction"
    And the task status is "Created"
    When I open the task
    And I update the task name to "SUB001 Visit 3 Full Redaction"
    And I update the description to "Updated description"
    And I save the changes
    Then the task name should be "SUB001 Visit 3 Full Redaction"
    And the task description should be "Updated description"

  @edit @negative
  Scenario: Cannot edit completed task
    Given I am a member of task "SUB002 Visit 1 Redaction"
    And the task status is "Complete"
    When I open the task
    Then I should not be able to edit the task name
    And I should not be able to edit the task description

  # --- Task Deletion ---

  @delete
  Scenario: Delete a task
    Given I am a member of task "SUB003 Compilation"
    And the task status is "Created"
    When I click "Delete" on the task
    And I confirm the deletion
    Then the task should be marked as deleted
    And the task should not appear in my task list

  @delete
  Scenario: Delete confirmation is required
    Given I am a member of task "SUB003 Compilation"
    When I click "Delete" on the task
    Then I should see a confirmation dialog
    And the task should not be deleted until I confirm

  @delete
  Scenario: Can delete task with assets selected
    Given I am a member of task "SUB001 Visit 3 Redaction"
    And the task status is "Assets Selected"
    When I click "Delete" on the task
    And I confirm the deletion
    Then the task should be marked as deleted

  @delete @negative
  Scenario: Cannot delete completed task
    Given I am a member of task "SUB002 Visit 1 Redaction"
    And the task status is "Complete"
    When I open the task
    Then I should not see a "Delete" button
