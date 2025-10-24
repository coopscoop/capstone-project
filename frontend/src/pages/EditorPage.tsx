import { useEffect, useRef, useState } from 'react';
import { Play, Download, FileCode } from 'lucide-react';
import * as monaco from 'monaco-editor';

const EditorPage = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [output, setOutput] = useState<string>('');

  useEffect(() => {
    if (editorRef.current && !editor) {
      const monacoEditor = monaco.editor.create(editorRef.current, {
        value: `# Welcome to the Python Editor\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))`,
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
      });
      
      setEditor(monacoEditor);
    }

    return () => {
      if (editor) {
        editor.dispose();
      }
    };
  }, []);

  const handleRun = () => {
    if (editor) {
      const code = editor.getValue();
      setOutput(`Running code...\n\n${code}\n\n[Note: This is a demo. Connect to a Python backend to execute code.]`);
    }
  };

  const handleDownload = () => {
    if (editor) {
      const code = editor.getValue();
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'code.py';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCode size={24} className="text-zinc-700" />
            <h1 className="text-xl font-semibold text-zinc-900">Python Editor</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={handleRun}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Play size={18} />
              Run
            </button>
          </div>
        </div>
      </header>

      {/* Editor and Output */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          <div className="bg-zinc-800 px-4 py-2 text-sm text-zinc-300 border-b border-zinc-700">
            main.py
          </div>
          <div ref={editorRef} className="flex-1" />
        </div>

        {/* Output Panel */}
        <div className="w-96 border-l border-zinc-200 bg-white flex flex-col">
          <div className="bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 border-b border-zinc-200">
            Output
          </div>
          <div className="flex-1 overflow-auto p-4">
            {output ? (
              <pre className="text-sm text-zinc-800 font-mono whitespace-pre-wrap">{output}</pre>
            ) : (
              <p className="text-sm text-zinc-500">Click "Run" to see output here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;