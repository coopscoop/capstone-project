import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Save } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { useCodeExecution } from '@/hooks/useCodeExecution';

const EditorPage = () => {
  const { currentProject, isLoading } = useProject();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const {
    executeCode,
    executionResult,
    isExecuting,
    executionError,
    startLintInterval,
    stopLintInterval,
    lintResult,
    // isLinting,
    // lintError,
    // clearResults,
  } = useCodeExecution();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState<'editor' | 'output'>('editor');
  const [editorWidth, setEditorWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);

  // Initialize code from current project
  useEffect(() => {
    if (isLoading) return;

    if (currentProject) {
      setCode(currentProject.code);
    }
  }, [currentProject, isLoading]);

  // Start the linting interval when code changes
  useEffect(() => {
    if (code.trim()) {
      startLintInterval(code);
    } else {
      stopLintInterval();
    }

    return () => {
      stopLintInterval();
    };
  }, [code, startLintInterval, stopLintInterval]);

  // Update editor markers when lint results change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Get all issues from both lint and execution results
    const allIssues = [
      ...(lintResult?.issues || []),
      ...(executionResult?.lintIssues || [])
    ];

    // Create markers for the editor
    const markers = allIssues.map(issue => ({
      severity: issue.severity === 'error' 
        ? monaco.MarkerSeverity.Error 
        : issue.severity === 'warning' 
        ? monaco.MarkerSeverity.Warning 
        : monaco.MarkerSeverity.Info,
      message: issue.message,
      startLineNumber: issue.line,
      startColumn: issue.column + 1, // Monaco uses 1-based columns
      endLineNumber: issue.line,
      endColumn: issue.column + 100, // Extend to end of line
      source: 'Linter',
    }));

    // Set the markers
    monaco.editor.setModelMarkers(editor.getModel(), 'linter', markers);
  }, [lintResult, executionResult]);

  const handleRunCode = async () => {
    try {
      await executeCode({
        code,
        timeoutSeconds: 30,
      });
      if (!isDesktop) {
        setActiveTab('output');
      }
    } catch (err) {
      console.error('Execution failed:', err);
    }
  };

  const handleEditorChange = (value: string | undefined): void => {
    setCode(value || '');
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

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

  const handleSave = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Get all issues for display
  // const allIssues = [
  //   ...(lintResult?.issues || []),
  //   ...(executionResult?.lintIssues || [])
  // ];

  // Display execution output or error
  const displayOutput = executionResult?.output || executionError || '';

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
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">No Project Open</h2>
          <p className="text-zinc-600 mb-6">Select or create a project to get started!</p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Browse Projects
          </button>
        </div>
      </div>
    );
  }

  if (isDesktop) {
    // Desktop: Side-by-side with resizable divider
    return (
      <div ref={containerRef} className="h-screen flex bg-zinc-50">
        {/* Editor Panel */}
        <div style={{ width: `${editorWidth}%` }} className="flex flex-col border-r">
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
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              cursorBlinking: 'smooth',
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
        <div style={{ width: `${100 - editorWidth}%` }} className="flex flex-col bg-[#1e1e1e]">
          {/* Output Header */}
          <div className="bg-[#252526] border-b border-[#3e3e42] px-6 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Output</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-[#2a2d2e] rounded-md transition-colors"
                  title="Save code"
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-python-blue hover:bg-[#0092d4] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Run code"
                >
                  <Play size={16} />
                  {isExecuting ? 'Running...' : 'Run'}
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
                    Click <span className="font-medium text-python-blue">Run</span> to execute your Python code
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lint Results */}
          {lintResult && lintResult.issues.length > 0 && (
            <div className="border-t border-[#3e3e42] bg-[#252526] max-h-32 overflow-y-auto">
              <div className="p-3">
                <h4 className="text-sm font-medium text-zinc-400 mb-2">
                  Lint Issues ({lintResult.issues.length})
                </h4>
                <div className="space-y-1">
                  {lintResult.issues.slice(0, 3).map((issue, index) => (
                    <div
                      key={index}
                      className={`text-xs ${
                        issue.severity === 'error'
                          ? 'text-red-400'
                          : issue.severity === 'warning'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                      }`}
                    >
                      Line {issue.line}:{issue.column} - {issue.message}
                    </div>
                  ))}
                  {lintResult.issues.length > 3 && (
                    <div className="text-xs text-zinc-500">
                      +{lintResult.issues.length - 3} more issues
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile: Tabbed interface
  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* Tab Bar */}
      <div className="bg-zinc-100 border-b border-zinc-200 flex items-center gap-0">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'editor'
              ? 'bg-white text-zinc-900 border-t border-l border-r border-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab('output')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'output'
              ? 'bg-white text-zinc-900 border-t border-l border-r border-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
          }`}
        >
          Output
        </button>
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200 rounded-md transition-colors"
            title="Save code"
          >
            <Save size={16} />
          </button>
          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-python-blue hover:bg-[#0092d4] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Run code and show output"
          >
            <Play size={16} />
            {isExecuting ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'editor' ? (
          <div className="h-full flex flex-col">
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
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                contextmenu: true,
                quickSuggestions: true,
              }}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col bg-[#1e1e1e]">
            {/* Output Header */}
            <div className="bg-[#252526] border-b border-[#3e3e42] px-4 py-3">
              <span className="text-sm font-medium text-zinc-400">Output</span>
            </div>

            {/* Output Content */}
            <div className="flex-1 overflow-auto p-4 bg-[#1e1e1e]">
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
                      Click <span className="font-medium text-python-blue">Run</span> to execute your Python code
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lint Results for Mobile */}
            {lintResult && lintResult.issues.length > 0 && (
              <div className="border-t border-[#3e3e42] bg-[#252526] max-h-24 overflow-y-auto">
                <div className="p-3">
                  <h4 className="text-sm font-medium text-zinc-400 mb-1">
                    Lint Issues ({lintResult.issues.length})
                  </h4>
                  <div className="space-y-1">
                    {lintResult.issues.slice(0, 2).map((issue, index) => (
                      <div
                        key={index}
                        className={`text-xs ${
                          issue.severity === 'error'
                            ? 'text-red-400'
                            : issue.severity === 'warning'
                            ? 'text-yellow-400'
                            : 'text-blue-400'
                        }`}
                      >
                        Line {issue.line}:{issue.column} - {issue.message}
                      </div>
                    ))}
                    {lintResult.issues.length > 2 && (
                      <div className="text-xs text-zinc-500">
                        +{lintResult.issues.length - 2} more issues
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;