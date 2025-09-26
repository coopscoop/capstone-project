import ast
import json
import sys

code = sys.stdin.read()
tree = ast.parse(code)

functions = []
wildcard_imports = []

for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef):
        functions.append({"Name": node.name, "Line": node.lineno})
    elif isinstance(node, ast.ImportFrom):
        if node.names[0].name == "*" and node.module:
            wildcard_imports.append({"Module": node.module, "Line": node.lineno})

ast_info = {"Functions": functions, "WildcardImports": wildcard_imports}

print(json.dumps(ast_info))
