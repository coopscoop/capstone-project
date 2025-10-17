"""
Use Logging Rule
Suggests using the logging module instead of print statements
for production code.

One of the first rules I implemented to understand the syntax of finding certain sections of the file.
Realistically will be disabled in `__init__.py`
"""

import ast
from .base_rule import BaseRule


class UseLoggingRule(BaseRule):
    """Suggests using logging instead of print statements"""
    
    RULE_ID = "use-logging"
    
    def check(self, tree: ast.AST, code_lines: list):
        """Check for print statements"""
        self.visit(tree)
    
    def visit_Call(self, node: ast.Call):
        """Check for print() calls"""
        # Check if this is a call to 'print'
        if isinstance(node.func, ast.Name) and node.func.id == 'print':
            self.add_issue(
                "info",
                "Consider using the logging module instead of print() "
                "for production code. This allows better control over "
                "log levels and output destinations.",
                node
            )
        
        self.generic_visit(node)