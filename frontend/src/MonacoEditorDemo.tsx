import { useState } from 'react';
import Editor from '@monaco-editor/react';

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
    setOutput('connect the backend sometime this is just a proof of concept');
    // TODO: Send code to your backend API
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#ffffffff'
    }}>
      <div style={{
        width: '80%',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={runCode}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0e639c',
              color: '#ffffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ▶ Run Python
          </button>
        </div>

        <div style={{
          flex: 1,
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
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
          <div style={{
            padding: '15px',
            backgroundColor: '#252526',
            color: '#fff',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
            maxHeight: '150px',
            overflow: 'auto'
          }}>
            {output}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoEditorDemo;