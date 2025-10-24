import { useState, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Save } from 'lucide-react';

const EditorPage = () => {
  const [code, setCode] = useState(`# Welcome to the Python Editor

def fibonacci(n):
    """Calculate the nth Fibonacci number"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Calculate and print the 10th Fibonacci number
result = fibonacci(10)
print(f"The 10th Fibonacci number is: {result}")
`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);

  const handleEditorChange = (value: string | undefined): void => {
    setCode(value || '');
  };

  // bad but I don't know how to type this
  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    // Simulate code execution
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

  return (
    <div className="h-screen flex bg-zinc-50">
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col border-r"> 
        <div className="flex-1">
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
      </div>

      {/* Output Panel */}
      <div className="w-[500px] flex flex-col bg-[#1e1e1e]">
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
};

export default EditorPage;