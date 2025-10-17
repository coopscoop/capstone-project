"""
Main Linter Module

This module runs the linting process by:
1. Parsing Python code into an AST
2. Running all enabled rules against the AST
3. Collecting and returning all issues found
"""

import ast
from typing import List, Dict, Any, Optional
from dataclasses import asdict

from rules import ALL_RULES, LintIssue


class Linter:
    """
    Main linter class that runs rules against Python code.
    
    Usage:
        linter = Linter()
        result = linter.lint(code)
        print(result['issues'])
    """
    
    def __init__(self, enabled_rules: Optional[List[str]] = None):
        """
        Initialize the linter.
        
        Args:
            enabled_rules: List of rule IDs to enable. If None, all rules are enabled.
        """
        self.enabled_rules = set(enabled_rules) if enabled_rules else None
    
    def lint(self, code: str) -> Dict[str, Any]:
        """
        Lint Python code and return all issues found.
        
        Args:
            code: Python source code as a string
            
        Returns:
            Dictionary with:
                - is_valid: bool (True if no errors found)
                - issues: List of issue dictionaries
        """
        issues: List[LintIssue] = []
        
        # First, try to parse the code
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            # If there's a syntax error, return it immediately
            return {
                "is_valid": False,
                "issues": [{
                    "severity": "error",
                    "message": f"Syntax error: {e.msg}",
                    "line": e.lineno or 0,
                    "column": e.offset or 0,
                    "rule_id": "syntax-error"
                }]
            }
        except Exception as e:
            return {
                "is_valid": False,
                "issues": [{
                    "severity": "error",
                    "message": f"Parse error: {str(e)}",
                    "line": 0,
                    "column": 0,
                    "rule_id": "parse-error"
                }]
            }
        
        # Run each enabled rule
        code_lines = code.splitlines()
        
        for rule_class in ALL_RULES:
            # Skip if rule is not enabled
            if self.enabled_rules is not None and rule_class.RULE_ID not in self.enabled_rules:
                continue
            
            try:
                # Instantiate and run the rule
                rule = rule_class(code)
                rule.check(tree, code_lines)
                issues.extend(rule.get_issues())
            except Exception as e:
                # If a rule crashes, report it but continue with other rules
                issues.append(LintIssue(
                    severity="error",
                    message=f"Rule '{rule_class.RULE_ID}' crashed: {str(e)}",
                    line=0,
                    column=0,
                    rule_id=f"{rule_class.RULE_ID}-crash"
                ))
        
        # Determine if code is valid (no errors, only warnings/info)
        has_errors = any(issue.severity == "error" for issue in issues)
        
        return {
            "is_valid": not has_errors,
            "issues": [asdict(issue) for issue in issues]
        }
    
    def get_available_rules(self) -> List[Dict[str, str]]:
        """
        Get list of all available rules.
        
        Returns:
            List of dictionaries with rule_id and description
        """
        return [
            {
                "rule_id": rule.RULE_ID,
                "name": rule.__name__,
                "description": rule.__doc__.strip() if rule.__doc__ else "No description"
            }
            for rule in ALL_RULES
        ]


def lint_code(code: str, enabled_rules: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Convenience function to lint code.
    
    Args:
        code: Python source code as a string
        enabled_rules: Optional list of rule IDs to enable
        
    Returns:
        Dictionary with is_valid and issues
    """
    linter = Linter(enabled_rules)
    return linter.lint(code)