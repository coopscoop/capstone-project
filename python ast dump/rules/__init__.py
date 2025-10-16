"""
Linting Rules Package

This package contains all linting rules for the Python REPL.
Each rule is a separate module that implements BaseRule.

To add a new rule:
1. Create a new file in this directory (e.g., my_custom_rule.py)
2. Import BaseRule: from .base_rule import BaseRule
3. Create a class that inherits from BaseRule
4. Set a unique RULE_ID class variable
5. Implement the check() method
6. Add your rule to ALL_RULES below

Template for adding more rules:
    class MyCustomRule(BaseRule):
        RULE_ID = "my-rule"
        
        def check(self, tree, code_lines):
            self.visit(tree)
        
        def visit_FunctionDef(self, node):
            # Your logic here
            if some_condition:
                self.add_issue("warning", "Message", node)
            self.generic_visit(node)
"""

from .naming_convention_rule import NamingConventionRule

# Add new rules here to be used when "all rules" are linted
ALL_RULES = [
    NamingConventionRule,
]

# Map rule IDs to rule classes for easy lookup
RULES_BY_ID = {
    rule.RULE_ID: rule for rule in ALL_RULES
}

__all__ = [
    'NamingConventionRule',
]