@admin
Feature: Workflow Management
  As an administrator
  I need to create and manage workflow configurations
  So that operators can use predefined workflows to process videos

  Background:
    Given I am logged in as an administrator
    And I have the "vs:admin" permission

  # --- Workflow Creation ---

  @create @smoke
  Scenario: Create a new Transform workflow
    Given I am on the workflow administration page
    When I click "Create Workflow"
    And I enter the following workflow details:
      | Field         | Value                          |
      | Name          | Scholar Rock VHOT Redaction    |
      | Trial         | SR-2025-001                    |
      | Workflow Type | Transform                      |
      | Source Site   | Main Collection Site           |
    And I add a destination with the following details:
      | Field              | Value                          |
      | Site               | Reviewer Site Alpha            |
      | Is Primary         | Yes                            |
      | Field Mapping Mode | Include                        |
      | Fields             | subject_id, assessment_type    |
    And I click "Save Workflow"
    Then the workflow "Scholar Rock VHOT Redaction" should be created
    And the workflow status should be "Active"
    And the workflow should appear in the workflow list

  @create
  Scenario: Create a Distribute workflow with multiple destinations
    Given I am on the workflow administration page
    When I click "Create Workflow"
    And I enter the following workflow details:
      | Field         | Value                     |
      | Name          | Trial ABC Multi-Review    |
      | Trial         | ABC-2025-002              |
      | Workflow Type | Distribute                |
      | Source Site   | Clinical Site Alpha       |
    And I add a destination with the following details:
      | Field              | Value                          |
      | Site               | Reviewer Site Alpha            |
      | Is Primary         | Yes                            |
      | Field Mapping Mode | Include                        |
      | Fields             | subject_id, assessment_type    |
    And I add a destination with the following details:
      | Field              | Value               |
      | Site               | Reviewer Site Beta  |
      | Is Primary         | No                  |
      | Field Mapping Mode | None                |
    And I add a destination with the following details:
      | Field              | Value         |
      | Site               | Archive Site  |
      | Is Primary         | No            |
      | Field Mapping Mode | All           |
    And I click "Save Workflow"
    Then the workflow "Trial ABC Multi-Review" should be created
    And the workflow should have 3 destinations

  @create
  Scenario: Create a Combine workflow
    Given I am on the workflow administration page
    When I click "Create Workflow"
    And I enter the following workflow details:
      | Field         | Value                    |
      | Name          | Trial XYZ Compilation    |
      | Trial         | XYZ-2025-003             |
      | Workflow Type | Combine                  |
      | Source Site   | Recording Site           |
    And I add a destination with the following details:
      | Field              | Value              |
      | Site               | Compilation Store  |
      | Is Primary         | Yes                |
      | Field Mapping Mode | Include            |
      | Fields             | subject_id         |
    And I click "Save Workflow"
    Then the workflow "Trial XYZ Compilation" should be created
    And the workflow type should be "Combine"

  # --- Workflow Validation ---

  @validation @negative
  Scenario: Cannot create workflow without required fields
    Given I am on the create workflow page
    When I click "Save Workflow" without entering any details
    Then I should see validation errors for:
      | Field         |
      | Name          |
      | Trial         |
      | Workflow Type |
      | Source Site   |
    And the workflow should not be created

  @validation @negative
  Scenario: Cannot create workflow without at least one destination
    Given I am on the create workflow page
    And I have entered valid workflow details
    But I have not added any destinations
    When I click "Save Workflow"
    Then I should see an error "At least one destination is required"
    And the workflow should not be created

  @validation @negative
  Scenario: Cannot add duplicate destination sites
    Given I am on the create workflow page
    And I have added a destination for "Reviewer Site Alpha"
    When I try to add another destination for "Reviewer Site Alpha"
    Then I should see an error "This site is already a destination"
    And the duplicate destination should not be added

  # --- Workflow Editing ---

  @edit
  Scenario: Edit an existing workflow
    Given a workflow "Scholar Rock VHOT Redaction" exists
    And I am on the workflow administration page
    When I click "Edit" on the workflow "Scholar Rock VHOT Redaction"
    And I change the workflow name to "Scholar Rock VHOT Redaction v2"
    And I click "Save Workflow"
    Then the workflow name should be updated to "Scholar Rock VHOT Redaction v2"

  @edit
  Scenario: Add a destination to an existing workflow
    Given a workflow "Scholar Rock VHOT Redaction" exists with 1 destination
    When I edit the workflow
    And I add a destination with the following details:
      | Field              | Value               |
      | Site               | Reviewer Site Beta  |
      | Is Primary         | No                  |
      | Field Mapping Mode | None                |
    And I click "Save Workflow"
    Then the workflow should have 2 destinations

  @edit
  Scenario: Remove a destination from a workflow
    Given a workflow "Trial ABC Multi-Review" exists with 3 destinations
    When I edit the workflow
    And I remove the destination "Reviewer Site Beta"
    And I click "Save Workflow"
    Then the workflow should have 2 destinations
    And "Reviewer Site Beta" should not be a destination

  @edit
  Scenario: Edit destination field mapping
    Given a workflow exists with a destination "Reviewer Site Alpha"
    And the destination has field mapping mode "Include" with fields "subject_id"
    When I edit the workflow
    And I edit the destination "Reviewer Site Alpha"
    And I change the field mapping mode to "Exclude"
    And I set the fields to "internal_notes"
    And I save the destination
    And I click "Save Workflow"
    Then the destination "Reviewer Site Alpha" should have field mapping mode "Exclude"
    And the destination should have fields "internal_notes"

  # --- Workflow Status ---

  @status
  Scenario: Deactivate a workflow
    Given an active workflow "Scholar Rock VHOT Redaction" exists
    When I click "Deactivate" on the workflow
    And I confirm the deactivation
    Then the workflow status should be "Inactive"
    And the workflow should not appear in operator workflow lists

  @status
  Scenario: Reactivate an inactive workflow
    Given an inactive workflow "Old Trial Workflow" exists
    When I click "Activate" on the workflow
    Then the workflow status should be "Active"
    And the workflow should appear in operator workflow lists

  @delete @negative
  Scenario: Cannot delete a workflow with existing tasks
    Given a workflow "Scholar Rock VHOT Redaction" exists
    And tasks exist that use this workflow
    When I try to delete the workflow
    Then I should see an error "Cannot delete workflow with existing tasks"
    And the workflow should still exist

  # --- Field Mapping Modes ---

  @field-mapping
  Scenario Outline: Configure field mapping mode
    Given I am configuring a destination
    When I select field mapping mode "<mode>"
    Then <field_selection_behaviour>

    Examples:
      | mode    | field_selection_behaviour                              |
      | All     | I should not be able to select individual fields       |
      | None    | I should not be able to select individual fields       |
      | Include | I should be able to select fields to include           |
      | Exclude | I should be able to select fields to exclude           |
