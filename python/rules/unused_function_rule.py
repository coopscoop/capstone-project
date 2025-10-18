"""
Unused Function Rule
Detects functions that are defined but never called.
"""

import ast
from .base_rule import BaseRule


class UnusedFunctionRule(BaseRule):
    """Checks for functions that are defined but never called"""
    
    RULE_ID = "unused-function"
    
    def __init__(self, code: str):
        super().__init__(code)
        self.defined_functions = {}  # {name: node}
        self.called_functions = set()
        self.in_class = False
    
    def check(self, tree: ast.AST, code_lines: list):
        """Check for unused functions"""
        # First pass: collect all function definitions and calls
        self.visit(tree)
        
        # Report functions that were defined but never called
        for func_name, node in self.defined_functions.items():
            if func_name not in self.called_functions:
                self.add_issue(
                    "info",
                    f"Function '{func_name}' is defined but never called. "
                    f"Consider removing it if it's not needed.",
                    node
                )
    
    def visit_FunctionDef(self, node: ast.FunctionDef):
        """Track function definitions"""
        # Skip private functions (they might be internal)
        if node.name.startswith('_') and not node.name.startswith('__'):
            self.generic_visit(node)
            return
        
        # Skip magic methods
        if node.name.startswith('__') and node.name.endswith('__'):
            self.generic_visit(node)
            return
        
        # Skip if we're inside a class (methods are different)
        if not self.in_class:
            self.defined_functions[node.name] = node
        
        # Visit function body to find calls within
        for stmt in node.body:
            self.visit(stmt)
    
    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        """Track async function definitions"""
        if node.name.startswith('_'):
            self.generic_visit(node)
            return
        
        if not self.in_class:
            self.defined_functions[node.name] = node
        
        for stmt in node.body:
            self.visit(stmt)
    
    def visit_ClassDef(self, node: ast.ClassDef):
        """Track class scope"""
        # Mark that we're in a class
        old_in_class = self.in_class
        self.in_class = True
        
        # Visit class body
        self.generic_visit(node)
        
        # Restore class state
        self.in_class = old_in_class
    
    def visit_Call(self, node: ast.Call):
        """Track function calls"""
        # Check if it's a direct function call
        if isinstance(node.func, ast.Name):
            self.called_functions.add(node.func.id)
        
        # Check for method calls (obj.method())
        elif isinstance(node.func, ast.Attribute):
            self.called_functions.add(node.func.attr)
        
        # Continue visiting to find nested calls
        self.generic_visit(node)
    
    def visit_Name(self, node: ast.Name):
        """Track function references (not just calls)"""
        # If a function is referenced (passed as argument, assigned, etc.)
        # it's considered "used"
        if isinstance(node.ctx, ast.Load):
            if node.id in self.defined_functions:
                self.called_functions.add(node.id)
        self.generic_visit(node)
    
    def visit_Attribute(self, node: ast.Attribute):
        """Track attribute access (might be a function reference)"""
        # If someone accesses a function as an attribute, it's used
        if node.attr in self.defined_functions:
            self.called_functions.add(node.attr)
        self.generic_visit(node)