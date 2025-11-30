import { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { Play, Save, AlertCircle, AlertTriangle, Info, Check } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { postService, tagService } from "@/services";

const EditorPage = () => {
  const { currentProject, setCurrentProject, isLoading } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    executeCode,
    executionResult,
    isExecuting,
    executionError,
    startLintInterval,
    stopLintInterval,
    lintResult,
  } = useCodeExecution();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState<"editor" | "output" | "info">(
    "editor"
  );
  const [editorWidth, setEditorWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    if (isLoading) return;

    if (currentProject) {
      // Convert \n escape sequences to actual newlines
      const formattedCode = currentProject.code.replace(/\\n/g, "\n");
      setCode(formattedCode);
    }
  }, [currentProject?.postId, isLoading]);

  useEffect(() => {
    if (currentProject && code) {
      const updatedProject = { ...currentProject, code };
      setCurrentProject(updatedProject);
    }
  }, [code]);

  // Start the linting interval when code changes (runs every 3 seconds)
  useEffect(() => {
    if (!code.trim()) {
      stopLintInterval();
      return;
    }

    // Run lint immediately on code change
    startLintInterval(code);

    // Then set up interval to run every 3 seconds
    const lintIntervalId = setInterval(() => {
      if (code.trim()) {
        startLintInterval(code);
      }
    }, 3000);

    return () => {
      stopLintInterval();
      clearInterval(lintIntervalId);
    };
  }, [code, startLintInterval, stopLintInterval]);

  // Update editor markers when lint results change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Show live linter results
    const allIssues = lintResult?.issues || [];

    const markers = allIssues.map((issue) => ({
      severity:
        issue.severity === "error"
          ? monaco.MarkerSeverity.Error
          : issue.severity === "warning"
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Info,
      message: issue.message,
      startLineNumber: issue.line,
      startColumn: issue.column + 1,
      endLineNumber: issue.line,
      endColumn: issue.column + 100,
      source: "Linter",
    }));

    monaco.editor.setModelMarkers(editor.getModel(), "linter", markers);
  }, [lintResult]);

  const handleRunCode = async () => {
    try {
      await executeCode({
        code,
        timeoutSeconds: 30,
      });
      if (!isDesktop) {
        setActiveTab("output");
      }
    } catch (err) {
      console.error("Execution failed:", err);
    }
  };

  const handleEditorChange = (value: string | undefined): void => {
    setCode(value || "");
    // Clear save success message when code changes
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleSave = async () => {
    if (!currentProject || !user) return;

    // Check if user owns the post or is an admin
    const isOwner = currentProject.userId === user.userId;

    if (!isOwner && !user.isAdmin) {
      setSaveError("You don't have permission to edit this post");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      // Update the post on the server
      await postService.update(currentProject.postId, {
        ...currentProject,
        code, // Use current code from editor
      });

      // Update tags if they exist
      if (currentProject.tags && currentProject.tags.length > 0) {
        await tagService.deletePostTags(currentProject.postId);
        await tagService.addMultipleTags(
          currentProject.postId,
          currentProject.tags
        );
      }

      // Update local context with saved code
      setCurrentProject({ ...currentProject, code });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save project"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // for disabling the save button
  const canEdit = currentProject && user && (currentProject.userId === user.userId || user.isAdmin);

  // Trigger editor layout on container size changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle dragging the divider
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;

      if (newWidth >= 30 && newWidth <= 70) {
        setEditorWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Get all issues grouped by severity
  // Show live linter results
  const allIssues = lintResult?.issues || [];

  const errorIssues = allIssues.filter((i) => i.severity === "error");
  const warningIssues = allIssues.filter((i) => i.severity === "warning");
  const infoIssues = allIssues.filter((i) => i.severity === "info");

  // Display execution output or error
  const displayOutput = executionResult?.output || executionError || "";

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">
            No Project Open
          </h2>
          <p className="text-zinc-600 mb-6">
            Select or create a project to get started!
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Browse Projects
          </button>
        </div>
      </div>
    );
  }

  // Issues Panel Component
  const InfoPanel = ({ maxHeight = "max-h-48" }: { maxHeight?: string }) => {
    if (allIssues.length === 0) return null;

    return (
      <div
        className={`border-t border-[#3e3e42] bg-[#252526] ${maxHeight} overflow-y-auto`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-zinc-300">
              Info ({allIssues.length})
            </h4>
            <div className="flex gap-3 text-xs">
              {errorIssues.length > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertCircle size={14} />
                  {errorIssues.length}
                </span>
              )}
              {warningIssues.length > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <AlertTriangle size={14} />
                  {warningIssues.length}
                </span>
              )}
              {infoIssues.length > 0 && (
                <span className="flex items-center gap-1 text-blue-400">
                  <Info size={14} />
                  {infoIssues.length}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {allIssues.slice(0, 10).map((issue, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs p-2 rounded bg-[#1e1e1e] hover:bg-[#2a2d2e] transition-colors cursor-pointer"
                onClick={() => {
                  if (editorRef.current) {
                    editorRef.current.setPosition({
                      lineNumber: issue.line,
                      column: issue.column + 1,
                    });
                    editorRef.current.revealLineInCenter(issue.line);
                    editorRef.current.focus();
                  }
                }}
              >
                {issue.severity === "error" ? (
                  <AlertCircle
                    size={14}
                    className="text-red-400 shrink-0 mt-0.5"
                  />
                ) : issue.severity === "warning" ? (
                  <AlertTriangle
                    size={14}
                    className="text-yellow-400 shrink-0 mt-0.5"
                  />
                ) : (
                  <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-zinc-500 font-mono">
                      Line {issue.line}:{issue.column}
                    </span>
                  </div>
                  <p
                    className={`${
                      issue.severity === "error"
                        ? "text-red-300"
                        : issue.severity === "warning"
                        ? "text-yellow-300"
                        : "text-blue-300"
                    }`}
                  >
                    {issue.message}
                  </p>
                </div>
              </div>
            ))}
            {allIssues.length > 10 && (
              <div className="text-xs text-zinc-500 text-center pt-2">
                +{allIssues.length - 10} more issues
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isDesktop) {
    // Desktop: has no tabs, side-by-side with resizable divider, issues panel is at the bottom of the output panel
    return (
      <div ref={containerRef} className="h-screen flex bg-zinc-50">
        {/* Editor Panel */}
        <div
          style={{ width: `${editorWidth}%` }}
          className="flex flex-col border-r"
        >
          <Editor
            height="100%"
            language="python"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              cursorBlinking: "smooth",
              smoothScrolling: true,
              contextmenu: true,
              quickSuggestions: true,
            }}
          />
        </div>

        {/* Resizable Divider */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="w-1 bg-zinc-200 hover:bg-zinc-400 cursor-col-resize transition-colors active:bg-zinc-500"
        />

        {/* Output Panel */}
        <div
          style={{ width: `${100 - editorWidth}%` }}
          className="flex flex-col bg-[#1e1e1e]"
        >
          {/* Output Header */}
          <div className="bg-[#252526] border-b border-[#3e3e42] px-6 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Output</span>
              <div className="flex items-center gap-2">
                {saveError && (
                  <span className="text-xs text-red-400 mr-2">{saveError}</span>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !canEdit}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-[#2a2d2e] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!canEdit ? "You don't have permission to edit this post" : "Save code to server"}
                >
                  {saveSuccess ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? "Saving..." : saveSuccess ? "Saved" : "Save"}
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-python-blue hover:bg-[#0092d4] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Run code"
                >
                  <Play size={16} />
                  {isExecuting ? "Running..." : "Run"}
                </button>
              </div>
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-auto p-6 bg-[#1e1e1e]">
            {isExecuting ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-python-blue mx-auto mb-4"></div>
                  <p className="text-zinc-400">Executing code...</p>
                </div>
              </div>
            ) : displayOutput ? (
              <pre className="text-sm text-zinc-100 font-mono whitespace-pre-wrap leading-relaxed">
                {displayOutput}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="max-w-sm">
                  <p className="text-zinc-400 mb-4">No output yet</p>
                  <p className="text-sm text-zinc-500">
                    Click{" "}
                    <span className="font-medium text-python-blue">Run</span> to
                    execute your Python code
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <InfoPanel />
        </div>
      </div>
    );
  }

  // Mobile: Tabbed interface
  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* Tab Bar - Fixed height, no bottom padding */}
      <div className="bg-zinc-100 border-b border-zinc-200 flex items-center gap-0 pt-2 shrink-0">
        {" "}
        {/* Removed pb-3, added flex-shrink-0 */}
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "editor"
              ? "bg-white text-zinc-900 border-b-2 border-python-blue"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab("output")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "output"
              ? "bg-white text-zinc-900 border-b-2 border-python-blue"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
          }`}
        >
          Output
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "info"
              ? "bg-white text-zinc-900 border-b-2 border-python-blue"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
          }`}
        >
          Info
          {allIssues.length > 0 && (
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full min-w-[18px] text-center border-2 border-white">
              {allIssues.length}
            </span>
          )}
        </button>
        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !canEdit}
            className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-200 rounded-md transition-colors disabled:opacity-50"
            title={!canEdit ? "You don't have permission to edit this post" : "Save code"}
          >
            {saveSuccess ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Save size={16} />
            )}
          </button>
          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-python-blue hover:bg-[#0092d4] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Run code and show output"
          >
            <Play size={16} />
            {isExecuting ? "..." : "Run"}
          </button>
        </div>
      </div>

      {/* Content Area - Fixed height calculation */}
      <div
        className="flex-1 flex flex-col min-h-0"
        style={{ height: "calc(100vh - 60px)" }}
      >
        {" "}
        {/* Fixed height calculation */}
        {activeTab === "editor" ? (
          <div className="flex-1 flex flex-col">
            <Editor
              height="100%"
              language="python"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
                quickSuggestions: true,
              }}
            />
          </div>
        ) : activeTab === "output" ? (
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            {/* Output Header */}
            <div className="bg-[#252526] border-b border-[#3e3e42] px-4 py-3 shrink-0">
              <span className="text-sm font-medium text-zinc-400">Output</span>
            </div>

            {/* Output Content - Fixed height with proper scrolling */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full p-4 overflow-auto">
                {" "}
                {/* Added overflow-auto here */}
                {isExecuting ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-python-blue mx-auto mb-4"></div>
                      <p className="text-zinc-400">Executing code...</p>
                    </div>
                  </div>
                ) : displayOutput ? (
                  <pre className="text-sm text-zinc-100 font-mono whitespace-pre-wrap leading-relaxed">
                    {displayOutput}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="max-w-sm">
                      <p className="text-zinc-400 mb-4">No output yet</p>
                      <p className="text-sm text-zinc-500">
                        Click{" "}
                        <span className="font-medium text-python-blue">
                          Run
                        </span>{" "}
                        to execute your Python code
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Issues Tab
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            {/* Issues Header */}
            <div className="bg-[#252526] border-b border-[#3e3e42] px-4 py-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">
                  Issues ({allIssues.length})
                </span>
                <div className="flex gap-3 text-xs">
                  {errorIssues.length > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                      <AlertCircle size={14} />
                      {errorIssues.length}
                    </span>
                  )}
                  {warningIssues.length > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <AlertTriangle size={14} />
                      {warningIssues.length}
                    </span>
                  )}
                  {infoIssues.length > 0 && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <Info size={14} />
                      {infoIssues.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full p-4 overflow-auto">
                {allIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="max-w-sm">
                      <Info className="mx-auto text-zinc-500 mb-4" size={48} />
                      <p className="text-zinc-400 mb-2">No issues found</p>
                      <p className="text-sm text-zinc-500">
                        Your code looks good! Any linting issues will appear
                        here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allIssues.map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded bg-[#252526] hover:bg-[#2a2d2e] transition-colors cursor-pointer border border-[#3e3e42] my-2"
                        onClick={() => {
                          setActiveTab("editor");
                          // Focus the editor on the issue line after a brief delay
                          setTimeout(() => {
                            if (editorRef.current) {
                              editorRef.current.setPosition({
                                lineNumber: issue.line,
                                column: issue.column + 1,
                              });
                              editorRef.current.revealLineInCenter(issue.line);
                              editorRef.current.focus();
                            }
                          }, 100);
                        }}
                      >
                        {issue.severity === "error" ? (
                          <AlertCircle
                            size={18}
                            className="text-red-400 shrink-0 mt-0.5"
                          />
                        ) : issue.severity === "warning" ? (
                          <AlertTriangle
                            size={18}
                            className="text-yellow-400 shrink-0 mt-0.5"
                          />
                        ) : (
                          <Info
                            size={18}
                            className="text-blue-400 shrink-0 mt-0.5"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-zinc-400 font-mono text-sm">
                              Line {issue.line}:{issue.column}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                issue.severity === "error"
                                  ? "bg-red-900/50 text-red-300"
                                  : issue.severity === "warning"
                                  ? "bg-yellow-900/50 text-yellow-300"
                                  : "bg-blue-900/50 text-blue-300"
                              }`}
                            >
                              {issue.severity}
                            </span>
                          </div>
                          <p
                            className={`text-sm ${
                              issue.severity === "error"
                                ? "text-red-300"
                                : issue.severity === "warning"
                                ? "text-yellow-300"
                                : "text-blue-300"
                            }`}
                          >
                            {issue.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;