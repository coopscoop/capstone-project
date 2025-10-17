"""
Python Worker Script

This script is intended to be run as a service in the background of the .NET server
It receives commands via stdin (JSON lines) and sends responses via stdout (JSON lines).

Commands (input -> output):
    - {"action": "execute", "code": "...", "timeout": 5}        -> {"success": bool, "output": str, "error": str}
    - {"action": "lint", "code": "...", "enabled_rules": [...]} -> {"is_valid": bool, "issues": [...]}
    - {"action": "ping"}                                        -> {"status": "ok", "message": "pong"}
"""

import sys
import json
import io
import traceback
import signal
from contextlib import redirect_stdout, redirect_stderr
from typing import Dict, Any

# Import our linter
from linter import lint_code


def execute_code(code: str, timeout: int = 5) -> Dict[str, Any]:
    """
    Execute Python code safely with timeout.
    
    Args:
        code: Python source code to execute
        timeout: Maximum execution time in seconds
        
    Returns:
        Dictionary with success, output, and error fields
    """
    
    def timeout_handler(signum, frame):
        raise TimeoutError(f"Code execution exceeded {timeout} seconds")
    
    # Set up timeout (Unix only)
    try:
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(timeout)
    except AttributeError:
        # Windows doesn't support SIGALRM, skip timeout
        pass
    
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    try:
        # Create a restricted namespace for execution
        namespace = {
            '__builtins__': __builtins__,
            '__name__': '__main__',
        }
        
        # Capture stdout and stderr
        with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
            exec(code, namespace)
        
        # Cancel alarm
        try:
            signal.alarm(0)
        except AttributeError:
            pass
        
        return {
            "success": True,
            "output": stdout_capture.getvalue(),
            "error": stderr_capture.getvalue()
        }
    
    except TimeoutError as e:
        try:
            signal.alarm(0)
        except AttributeError:
            pass
        
        return {
            "success": False,
            "output": stdout_capture.getvalue(),
            "error": str(e)
        }
    
    except Exception as e:
        try:
            signal.alarm(0)
        except AttributeError:
            pass
        
        return {
            "success": False,
            "output": stdout_capture.getvalue(),
            "error": f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        }


def handle_lint_command(command: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle a lint command.
    
    Args:
        command: Dictionary with 'code' and optional 'enabled_rules'
        
    Returns:
        Linting result dictionary
    """
    code = command.get("code", "")
    enabled_rules = command.get("enabled_rules")
    
    return lint_code(code, enabled_rules)


def handle_execute_command(command: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle an execute command.
    
    Args:
        command: Dictionary with 'code' and optional 'timeout'
        
    Returns:
        Execution result dictionary
    """
    code = command.get("code", "")
    timeout = command.get("timeout", 5)
    
    return execute_code(code, timeout)


def handle_command(command: Dict[str, Any]) -> Dict[str, Any]:
    """
    Route command to appropriate handler.
    
    Args:
        command: Command dictionary with 'action' field
        
    Returns:
        Response dictionary
    """
    action = command.get("action")
    
    if action == "execute":
        return handle_execute_command(command)
    elif action == "lint":
        return handle_lint_command(command)
    elif action == "ping":
        return {"status": "ok", "message": "pong"}
    else:
        return {
            "error": f"Unknown action: {action}",
            "valid_actions": ["execute", "lint", "ping"]
        }


def main():
    """
    Main event loop.
    
    Reads JSON commands from stdin (one per line).
    Writes JSON responses to stdout (one per line).
    Logs errors to stderr.
    """
    try:
        # Signal that we're ready
        print(json.dumps({"status": "ready"}), flush=True)
        
        # Process commands line by line
        for line in sys.stdin:
            try:
                # Parse command
                line = line.strip()
                if not line:
                    continue
                
                command = json.loads(line)
                
                # Handle command
                response = handle_command(command)
                
                # Send response
                print(json.dumps(response), flush=True)
            
            except json.JSONDecodeError as e:
                error_response = {
                    "error": f"Invalid JSON: {str(e)}",
                    "received": line[:100] if len(line) > 100 else line
                }
                print(json.dumps(error_response), flush=True)
            
            except Exception as e:
                error_response = {
                    "error": f"Unexpected error: {str(e)}",
                    "traceback": traceback.format_exc()
                }
                print(json.dumps(error_response), flush=True)
    
    except KeyboardInterrupt:
        # Graceful shutdown
        sys.stderr.write("Worker shutting down...\n")
        sys.stderr.flush()
    
    except Exception as e:
        sys.stderr.write(f"Fatal error: {str(e)}\n")
        sys.stderr.write(traceback.format_exc())
        sys.stderr.flush()
        sys.exit(1)


if __name__ == "__main__":
    main()