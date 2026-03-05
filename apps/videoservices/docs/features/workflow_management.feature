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
  Scenario: Create a new workflow with QA destination
    Given I am on the workflow administration page
    When I click "Create Workflow"
    And I enter the following workflow details:
      | Field       | Value                                            |
      | Name        | Redaction                                        |
      | Trial       | WR42221 - Velodrome                              |
      | Source Site  | Library: 336160 - Sunderland Eye Infirmary - GBR |
    And I configure a QA destination:
      | Field              | Value                          |
      | Site               | Velodrome Sponsor QC Library   |
      | Field Mapping Mode | Include                        |
      | Fields             | subject_id, visit_date, visit_type, Assessment |
    And I add a delivery destination with the following details:
      | Field              | Value                              |
      | Site               | Velodrome Sponsor/Review Library   |
      | Is Primary         | Yes                                |
      | Field Mapping Mode | All                                |
    And I click "Save Workflow"
    Then the workflow "Redaction" should be created
    And the workflow should have a QA destination
    And the workflow should have 1 delivery destination

  @create
  Scenario: Create a workflow without QA destination
    Given I am on the workflow administration page
    When I click "Create Workflow"
    And I enter the following workflow details:
      | Field       | Value                    |
      | Name        | Simple Distribution      |
      | Trial       | WR42221 - Velodrome      |
      | Source Site  | London Central           |
    And I add a delivery destination with the following details:
      | Field              | Value                              |
      | Site               | Velodrome Sponsor/Review Library   |
      | Is Primary         | Yes                                |
      | Field Mapping Mode | Include                            |
      | Fields             | subject_id, assessment_type        |
    And I add a delivery destination with the following details:
      | Field              | Value                              |
      | Site               | Velodrome Sponsor QC Library       |
      | Is Primary         | No                                 |
      | Field Mapping Mode | None                               |
    And I click "Save Workflow"
    Then the workflow "Simple Distribution" should be created
    And the workflow should not have a QA destination
    And the workflow should have 2 delivery destinations

  # --- Workflow Validation ---

  @validation @negative
  Scenario: Cannot create workflow without required fields
    Given I am on the create workflow page
    When I click "Save Workflow" without entering any details
    Then I should see validation errors for:
      | Field       |
      | Name        |
      | Trial       |
      | Source Site  |
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
    And I have added a destination for "Velodrome Sponsor/Review Library"
    When I try to add another destination for "Velodrome Sponsor/Review Library"
    Then I should see an error "This site is already a destination"
    And the duplicate destination should not be added

  # --- Workflow Editing ---

  @edit
  Scenario: Edit an existing workflow
    Given a workflow "Redaction" exists
    And I am on the workflow administration page
    When I click "Edit" on the workflow "Redaction"
    And I change the workflow name to "Redaction v2"
    And I click "Save Workflow"
    Then the workflow name should be updated to "Redaction v2"

  @edit
  Scenario: Add a destination to an existing workflow
    Given a workflow "Redaction" exists with 1 delivery destination
    When I edit the workflow
    And I add a delivery destination with the following details:
      | Field              | Value               |
      | Site               | London Central      |
      | Is Primary         | No                  |
      | Field Mapping Mode | None                |
    And I click "Save Workflow"
    Then the workflow should have 2 delivery destinations

  @edit
  Scenario: Remove a destination from a workflow
    Given a workflow exists with 2 delivery destinations
    When I edit the workflow
    And I remove one destination
    And I click "Save Workflow"
    Then the workflow should have 1 delivery destination

  @edit
  Scenario: Edit destination field mapping
    Given a workflow exists with a destination "Velodrome Sponsor/Review Library"
    And the destination has field mapping mode "All"
    When I edit the workflow
    And I edit the destination "Velodrome Sponsor/Review Library"
    And I change the field mapping mode to "Include"
    And I set the fields to "subject_id, visit_date"
    And I save the destination
    And I click "Save Workflow"
    Then the destination should have field mapping mode "Include"
    And the destination should have fields "subject_id, visit_date"

  @edit
  Scenario: Add QA destination to existing workflow
    Given a workflow "Simple Distribution" exists without a QA destination
    When I edit the workflow
    And I configure a QA destination
    And I click "Save Workflow"
    Then the workflow should have a QA destination

  # --- Workflow Deletion ---

  @delete @negative
  Scenario: Cannot delete a workflow with existing tasks
    Given a workflow "Redaction" exists
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
