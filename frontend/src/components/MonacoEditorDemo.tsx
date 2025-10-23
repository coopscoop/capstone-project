import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import '@/styles/MonacoEditor.css';

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
    <div className="editor-container">
      <div className="editor-wrapper">
        <div className="editor-toolbar">
          <button onClick={runCode} className="run-button">
            ▶ Run Python
          </button>
        </div>

        <div className="editor-box">
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
          <div className="output-panel">
            {output}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoEditorDemo;