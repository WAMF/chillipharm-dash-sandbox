@normal-mode @completion
Feature: Task Completion
  As a video services operator
  I need to upload processed files and complete tasks
  So that the files are distributed to the correct destinations

  Background:
    Given I am logged in as an operator
    And I am on the detail page for task "Subject 20308 Refill Week 36"
    And the task has input assets selected
    And the task uses workflow "Redaction"

  # --- File Staging ---

  @staging @smoke
  Scenario: Stage a file by dragging into drop zone
    Given the task status is "In Progress"
    When I drag "Subject 20308 Refill Week 36 — Redacted.mp4" into the drop zone
    Then the file should be staged in browser memory
    And I should see the staged file name and size
    And I should see a warning "File is in memory. Do not close browser before clicking Complete."

  @staging
  Scenario: Stage a file by clicking to browse
    Given the task status is "In Progress"
    When I click on the drop zone
    And I select "Subject 20308 Refill Week 36 — Redacted.mp4" from the file picker
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

  # --- QA Submission ---

  @qa @submit
  Scenario: Submit output to QA
    Given the workflow has a QA destination "Velodrome Sponsor QC Library"
    And I have staged file "Subject 20308 Refill Week 36 — Redacted.mp4"
    And the task status is "In Progress"
    When I click "Submit to QA"
    Then the file should be uploaded to the QA destination
    And the task status should change to "QA"
    And the qa_submitted_at and qa_submitted_by fields should be recorded

  @qa @approve
  Scenario: Approve QA review
    Given the task status is "QA"
    And the file has been submitted to QA
    When I click "Approve QA"
    Then the task status should change to "Approved"
    And the qa_approved_at and qa_approved_by fields should be recorded

  @qa @reject
  Scenario: Reject QA review
    Given the task status is "QA"
    And the file has been submitted to QA
    When I click "Reject QA"
    Then the task status should return to "In Progress"
    And the qa_rejected_at and qa_rejected_by fields should be recorded
    And the QA submission fields should be cleared

  @qa @reject @resubmit
  Scenario: Resubmit after QA rejection
    Given the task was rejected from QA and status is "In Progress"
    When I stage a revised file
    And I click "Submit to QA"
    Then the file should be uploaded to the QA destination
    And the task status should change to "QA"
    And the rejection fields should be cleared

  # --- Complete Button State ---

  @button-state
  Scenario: Submit to QA is disabled without staged file
    Given the workflow has a QA destination
    And no file is staged
    Then the "Submit to QA" button should be disabled

  @button-state
  Scenario: Complete button is enabled when approved
    Given the task status is "Approved"
    Then the "Complete" button should be enabled

  @button-state
  Scenario: Complete button is disabled without inputs
    Given the task status is "Todo"
    And no assets are selected
    Then the "Complete" button should be disabled
    And the "Submit to QA" button should be disabled

  # --- Completion Process ---

  @complete @smoke
  Scenario: Complete a task after QA approval
    Given the task status is "Approved"
    And the workflow has destination "Velodrome Sponsor/Review Library" with field mapping "all"
    When I click "Complete"
    Then the file should be uploaded to "Velodrome Sponsor/Review Library"
    And the fields should be copied per the destination rules
    And a correlation record should be created
    And the task status should change to "Done"
    And the completed_at and completed_by fields should be recorded

  @complete @no-qa
  Scenario: Complete a task without QA (workflow has no QA destination)
    Given the workflow has no QA destination
    And the task status is "In Progress"
    And I have staged a file
    When I click "Complete"
    Then the file should be uploaded to all destinations
    And the task status should change to "Done"

  @complete @progress
  Scenario: View completion progress
    Given I have clicked "Complete"
    And uploads are in progress
    Then I should see the overall progress percentage
    And I should see the status of each destination
    And I should see a message "Do not close this window"

  # --- Completion Success ---

  @complete @success
  Scenario: View completed task details
    Given the task status is "Done"
    When I view the task detail page
    Then I should see the task status as "Done"
    And I should see who completed the task
    And I should see when the task was completed
    And I should see the QA submission and approval history
    And I should see links to view each output asset
