@security @auth
Feature: Authentication and Authorization
  As a system administrator
  I need to control access to the workflow tool
  So that only authorized users can perform appropriate actions

  # --- Authentication ---

  @authentication
  Scenario: Login via Firebase
    Given I am not logged in
    When I navigate to the application
    Then I should be redirected to Firebase login
    When I authenticate successfully
    Then I should be redirected to the task dashboard

  @authentication @session
  Scenario: Session expiry
    Given I am logged in
    And my session has expired
    When I try to perform an action
    Then I should be redirected to Firebase login
    And I should be returned to my previous location after login

  # --- Admin Mode Access ---

  @authorization @admin
  Scenario: User with admin permission can access Admin Mode
    Given I am logged in
    And I have the "vs:admin" permission
    When I navigate to the workflow administration page
    Then I should see the workflow list
    And I should be able to create and edit workflows

  @authorization @admin @negative
  Scenario: User without admin permission cannot access Admin Mode
    Given I am logged in
    And I do not have the "vs:admin" permission
    When I try to navigate to the workflow administration page
    Then I should see an "Access Denied" message
    And I should not see any workflow configuration options

  # --- Normal Mode Access ---

  @authorization @operator
  Scenario: User with operator permissions can use Normal Mode
    Given I am logged in
    And I have the "vs:tasks:write" permission
    When I navigate to the task dashboard
    Then I should see my tasks
    And I should be able to create new tasks

  @authorization @membership
  Scenario: User can only see tasks they are members of
    Given I am logged in as "Stevie"
    And task "Task A" has "Stevie" as a member
    And task "Task B" does not have "Stevie" as a member
    When I view the task dashboard
    Then I should see "Task A"
    And I should not see "Task B"

  # --- Permission Checks ---

  @authorization @permissions
  Scenario Outline: Permission required for action
    Given I am logged in
    And I <have_permission> the "<permission>" permission
    When I try to <action>
    Then I <expected_result>

    Examples:
      | have_permission | permission          | action                    | expected_result              |
      | have            | vs:workflows:write  | create a workflow         | should succeed               |
      | do not have     | vs:workflows:write  | create a workflow         | should see Access Denied     |
      | have            | vs:tasks:write      | create a task             | should succeed               |
      | do not have     | vs:tasks:write      | create a task             | should see Access Denied     |
      | have            | vs:assets:browse    | browse source assets      | should see the asset list    |
      | do not have     | vs:assets:browse    | browse source assets      | should see Access Denied     |
      | have            | vs:assets:download  | download an asset         | should get download URL      |
      | do not have     | vs:assets:download  | download an asset         | should see Access Denied     |
