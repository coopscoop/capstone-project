import { useState, useEffect, useCallback, useRef } from "react";
import { apiRequest } from "@/utils/api";
import type {
  CodeExecutionResult,
  CodeExecutionRequest,
  LintResult,
  CodeError,
} from "@/types";

export const useCodeExecution = () => {
  const [executionResult, setExecutionResult] =
    useState<CodeExecutionResult | null>(null);
  const [lintResult, setLintResult] = useState<LintResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLinting, setIsLinting] = useState(false);
  const [executionError, setExecutionError] = useState<string>("");
  const [lintError, setLintError] = useState<string>("");

  const lintTimeoutRef = useRef<number>(1000);
  const lastLintCodeRef = useRef<string>("");

  // Debounced lint function that runs every second
  const lintCode = useCallback(async (code: string) => {
    if (!code.trim() || code === lastLintCodeRef.current) {
      return;
    }

    lastLintCodeRef.current = code;
    setIsLinting(true);
    setLintError("");

    try {
      const response = await apiRequest("/code/lint", {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result: LintResult = await response.json();
        setLintResult(result);
      } else {
        const errorData = await response.json();
        setLintError(errorData.error || "Failed to lint code");
      }
    } catch (err) {
      setLintError(err instanceof Error ? err.message : "Failed to lint code");
    } finally {
      setIsLinting(false);
    }
  }, []);

  // Setup lint interval
  const startLintInterval = useCallback(
    (code: string) => {
      // Clear any existing interval
      if (lintTimeoutRef.current) {
        window.clearInterval(lintTimeoutRef.current);
      }

      // Initial lint
      lintCode(code);

      // Set up interval for linting every second
      lintTimeoutRef.current = window.setInterval(() => {
        lintCode(code);
      }, 1000);
    },
    [lintCode]
  );

  // Stop lint interval
  const stopLintInterval = useCallback(() => {
    if (lintTimeoutRef.current) {
      window.clearInterval(lintTimeoutRef.current);
      lintTimeoutRef.current = 0;
    }
    lastLintCodeRef.current = "";
  }, []);

  // Execute code
  const executeCode = useCallback(
    async (request: CodeExecutionRequest): Promise<CodeExecutionResult> => {
      setIsExecuting(true);
      setExecutionError("");
      setExecutionResult(null);

      try {
        const response = await apiRequest("/code/execute", {
          method: "POST",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result: CodeExecutionResult = await response.json();
          setExecutionResult(result);
          return result;
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.error || "Failed to execute code";
          setExecutionError(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to execute code";
        setExecutionError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsExecuting(false);
      }
    },
    []
  );

  const parseError = (errorString: string): CodeError => {
    const result: CodeError = {
      error: errorString,
      line: 0,
    };

    if (!errorString) return result;

    // Extract the error from the last line of the output
    const lines = errorString.split("\n").filter((line) => line.trim());
    const lastLine = lines[lines.length - 1];
    if (
      lastLine &&
      !lastLine.includes("Traceback") &&
      !lastLine.includes("File")
    ) {
      result.error = lastLine.trim();
    }

    // Extract line number from "<string>" file - this is the actual line number from the code we've executed
    const stringLineMatch = errorString.match(/"<string>", line (\d+)/);
    if (stringLineMatch) {
      result.line = parseInt(stringLineMatch[1], 10);
    }
    return result;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lintTimeoutRef.current) {
        window.clearInterval(lintTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Execution
    executeCode,
    executionResult,
    isExecuting,
    executionError,

    // Linting
    startLintInterval,
    stopLintInterval,
    lintResult,
    isLinting,
    lintError,

    // Error parsing
    parseError,

    // State management
    clearResults: useCallback(() => {
      setExecutionResult(null);
      setLintResult(null);
      setExecutionError("");
      setLintError("");
    }, []),
  };
};
