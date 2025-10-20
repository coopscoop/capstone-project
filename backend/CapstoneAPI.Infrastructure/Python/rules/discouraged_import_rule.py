"""
Discouraged Import Rule
Warns about potentially unsafe or problematic imports.

Primarily here for determining unsafe imports once I get the user to be executing code in a container.
"""

import ast
from .base_rule import BaseRule

class DiscouragedImportRule(BaseRule):
    """Checks for imports that might be unsafe or problematic"""
    
    RULE_ID = "discouraged-import"
    
    # Modules/functions that are potentially dangerous
    UNSAFE_IMPORTS = {
        'eval', 'exec', 'compile',
        '__import__'
    }
    
    # Modules that require extra caution
    CAUTION_IMPORTS = {
        'subprocess': 'Use with caution - can execute shell commands',
        'os.system': 'Prefer subprocess module for better security',
        'pickle': 'Can execute arbitrary code - use json or safer alternatives',
        'shelve': 'Uses pickle internally - security concerns',
    }
    
    def check(self, tree: ast.AST, code_lines: list):
        """Check for discouraged imports"""
        self.visit(tree)
    
    def visit_Import(self, node: ast.Import):
        """Check regular imports"""
        for alias in node.names:
            self._check_import_name(alias.name, node)
        self.generic_visit(node)
    
    def visit_ImportFrom(self, node: ast.ImportFrom):
        """Check from...import statements"""
        if node.module:
            # Check the module being imported from
            full_module = node.module
            self._check_import_name(full_module, node)
            
            # Check specific imports
            for alias in node.names:
                if alias.name in self.UNSAFE_IMPORTS:
                    self.add_issue(
                        "error",
                        f"Importing '{alias.name}' is not allowed - "
                        f"this function can execute arbitrary code",
                        node
                    )
                
                full_name = f"{full_module}.{alias.name}"
                if full_name in self.CAUTION_IMPORTS:
                    self.add_issue(
                        "warning",
                        f"Import '{full_name}' requires caution: "
                        f"{self.CAUTION_IMPORTS[full_name]}",
                        node
                    )
        
        self.generic_visit(node)
    
    def _check_import_name(self, name: str, node: ast.AST):
        """Check a single import name"""
        if name in self.UNSAFE_IMPORTS:
            self.add_issue(
                "error",
                f"Importing '{name}' is not allowed",
                node
            )
        
        if name in self.CAUTION_IMPORTS:
            self.add_issue(
                "warning",
                f"Import '{name}' requires caution: {self.CAUTION_IMPORTS[name]}",
                node
            )