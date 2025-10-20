"""
Unused Variable Rule
Detects variables that are assigned but never used.
"""

import ast
from .base_rule import BaseRule


class UnusedVariableRule(BaseRule):
    """Checks for variables that are assigned but never used"""
    
    RULE_ID = "unused-variable"
    
    def __init__(self, code: str):
        super().__init__(code)
        self.assigned_vars = {}  # {name: node}
        self.used_vars = set()
        self.function_scope = []  # Track function scopes
    
    def check(self, tree: ast.AST, code_lines: list):
        """Check for unused variables"""
        # First pass: collect all assignments and uses
        self.visit(tree)
        
        # Report variables that were assigned but never used
        for var_name, node in self.assigned_vars.items():
            if var_name not in self.used_vars:
                # Skip special variables
                if var_name.startswith('_') and var_name != '_':
                    continue  # Private vars are ok to be unused
                
                self.add_issue(
                    "warning",
                    f"Variable '{var_name}' is assigned but never used",
                    node
                )
    
    # gotta check: functions, var assign, var augments, for loops, with statements, exception handlers
    # there's more but this covers 90% of the coverage with basic python

    def visit_FunctionDef(self, node: ast.FunctionDef):
        """Track function scope"""
        # Save current scope
        old_assigned = self.assigned_vars.copy()
        old_used = self.used_vars.copy()
        
        # Visit function body with new scope
        self.function_scope.append(node.name)
        
        # Add parameters to assigned variables
        for arg in node.args.args:
            self.assigned_vars[arg.arg] = arg
        
        # Visit function body
        for stmt in node.body:
            self.visit(stmt)
        
        # Restore scope
        self.function_scope.pop()
        self.assigned_vars = old_assigned
        self.used_vars = old_used
        
        # Don't call generic_visit - we handled it manually
    
    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        """Track async function scope"""
        old_assigned = self.assigned_vars.copy()
        old_used = self.used_vars.copy()
        
        self.function_scope.append(node.name)
        
        for arg in node.args.args:
            self.assigned_vars[arg.arg] = arg
        
        for stmt in node.body:
            self.visit(stmt)
        
        self.function_scope.pop()
        self.assigned_vars = old_assigned
        self.used_vars = old_used
    
    def visit_Assign(self, node: ast.Assign):
        """Track variable assignments"""
        # Track what's being assigned
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.assigned_vars[target.id] = target
            elif isinstance(target, ast.Tuple) or isinstance(target, ast.List):
                # Handle tuple unpacking: a, b = 1, 2
                for elt in target.elts:
                    if isinstance(elt, ast.Name):
                        self.assigned_vars[elt.id] = elt
        
        # Visit the value being assigned (might use other variables)
        self.visit(node.value)
    
    def visit_AugAssign(self, node: ast.AugAssign):
        """Track augmented assignments (+=, -=, etc.)"""
        if isinstance(node.target, ast.Name):
            # Augmented assignment both uses and assigns
            self.used_vars.add(node.target.id)
            self.assigned_vars[node.target.id] = node.target
        self.visit(node.value)
    
    def visit_AnnAssign(self, node: ast.AnnAssign):
        """Track annotated assignments (x: int = 5)"""
        if isinstance(node.target, ast.Name):
            if node.value:  # Only if there's an actual assignment
                self.assigned_vars[node.target.id] = node.target
        if node.value:
            self.visit(node.value)
    
    def visit_Name(self, node: ast.Name):
        """Track variable usage"""
        if isinstance(node.ctx, ast.Load):
            # Variable is being read/used
            self.used_vars.add(node.id)
        self.generic_visit(node)
    
    def visit_For(self, node: ast.For):
        """Handle for loop variables"""
        # Loop variable is assigned
        if isinstance(node.target, ast.Name):
            self.assigned_vars[node.target.id] = node.target
        
        # Visit the iterator (might use variables)
        self.visit(node.iter)
        
        # Visit loop body
        for stmt in node.body:
            self.visit(stmt)
        
        # Visit else clause if present
        for stmt in node.orelse:
            self.visit(stmt)
    
    def visit_With(self, node: ast.With):
        """Handle with statement variables"""
        for item in node.items:
            if item.optional_vars:
                if isinstance(item.optional_vars, ast.Name):
                    self.assigned_vars[item.optional_vars.id] = item.optional_vars
            self.visit(item.context_expr)
        
        for stmt in node.body:
            self.visit(stmt)
    
    def visit_ExceptHandler(self, node: ast.ExceptHandler):
        """Handle exception variables"""
        if node.name:
            self.assigned_vars[node.name] = node
        
        if node.type:
            self.visit(node.type)
        
        for stmt in node.body:
            self.visit(stmt)