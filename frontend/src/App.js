import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "./App.css";

function App() {
    const [code, setCode] = useState(
        '# Enter your Python code here\nprint("Hello, World!")\nvar = 1\n'
    );
    const [lintIssues, setLintIssues] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleLint = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/api/lint", { code });
            setLintIssues(response.data.issues || []);
        } catch (error) {
            console.error("Error linting code:", error);
            setLintIssues([
                {
                    message: "Error connecting to linter service",
                    severity: "error",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Python Code Linter</h1>
            </header>
            <main>
                <div className="editor-container">
                    <Editor
                        height="400px"
                        language="python"
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                        }}
                    />
                </div>
                <button onClick={handleLint} disabled={loading}>
                    {loading ? "Linting..." : "Lint Code"}
                </button>
                <div className="issues-container">
                    <h2>Lint Issues</h2>
                    {lintIssues.length === 0 ? (
                        <p>No issues found.</p>
                    ) : (
                        <ul>
                            {lintIssues.map((issue, index) => (
                                <li
                                    key={index}
                                    className={`issue ${issue.severity}`}
                                >
                                    <strong>{issue.severity}:</strong>{" "}
                                    {issue.message}
                                    {issue.line && (
                                        <span> (Line {issue.line})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
