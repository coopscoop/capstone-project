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

Example rule:
    class MyCustomRule(BaseRule):
        RULE_ID = "my-custom-rule"
        
        def check(self, tree, code_lines):
            self.visit(tree)
        
        def visit_FunctionDef(self, node):
            # Your logic here
            if some_condition:
                self.add_issue("warning", "Message", node)
            self.generic_visit(node)
"""

from .base_rule import BaseRule, LintIssue
from .naming_convention_rule import NamingConventionRule
from .missing_docstring_rule import MissingDocstringRule
from .too_many_args_rule import TooManyArgsRule
from .discouraged_import_rule import DiscouragedImportRule
from .use_logging_rule import UseLoggingRule
from .none_comparison_rule import NoneComparisonRule
from .unused_function_rule import UnusedFunctionRule

# Registry of all available rules
# Add new rules here to make them available to the linter
ALL_RULES = [
    NamingConventionRule,
    MissingDocstringRule,
    TooManyArgsRule,
    DiscouragedImportRule,
    # UseLoggingRule,
    NoneComparisonRule,
    UnusedFunctionRule,
]

__all__ = [
    'BaseRule',
    'LintIssue',
    'ALL_RULES',
    'RULES_BY_ID',
    'NamingConventionRule',
    'MissingDocstringRule',
    'TooManyArgsRule',
    'DiscouragedImportRule',
    # 'UseLoggingRule', # disabled because its not particularly practical
    'NoneComparisonRule',
    'UnusedFuncitonRule',
]