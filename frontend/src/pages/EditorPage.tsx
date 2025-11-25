import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Save } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';

const EditorPage = () => {
  const { currentProject, isLoading } = useProject();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  useEffect(() => {
    if (isLoading) return;

    if (currentProject) {
      setCode(currentProject.code);
    }
  }, [currentProject, isLoading]);

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

  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState<'editor' | 'output'>('editor');
  const [editorWidth, setEditorWidth] = useState(60); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEditorChange = (value: string | undefined): void => {
    setCode(value || '');
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Trigger editor layout on container size changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) {
        (editorRef.current as any).layout();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    setTimeout(() => {
      setOutput(`Running code...\n\n\n\nConnect to a Python backend to execute code.\nOutput would appear here.`);
      setIsRunning(false);
    }, 500);
  };

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

      // Clamp between 30% and 70%
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
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-python-blue hover:bg-[#0092d4] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Run code"
                >
                  <Play size={16} />
                  {isRunning ? 'Running...' : 'Run'}
                </button>
              </div>
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-auto p-6 bg-[#1e1e1e]">
            {output ? (
              <pre className="text-sm text-zinc-100 font-mono whitespace-pre-wrap leading-relaxed">
                {output}
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
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-[#2a2d2e] rounded-md transition-colors"
            title="Save code"
          >
            <Save size={16} />
          </button>
          <button
            onClick={() => {
              handleRun();
              setActiveTab('output');
            }}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-python-blue hover:bg-[#0092d4] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Run code and show output"
          >
            <Play size={16} />
            {isRunning ? 'Running...' : 'Run'}
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
              {output ? (
                <pre className="text-sm text-zinc-100 font-mono whitespace-pre-wrap leading-relaxed">
                  {output}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;