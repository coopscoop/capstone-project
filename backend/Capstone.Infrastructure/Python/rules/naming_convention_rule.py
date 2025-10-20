"""
Naming Convention Rule
Enforces Python naming conventions:
- Functions and variables: snake_case
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
"""

import ast
from .base_rule import BaseRule

class NamingConventionRule(BaseRule):
    """Checks that names follow Python naming conventions"""
    
    RULE_ID = "naming-convention"
    
    def check(self, tree: ast.AST, code_lines: list):
        """Check naming conventions throughout the code"""
        self.visit(tree)
    
    def visit_FunctionDef(self, node: ast.FunctionDef):
        """Check function names are snake_case"""
        # Skip magic methods and private methods
        if node.name.startswith('__') and node.name.endswith('__'):
            self.generic_visit(node)
            return
        
        # Check for camelCase or PascalCase
        if not self._is_snake_case(node.name):
            self.add_issue(
                "warning",
                f"Function '{node.name}' should use snake_case naming convention",
                node
            )
        
        self.generic_visit(node)
    
    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        """Check async function names"""
        if not node.name.startswith('__') and not self._is_snake_case(node.name):
            self.add_issue(
                "warning",
                f"Async function '{node.name}' should use snake_case naming convention",
                node
            )
        self.generic_visit(node)
    
    def visit_ClassDef(self, node: ast.ClassDef):
        """Check class names are PascalCase"""
        if not self._is_pascal_case(node.name):
            self.add_issue(
                "warning",
                f"Class '{node.name}' should use PascalCase naming convention",
                node
            )
        self.generic_visit(node)
    
    def visit_Assign(self, node: ast.Assign):
        """Check variable names (only module-level constants)"""
        # Check if this is a module-level assignment
        if isinstance(node.targets[0], ast.Name):
            name = node.targets[0].id
            
            # If all uppercase, should be a constant
            if name.isupper() and '_' in name:
                # This is good - it's a constant
                pass
            elif name.isupper() and len(name) > 1:
                # All caps but no underscore - might want underscores
                self.add_issue(
                    "info",
                    f"Constant '{name}' should use UPPER_SNAKE_CASE (with underscores)",
                    node
                )
        
        self.generic_visit(node)
    
    @staticmethod
    def _is_snake_case(name: str) -> bool:
        """Check if a name is valid snake_case"""
        if not name:
            return False
        
        # Should be all lowercase with optional underscores
        # Allow leading underscore for private
        name = name.lstrip('_')
        
        if not name:
            return True
        
        # Check if it's all lowercase letters, numbers, and underscores
        # Dumb but it works
        return name.replace('_', '').islower() and name.replace('_', '').replace('0', '').replace('1', '').replace('2', '').replace('3', '').replace('4', '').replace('5', '').replace('6', '').replace('7', '').replace('8', '').replace('9', '').isalpha()
    
    @staticmethod
    def _is_pascal_case(name: str) -> bool:
        """Check if a name is valid PascalCase"""
        if not name:
            return False
        
        # First character should be uppercase
        if not name[0].isupper():
            return False
        
        # Should not have underscores (except for private classes)
        if name.startswith('_'):
            name = name.lstrip('_')
        
        # Check that it doesn't have underscores
        if '_' in name:
            return False
        
        return True