"""
Missing Docstring Rule
Checks that public functions and classes have docstrings.
"""

import ast
from .base_rule import BaseRule


class MissingDocstringRule(BaseRule):
    """Checks that public functions and classes have docstrings"""
    
    RULE_ID = "missing-docstring"
    
    def check(self, tree: ast.AST, code_lines: list):
        """Check for missing docstrings"""
        self.visit(tree)
    
    def visit_FunctionDef(self, node: ast.FunctionDef):
        """Check if function has a docstring"""
        # Skip private functions (start with _)
        if node.name.startswith('_'):
            self.generic_visit(node)
            return
        
        # Check for docstring
        docstring = ast.get_docstring(node)
        if docstring is None:
            self.add_issue(
                "info",
                f"Function '{node.name}' is missing a docstring",
                node
            )
        
        self.generic_visit(node)
    
    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        """Check if async function has a docstring"""
        if not node.name.startswith('_'):
            docstring = ast.get_docstring(node)
            if docstring is None:
                self.add_issue(
                    "info",
                    f"Async function '{node.name}' is missing a docstring",
                    node
                )
        self.generic_visit(node)
    
    def visit_ClassDef(self, node: ast.ClassDef):
        """Check if class has a docstring"""
        # Skip private classes
        if node.name.startswith('_'):
            self.generic_visit(node)
            return
        
        docstring = ast.get_docstring(node)
        if docstring is None:
            self.add_issue(
                "info",
                f"Class '{node.name}' is missing a docstring",
                node
            )
        
        self.generic_visit(node)