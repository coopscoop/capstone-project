import { useState } from 'react';
import { Code } from 'lucide-react';
import { codeService } from '@/services';

export const CodeLinter = () => {
  const [codeInput, setCodeInput] = useState('print("Hello, World!")');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLint = async () => {
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const data = await codeService.lint({ code: codeInput });
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lint code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-700 rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Code className="text-yellow-400" size={24} />
        <h3 className="text-lg font-semibold text-zinc-200">Code Linting</h3>
      </div>
      <p className="text-sm text-zinc-300 mb-4">
        Lint Python code to check for issues.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Python Code
          </label>
          <textarea
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 min-h-[120px]"
            placeholder="print('Hello, World!')"
          />
        </div>

        <button
          onClick={handleLint}
          disabled={loading}
          className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Linting...' : 'Lint Code'}
        </button>

        {output && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Lint Results
            </label>
            <pre className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-yellow-300 font-mono text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
              {output}
            </pre>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};