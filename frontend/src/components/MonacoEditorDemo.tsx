import { useState } from 'react';
import { Editor } from '@monaco-editor/react';

const MonacoEditorDemo: React.FC = () => {
  const [code, setCode] = useState<string>(`# Welcome to Python Editor!
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
`);
  const [output, setOutput] = useState<string>('');

  const handleEditorChange = (value: string | undefined): void => {
    setCode(value || '');
  };

  const runCode = (): void => {
    setOutput('Connect to your backend to run Python code!');
    // TODO: Send code to your backend API
  };

  return (
    <div className="flex items-center justify-center w-full h-full p-5 bg-gray-100">
      <div className="w-4/5 h-[80vh] flex flex-col gap-2.5">
        <div className="flex gap-2.5">
          <button 
            onClick={runCode} 
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white border-none rounded cursor-pointer text-sm transition-colors"
          >
            ▶ Run Python
          </button>
        </div>

        <div className="flex-1 border border-gray-300 rounded overflow-hidden">
          <Editor
            height="100%"
            language="python"
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {output && (
          <div className="p-4 bg-[#252526] text-white rounded font-mono text-sm whitespace-pre-wrap max-h-[150px] overflow-auto">
            {output}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoEditorDemo;