@normal-mode @completion
Feature: Task Completion
  As a video services operator
  I need to upload processed files and complete tasks
  So that the files are distributed to the correct destinations

  Background:
    Given I am logged in as an operator
    And I am a member of task "SUB001 Visit 3 Redaction"
    And the task has assets selected
    And the task uses workflow "Scholar Rock VHOT Redaction"

  # --- File Staging ---

  @staging @smoke
  Scenario: Stage a file by dragging into drop zone
    Given I am on the task detail page
    When I drag "SUB001_VHOT_V3_REDACTED.mp4" into the drop zone
    Then the file should be staged in browser memory
    And I should see the staged file name and size
    And I should see a warning "File is in memory. Do not close browser before clicking Complete."

  @staging
  Scenario: Stage a file by clicking to browse
    Given I am on the task detail page
    When I click on the drop zone
    And I select "SUB001_VHOT_V3_REDACTED.mp4" from the file picker
    Then the file should be staged in browser memory
    And I should see the staged file details

  @staging @clear
  Scenario: Clear a staged file
    Given I have staged a file
    When I click "Clear"
    Then the staged file should be removed from memory
    And the drop zone should return to its empty state

  @staging @replace
  Scenario: Replace a staged file
    Given I have staged "file1.mp4"
    When I drag "file2.mp4" into the drop zone
    Then "file2.mp4" should replace "file1.mp4"
    And I should only see "file2.mp4" staged

  @staging @navigation
  Scenario: Staged file is lost on page navigation
    Given I have staged a file
    When I navigate away from the task detail page
    And I return to the task detail page
    Then no file should be staged
    And I should need to stage the file again

  # --- Complete Button State ---

  @button-state
  Scenario: Complete button is disabled without staged file
    Given no file is staged
    When I view the task detail page
    Then the "Complete" button should be disabled

  @button-state
  Scenario: Complete button is enabled with staged file
    Given I have staged a file
    When I view the task detail page
    Then the "Complete" button should be enabled

  @button-state
  Scenario: Complete button is disabled without assets selected
    Given the task status is "Created"
    And no assets are selected
    When I view the task detail page
    Then the "Complete" button should be disabled
    And I should not be able to stage a file

  # --- Completion Process ---

  @complete @single-destination
  Scenario: Complete a task with single destination
    Given the workflow has 1 destination "Reviewer Site Alpha"
    And the destination copies fields "subject_id, assessment_type"
    And I have staged file "SUB001_VHOT_V3_REDACTED.mp4"
    When I click "Complete"
    Then I should see a progress indicator
    And the file should be uploaded to "Reviewer Site Alpha"
    And the fields "subject_id, assessment_type" should be copied to the new asset
    And a correlation record should be created
    And the task status should change to "Complete"

  @complete @distribute @smoke
  Scenario: Complete a task with multiple destinations (Distribute)
    Given the workflow has the following destinations:
      | Site                 | Field Mapping                   |
      | Reviewer Site Alpha  | Include: subject_id, assessment |
      | Reviewer Site Beta   | None                            |
      | Archive Site         | All                             |
    And I have staged file "SUB001_VHOT_V3_REDACTED.mp4"
    When I click "Complete"
    Then the file should be uploaded to all 3 destinations
    And "Reviewer Site Alpha" should have fields "subject_id, assessment_type" copied
    And "Reviewer Site Beta" should have no fields copied
    And "Archive Site" should have all fields copied
    And 3 correlation records should be created with the same job_id
    And the task status should change to "Complete"

  @complete @progress
  Scenario: View completion progress
    Given I have clicked "Complete"
    And uploads are in progress
    Then I should see the overall progress percentage
    And I should see the status of each destination:
      | Destination          | Status     |
      | Reviewer Site Alpha  | Uploaded   |
      | Reviewer Site Beta   | Uploading  |
      | Archive Site         | Pending    |
    And I should see a message "Do not close this window"

  # --- Completion Success ---

  @complete @success
  Scenario: View completed task details
    Given the task has been completed successfully
    When I view the task detail page
    Then I should see the task status as "Complete"
    And I should see who completed the task
    And I should see when the task was completed
    And I should see links to view each output asset
    And I should see which fields were copied to each destination
    And I should see the correlation job ID

  # --- Completion Failure ---

  @complete @failure
  Scenario: Handle partial upload failure
    Given the workflow has 3 destinations
    And I have staged a file and clicked "Complete"
    And the upload to "Reviewer Site Beta" fails
    But the uploads to other destinations succeed
    Then the task status should change to "Failed"
    And I should see an error message indicating which destination failed
    And I should see the partial success status:
      | Destination          | Status  |
      | Reviewer Site Alpha  | Success |
      | Reviewer Site Beta   | Failed  |
      | Archive Site         | Success |

  @complete @retry
  Scenario: Retry failed task
    Given the task status is "Failed"
    And the error was "Connection timeout to Reviewer Site Beta"
    When I stage a file again
    And I click "Complete"
    Then the system should attempt to upload to all destinations again

  # --- Combine Workflow Completion ---

  @complete @combine
  Scenario: Complete a Combine workflow task
    Given the workflow type is "Combine"
    And the task has 3 input assets selected
    And I have staged the combined output file
    When I click "Complete"
    Then the output file should be uploaded to the destination
    And 3 correlation records should be created
    And each correlation should link one input asset to the output
    And all correlations should share the same job_id
