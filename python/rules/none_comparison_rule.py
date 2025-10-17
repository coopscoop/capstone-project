"""
None Comparison Rule
Enforces using 'is' and 'is not' for None comparisons
instead of '==' and '!='.

Warn the user about safer coding practice.
"""

import ast
from .base_rule import BaseRule


class NoneComparisonRule(BaseRule):
    """Checks that None is compared using 'is' or 'is not'"""
    
    RULE_ID = "none-comparison"
    
    def check(self, tree: ast.AST, code_lines: list):
        """Check for incorrect None comparisons"""
        self.visit(tree)
    
    def visit_Compare(self, node: ast.Compare):
        """Check comparison operations"""
        # Check if we're comparing with None using == or !=
        if len(node.ops) == 1 and isinstance(node.ops[0], (ast.Eq, ast.NotEq)):
            # Check left side
            if self._is_none(node.left):
                self._report_issue(node, node.ops[0])
            
            # Check comparators
            for comparator in node.comparators:
                if self._is_none(comparator):
                    self._report_issue(node, node.ops[0])
        
        self.generic_visit(node)
    
    def _is_none(self, node: ast.AST) -> bool:
        """Check if a node is None constant"""
        return isinstance(node, ast.Constant) and node.value is None
    
    def _report_issue(self, node: ast.Compare, op: ast.AST):
        """Report the comparison issue"""
        if isinstance(op, ast.Eq):
            suggestion = "is"
            current = "=="
        else:  # ast.NotEq
            suggestion = "is not"
            current = "!="
        
        self.add_issue(
            "warning",
            f"Use '{suggestion}' instead of '{current}' when comparing with None. "
            f"Identity checks (is/is not) are the correct way to check for None.",
            node
        )