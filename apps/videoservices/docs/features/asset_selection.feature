@normal-mode @assets
Feature: Asset Selection
  As a video services operator
  I need to select input assets for my task
  So that I know which videos to process

  Background:
    Given I am logged in as an operator
    And I am creating a task using workflow "Redaction"
    And the workflow source site is "Library: 336160 - Sunderland Eye Infirmary"

  # --- Browsing Assets ---

  @browse
  Scenario: Browse assets from source site on step 2 of task creation
    Given I have completed task details in step 1
    When I proceed to step 2 "Source Asset"
    Then I should see the asset picker
    And I should see assets from the workflow source site
    And each asset should display name, duration, file size, and metadata tags

  @browse @search
  Scenario: Search for assets by name
    Given I am on the asset picker in step 2
    And the following assets exist:
      | Name                                              |
      | WR42221-366044-Subject 20308 Refill Week 36.mp4   |
      | WR42221-366044-Subject 20309 Baseline Week 0.mp4  |
      | WR42221-366044-Subject 20310 Visit Week 12.mp4    |
    When I type "20308" in the search field
    And I wait for the debounced search (300ms)
    Then I should see "WR42221-366044-Subject 20308 Refill Week 36.mp4"
    And I should not see "WR42221-366044-Subject 20309 Baseline Week 0.mp4"
    And I should not see "WR42221-366044-Subject 20310 Visit Week 12.mp4"

  # --- Filtering Assets ---

  @filter
  Scenario: Filter assets by visit type
    Given I am on the asset picker
    When I select "Refill Week 36" from the "Visit Type" filter
    Then I should only see assets with visit type "Refill Week 36"

  @filter
  Scenario: Filter assets by assessment
    Given I am on the asset picker
    When I select "Standard" from the "Assessment" filter
    Then I should only see assets with assessment "Standard"

  @filter
  Scenario: Filter assets by subject ID
    Given I am on the asset picker
    When I select "20308" from the "Subject" filter
    Then I should only see assets for subject "20308"

  @filter
  Scenario: Filter assets by date range
    Given I am on the asset picker
    When I set the "From" date to "2024-01-20"
    And I set the "To" date to "2024-02-01"
    Then I should only see assets with visit dates in that range

  @filter
  Scenario: Combine multiple filters
    Given I am on the asset picker
    When I select "Standard" from the "Assessment" filter
    And I select "20308" from the "Subject" filter
    Then I should only see assets matching both filters

  @filter
  Scenario: Clear all filters
    Given I have active filters applied
    When I click "Clear Filters"
    Then all filters should be reset
    And I should see all available assets

  # --- Sorting Assets ---

  @sort
  Scenario Outline: Sort assets
    Given I am on the asset picker
    When I sort by "<field>" in "<direction>" order
    Then the assets should be ordered by <field> <direction>

    Examples:
      | field      | direction  |
      | name       | ascending  |
      | name       | descending |
      | created_at | ascending  |
      | created_at | descending |
      | file_size  | ascending  |
      | file_size  | descending |
      | duration   | ascending  |
      | duration   | descending |

  # --- Selecting Assets ---

  @select
  Scenario: Select a single asset via checkbox
    Given I am on the asset picker
    When I click the checkbox on "WR42221-366044-Subject 20308 Refill Week 36.mp4"
    Then the asset should be visually selected
    And the "Select" button should show "Select 1 Asset"

  @select @multi
  Scenario: Select multiple assets
    Given I am on the asset picker
    When I select the following assets:
      | Name                                              |
      | WR42221-366044-Subject 20308 Refill Week 36.mp4   |
      | WR42221-366044-Subject 20309 Baseline Week 0.mp4  |
      | WR42221-366044-Subject 20310 Visit Week 12.mp4    |
    Then all 3 assets should be visually selected
    And the "Select" button should show "Select 3 Assets"

  @select @deselect
  Scenario: Deselect an asset
    Given I have selected 3 assets
    When I click the checkbox on an already selected asset
    Then the asset should be deselected
    And the "Select" button should show "Select 2 Assets"

  @select @confirm
  Scenario: Confirm asset selection
    Given I have selected 2 assets
    When I click the "Select 2 Assets" button
    Then the assets should be added to the task inputs
    And I should be redirected to the task detail page

  # --- Navigation ---

  @navigation
  Scenario: Navigate back to task details
    Given I am on the asset picker in step 2
    When I click the "Back" button
    Then I should return to step 1 (task details)
    And my previously entered details should be preserved

  @select @empty
  Scenario: Cannot confirm with no assets selected
    Given I am on the asset picker
    And no assets are selected
    Then the "Select" button should be disabled
