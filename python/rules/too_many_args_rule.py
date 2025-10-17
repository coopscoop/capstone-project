"""
Too Many Arguments Rule
Warns when functions have too many parameters.
"""

import ast
from .base_rule import BaseRule

class TooManyArgsRule(BaseRule):
    """Checks for functions with too many arguments"""
    
    RULE_ID = "too-many-args"
    MAX_ARGS = 5  # Configurable threshold
    
    def __init__(self, code: str, max_args: int = 5):
        super().__init__(code)
        self.max_args = max_args
    
    def check(self, tree: ast.AST, code_lines: list):
        """Check for functions with too many arguments"""
        self.visit(tree)
    
    def visit_FunctionDef(self, node: ast.FunctionDef):
        """Check function argument count"""
        arg_count = len(node.args.args)
        
        # Subtract 1 if it's a method (has 'self' or 'cls')
        if arg_count > 0:
            first_arg = node.args.args[0].arg
            if first_arg in ('self', 'cls'):
                arg_count -= 1
        
        if arg_count > self.max_args:
            self.add_issue(
                "warning",
                f"Function '{node.name}' has {arg_count} arguments "
                f"(max recommended: {self.max_args}). "
                f"Consider breaking it into smaller functions.",
                node
            )
        
        self.generic_visit(node)
    
    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        """Check async function argument count"""
        arg_count = len(node.args.args)
        
        if arg_count > 0:
            first_arg = node.args.args[0].arg
            if first_arg in ('self', 'cls'):
                arg_count -= 1
        
        if arg_count > self.max_args:
            self.add_issue(
                "warning",
                f"Async function '{node.name}' has {arg_count} arguments "
                f"(max recommended: {self.max_args})",
                node
            )
        
        self.generic_visit(node)