# Capstone Project TODO

## Backend Templating

### Completed

-   [x] Created backend directory with .NET WebAPI project
-   [x] Added IronPython references in csproj
-   [x] Placed IronPython DLLs in lib/ folder
-   [x] Created Linter folder with modular structure
-   [x] Defined ILinterRule interface for rules
-   [x] Created LintIssue class for issues
-   [x] Implemented PythonLinter class using IronPython for AST parsing
-   [x] Created Rules folder with sample UnusedVariableRule (placeholder)
-   [x] Created LintController for API endpoint /api/lint
-   [x] Updated Program.cs to include controllers
-   [x] Added test request in CapstoneBackend.http for lint endpoint
-   [x] Verified project builds successfully
-   [x] Verified project runs (server starts on localhost:5210)

### Pending

-   [ ] Implement actual AST traversal in rules (currently placeholder)
-   [ ] Add more rules in Rules folder (e.g., NoPrintRule, etc.)
-   [ ] Improve error handling and logging
-   [ ] Add dependency injection for linter and rules
-   [ ] Test the API with sample Python code (manually via .http file or curl)
-   [ ] Integrate with frontend (once created)

## Frontend

-   [x] Set up React project
-   [x] Implement code editor with Monaco
-   [x] Connect to backend lint API
-   [x] Add proxy configuration for development

## Tests

-   [ ] Set up xUnit tests for linter rules
-   [ ] Add integration tests for API
