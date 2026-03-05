@correlation @reporting
Feature: Correlation Tracking
  As a video services operator or administrator
  I need to track the relationship between source and output assets
  So that reporting can link processed videos to their originals

  Background:
    Given I am logged in with "vs:correlations:read" permission

  # --- Correlation Creation ---

  @create
  Scenario: Correlation created on task completion
    Given a task is completed with:
      | Source Asset | SUB001_VHOT_V3_20250527.mp4 |
      | Source Site  | Main Collection Site        |
      | Output Site  | Reviewer Site Alpha         |
    Then a correlation record should exist with:
      | Field           | Value                       |
      | source_asset_id | <id of source asset>        |
      | source_site_id  | <id of Main Collection>     |
      | output_asset_id | <id of new asset>           |
      | output_site_id  | <id of Reviewer Site Alpha> |
      | task_id         | <id of completed task>      |
      | processed_by    | <id of completing user>     |

  @create @distribute
  Scenario: Correlations share job_id for Distribute workflow
    Given a Distribute task is completed with 3 destinations
    Then 3 correlation records should be created
    And all 3 records should have the same job_id
    And each record should have a different output_site_id

  @create @combine
  Scenario: Correlations share job_id for Combine workflow
    Given a Combine task is completed with 3 input assets
    Then 3 correlation records should be created
    And all 3 records should have the same job_id
    And each record should have a different source_asset_id
    And all records should have the same output_asset_id

  @create @fields
  Scenario: Fields copied recorded in correlation
    Given a task is completed
    And the destination had field mapping "Include: subject_id, assessment_type"
    Then the correlation record should have fields_copied containing:
      | subject_id      |
      | assessment_type |

  # --- Querying Correlations ---

  @query
  Scenario: Query correlations by task
    Given multiple correlations exist for different tasks
    When I query correlations for task "SUB001 Visit 3 Redaction"
    Then I should only see correlations for that task

  @query
  Scenario: Query correlations by job_id
    Given a Distribute task created correlations with job_id "job-abc-123"
    When I query correlations for job_id "job-abc-123"
    Then I should see all correlations from that completion

  @query
  Scenario: Query correlations by date range
    Given correlations exist from various dates
    When I query correlations between "2025-05-01" and "2025-05-31"
    Then I should only see correlations processed in that date range

  @query
  Scenario: Query correlations by workflow
    Given correlations exist for different workflows
    When I query correlations for workflow "Scholar Rock VHOT Redaction"
    Then I should only see correlations from tasks using that workflow
