"""
Base class for all linting rules.
Each rule should inherit from BaseRule and implement the check method.
"""

import ast
from dataclasses import dataclass
from typing import List
from abc import ABC, abstractmethod


@dataclass
class LintIssue:
    """Represents a single linting issue"""
    severity: str  # "error", "warning", or "info"?
    message: str
    line: int
    column: int
    rule_id: str


class BaseRule(ABC, ast.NodeVisitor):
    """
    Base class for all linting rules.
    
    Each rule should:
    1. Inherit from BaseRule
    2. Define a unique RULE_ID class variable
    3. Implement check() method to visit AST nodes
    4. Use add_issue() to report problems
    
    Example:
        class MyCustomRule(BaseRule):
            RULE_ID = "my-custom-rule"
            
            def check(self, tree, code_lines):
                self.visit(tree)
            
            def visit_FunctionDef(self, node):
                if some_condition:
                    self.add_issue("warning", "Message", node)
                self.generic_visit(node)
    """
    
    RULE_ID: str = "base-rule"  # Override in subclass to be the ID that gets returned
    
    def __init__(self, code: str):
        self.code = code
        self.lines = code.splitlines()
        self.issues: List[LintIssue] = []
    
    def add_issue(
        self, 
        severity: str, 
        message: str, 
        node: ast.AST,
        rule_id: str = None
    ):
        """
        Add a linting issue.
        
        Args:
            severity: "error", "warning", or "info"
            message: Some description of the issue
            node: The AST node where the issue was found
            rule_id: Optional override for the rule ID
        """
        self.issues.append(LintIssue(
            severity=severity,
            message=message,
            line=node.lineno,
            column=node.col_offset,
            rule_id=rule_id or self.RULE_ID
        ))
    
    @abstractmethod
    def check(self, tree: ast.AST, code_lines: List[str]):
        """
        Main entry point for the rule.
        Should visit the AST and report issues.
        
        Args:
            tree: Parsed AST of the code
            code_lines: List of code lines for context
        """
        pass
    
    def get_issues(self) -> List[LintIssue]:
        """Returns all issues found by this rule"""
        return self.issues