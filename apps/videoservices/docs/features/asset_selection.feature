@normal-mode @assets
Feature: Asset Selection
  As a video services operator
  I need to select input assets for my task
  So that I know which videos to process

  Background:
    Given I am logged in as an operator
    And I am a member of task "SUB001 Visit 3 Redaction"
    And the task uses workflow "Scholar Rock VHOT Redaction"
    And the workflow source site is "Main Collection Site"

  # --- Browsing Assets ---

  @browse
  Scenario: Browse assets from source site
    Given the task status is "Created"
    When I click "Select Assets"
    Then I should see the asset browser modal
    And I should see assets from "Main Collection Site"
    And I should see asset details including name, duration, and size

  @browse @search
  Scenario: Search for assets
    Given I am on the asset browser modal
    And the following assets exist:
      | Name                           |
      | SUB001_VHOT_V1_20250501.mp4    |
      | SUB001_VHOT_V2_20250515.mp4    |
      | SUB002_VHOT_V1_20250503.mp4    |
    When I search for "SUB001"
    Then I should see "SUB001_VHOT_V1_20250501.mp4"
    And I should see "SUB001_VHOT_V2_20250515.mp4"
    And I should not see "SUB002_VHOT_V1_20250503.mp4"

  # --- Selecting Assets (Transform/Distribute) ---

  @select @transform
  Scenario: Select a single asset for Transform workflow
    Given the workflow type is "Transform"
    And I am on the asset browser modal
    When I select "SUB001_VHOT_V3_20250527.mp4"
    And I click "Confirm Selection"
    Then the asset should be added to the task inputs
    And the task status should change to "Assets Selected"

  @select @distribute
  Scenario: Select a single asset for Distribute workflow
    Given the workflow type is "Distribute"
    And I am on the asset browser modal
    When I select "SUB001_VHOT_V3_20250527.mp4"
    And I click "Confirm Selection"
    Then the asset should be added to the task inputs
    And the task status should change to "Assets Selected"

  # --- Selecting Assets (Combine) ---

  @select @combine
  Scenario: Select multiple assets for Combine workflow
    Given the workflow type is "Combine"
    And I am on the asset browser modal
    When I select the following assets in order:
      | Name                           |
      | SUB001_VHOT_V1_20250501.mp4    |
      | SUB001_VHOT_V2_20250515.mp4    |
      | SUB001_VHOT_V3_20250527.mp4    |
    And I click "Confirm Selection"
    Then all 3 assets should be added to the task inputs
    And the assets should maintain their selection order
    And the task status should change to "Assets Selected"

  @select @combine @reorder
  Scenario: Reorder selected assets for Combine workflow
    Given the workflow type is "Combine"
    And I have selected multiple assets
    When I reorder the assets by dragging
    Then the new order should be preserved
    And the sequence order should be updated

  # --- Changing Selection ---

  @change
  Scenario: Change selected assets
    Given the task has an asset selected
    And the task status is "Assets Selected"
    When I click "Select Assets"
    And I deselect the current asset
    And I select a different asset
    And I click "Confirm Selection"
    Then the task inputs should be updated
    And only the new asset should be in the task inputs

  @change
  Scenario: Remove all assets returns task to Created status
    Given the task has assets selected
    And the task status is "Assets Selected"
    When I remove all input assets
    Then the task status should change to "Created"

  # --- Asset Download ---

  @download
  Scenario: Download selected asset
    Given the task has asset "SUB001_VHOT_V3_20250527.mp4" selected
    When I click "Download" on the asset
    Then a secure download URL should be generated
    And the file download should start

  @download @combine
  Scenario: Download multiple assets for Combine workflow
    Given the workflow type is "Combine"
    And the task has 3 assets selected
    When I click "Download" on each asset
    Then I should be able to download all 3 assets
