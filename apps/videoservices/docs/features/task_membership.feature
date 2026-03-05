@normal-mode @membership
Feature: Task Membership
  As a video services operator
  I need to manage who can access my tasks
  So that I can collaborate with colleagues

  Background:
    Given I am logged in as an operator
    And I am a member of task "SUB001 Visit 3 Redaction"

  # --- Viewing Members ---

  @view
  Scenario: View task members
    Given the task has the following members:
      | Name           | Role    |
      | Stevie Jones   | Creator |
      | Sarah Mitchell | Member  |
    When I click "Manage Members"
    Then I should see "Stevie Jones" marked as creator
    And I should see "Sarah Mitchell" as a member

  # --- Adding Members ---

  @add
  Scenario: Add a member to a task
    Given I am on the manage members modal
    When I search for user "John Smith"
    And I select "John Smith" from the results
    Then "John Smith" should be added as a task member
    And "John Smith" should be able to see and work on the task

  @add @negative
  Scenario: Cannot add the same user twice
    Given "Sarah Mitchell" is already a member of the task
    When I try to add "Sarah Mitchell" again
    Then I should see an error "User is already a member"
    And the member list should not change

  @add @search
  Scenario: Search for users to add
    Given I am on the manage members modal
    When I type "Sar" in the search field
    Then I should see users whose names contain "Sar"
    And I should not see users who are already members

  # --- Removing Members ---

  @remove
  Scenario: Remove a member from a task
    Given "Sarah Mitchell" is a member of the task
    And "Sarah Mitchell" is not the creator
    When I click "Remove" next to "Sarah Mitchell"
    Then "Sarah Mitchell" should be removed from the task
    And "Sarah Mitchell" should no longer be able to see the task

  @remove @negative
  Scenario: Cannot remove the task creator
    Given "Stevie Jones" is the creator of the task
    When I view the manage members modal
    Then I should not see a "Remove" button next to "Stevie Jones"

  @remove @negative
  Scenario: Cannot remove yourself if you are the only member
    Given I am the only member of the task
    When I view the manage members modal
    Then I should not be able to remove myself

  # --- Member Permissions ---

  @permissions
  Scenario: Any member can add other members
    Given I am a member but not the creator of the task
    When I click "Manage Members"
    Then I should be able to add new members

  @permissions
  Scenario: Any member can remove other members
    Given I am a member but not the creator of the task
    And "John Smith" is also a member
    When I click "Manage Members"
    Then I should be able to remove "John Smith"

  @permissions
  Scenario: Any member can complete the task
    Given I am a member but not the creator of the task
    And the task has assets selected and a file staged
    When I click "Complete"
    Then I should be able to complete the task

  @permissions
  Scenario: Any member can delete the task
    Given I am a member but not the creator of the task
    And the task status is not "Complete"
    When I click "Delete"
    Then I should be able to delete the task
