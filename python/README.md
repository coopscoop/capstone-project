## code should follow this structure:

```bash
Python/
├── python_worker.py                   ← Main entry point
├── linter.py                          ← Linter brain
└── rules/                             ← Rules storage
    ├── __init__.py                    ← Registers all rules
    ├── base_rule.py                   ← Base class
    ├── naming_convention_rule.py      ← Rule 1
    └── next_rule.py                   ← Rule x
```

## Running locally/testing
Uses json input/output to simplify convorsation between .NET and the eventual front end. 
Can simply pass the json object through to the user and use it in the front end.

To run this service locally:
```bash
cd 'python'
python python_worker.py
```

you should see:
```json
{"status": "ready"}
```

## Using it
To use it you can give it one of three json action inputs:

### Execute
```json
{"action": "execute", "code": "...", "timeout": 5}
```
- action: execute means it runs the code
- code: what code to run
- timeout: if for whatever reason the code doesn't finish in the timeout, let the user know it was cancelled. Stops some abuse of the service

Will return something similar to:

```json
{"success": bool, "output": str, "error": str}
```
- success: if it ran fully, false if it errored/timed out
- output: the console output of the program
- error: any errors that occured

Example input and output:
```json
// input
{"action": "execute", "code": "for i in range(3): print(i)"}
```
```json
// output
{"success": true, "output": "0\n1\n2\n", "error": ""}
```

### Linting
```json
{"action": "lint", "code": "...", "enabled_rules": [...]}
```

Will return something similar to:
```json
{"is_valid": bool, "issues": [...]}
```
- is_valid: does the code return with any errors, warnings/suggestions are allowed
- issues: an array of all the issues.

Example:
```json
// input
{"action": "lint", "code": "def myFunction(): pass"}
```
```json
// output
{"is_valid": true, "issues": [
    {
        "severity": "warning", 
        "message": "Function 'myFunction' should use snake_case naming convention", 
        "line": 1, 
        "column": 0, 
        "rule_id": "naming-convention"
    }, 
    {
        "severity": "info", 
        "message": "Function 'myFunction' is missing a docstring", 
        "line": 1, 
        "column": 0, 
        "rule_id": "missing-docstring"}]
    }
```
### Pong
Baseline test if things are working without requiring rules or executing anything to function

Pass in the action `ping` and you get pong back:
```json
// input
{"action": "ping"}
```
```json
// output
{"status": "ok", "message": "pong"}
```