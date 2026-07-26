import { useState, useEffect, useRef, useCallback } from "react";
import CloudField from "./components/CloudField";
import TopNav from "./components/TopNav";
import CodeEditor from "./components/CodeEditor";
import ResizableSplit from "./components/ResizableSplit";
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import WebPreview from "./components/WebPreview";
import SettingsPanel from "./components/SettingsPanel";
import { runCode, fetchLanguages } from "./lib/api";
import { TEMPLATES, WEB_TEMPLATE, SAMPLE_INPUT } from "./lib/templates";

const STORAGE_KEY = "skycompiler:save";
const LANG_FALLBACK = [
  { id: "python", label: "Python" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "web", label: "Web (HTML/CSS/JS)" },
];

const FILE_NAMES = {
  python: "main.py",
  c: "main.c",
  cpp: "main.cpp",
  java: "Main.java",
  javascript: "main.js",
  web: "index.html",
};

export default function App() {
  const [languages, setLanguages] = useState(LANG_FALLBACK);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(TEMPLATES.python);
  const [webFiles, setWebFiles] = useState(WEB_TEMPLATE);
  const [webTab, setWebTab] = useState("html");
  const [stdin, setStdin] = useState("");
  const [inputHistory, setInputHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [minimapEnabled, setMinimapEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const abortRef = useRef(null);

  const isWeb = language === "web";

  useEffect(() => {
    fetchLanguages().then((data) => {
      if (data.languages?.length) setLanguages(data.languages);
    });
  }, []);

  // The page background lives on <body>, so the theme class must be on the
  // document root for its CSS variables to cascade across the full viewport.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    return () => document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ language, code, webFiles, stdin })
      );
    }, 800);
    return () => clearTimeout(t);
  }, [language, code, webFiles, stdin]);

  const handleLanguageChange = (id) => {
    setLanguage(id);
    setResult(null);
    if (id !== "web" && !code.trim()) setCode(TEMPLATES[id] || "");
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const applyDiagnosticsToEditor = useCallback((diagnostics) => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    const markers = diagnostics.map((d) => ({
      startLineNumber: d.line,
      endLineNumber: d.line,
      startColumn: d.column || 1,
      endColumn: (d.column || 1) + 20,
      message: d.message,
      severity: monacoRef.current.MarkerSeverity.Error,
    }));
    monacoRef.current.editor.setModelMarkers(model, "skycompiler", markers);
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    setPreviewHtml("");

    if (stdin && !inputHistory.includes(stdin)) {
      setInputHistory((h) => [stdin, ...h].slice(0, 10));
    }

    if (isWeb) {
      const res = await runCode({ language: "web", ...webFiles });
      setPreviewHtml(res.previewHtml || "");
      setIsRunning(false);
      return;
    }

    const res = await runCode({ language, code, stdin });
    setResult(res);
    setIsRunning(false);
    applyDiagnosticsToEditor(res.diagnostics || []);
  };

  const handleStop = () => {
    // The backend enforces its own hard timeout per-execution; this just
    // stops the UI from waiting. A future WebSocket-based run mode could
    // propagate a real cancel signal to the container.
    setIsRunning(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, code, webFiles, stdin }));
  };

  const handleReset = () => {
    if (isWeb) setWebFiles(WEB_TEMPLATE);
    else setCode(TEMPLATES[language] || "");
    setResult(null);
  };

  const handleDownload = () => {
    const blob = new Blob([isWeb ? webFiles[webTab] : code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isWeb ? `${webTab}.${webTab === "html" ? "html" : webTab}` : FILE_NAMES[language];
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const jumpToLine = (line) => {
    editorRef.current?.revealLineInCenter(line);
    editorRef.current?.setPosition({ lineNumber: line, column: 1 });
    editorRef.current?.focus();
  };

  const activeCode = isWeb ? webFiles[webTab] : code;
  const activeLangForEditor = isWeb ? webTab : language;

  return (
    <div className={`h-screen w-screen flex flex-col relative ${highContrast ? "contrast-125" : ""}`}>
      <CloudField />

      <TopNav
        languages={languages}
        language={language}
        onLanguageChange={handleLanguageChange}
        fileName={FILE_NAMES[language]}
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        onSave={handleSave}
        onReset={handleReset}
        onDownload={handleDownload}
        onFullScreen={handleFullScreen}
        onOpenSettings={() => setSettingsOpen(true)}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((d) => !d)}
      />

      <main className="relative z-10 flex-1 min-h-0 p-4">
        <ResizableSplit
          direction="horizontal"
          initialRatio={0.65}
          first={
            <div className="h-full flex flex-col pr-2">
              {isWeb && (
                <div className="flex gap-1 mb-2">
                  {["html", "css", "js"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setWebTab(tab)}
                      className={`px-3 py-1.5 text-xs font-mono rounded-t-control glass-control ${
                        webTab === tab ? "shadow-glow text-sky-deep" : "text-mist"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 glass-panel rounded-panel overflow-hidden shadow-glass">
                <CodeEditor
                  value={activeCode}
                  language={activeLangForEditor}
                  darkMode={darkMode}
                  fontSize={fontSize}
                  minimapEnabled={minimapEnabled}
                  onMount={handleEditorMount}
                  onChange={(val) => {
                    if (isWeb) setWebFiles((f) => ({ ...f, [webTab]: val ?? "" }));
                    else setCode(val ?? "");
                  }}
                />
              </div>
            </div>
          }
          second={
            isWeb ? (
              <div className="h-full pl-2">
                <WebPreview srcDoc={previewHtml} />
              </div>
            ) : (
              <div className="h-full pl-2">
                <ResizableSplit
                  direction="vertical"
                  initialRatio={0.35}
                  first={
                    <div className="h-full pb-2">
                      <InputPanel
                        value={stdin}
                        onChange={setStdin}
                        onLoadSample={() => setStdin(SAMPLE_INPUT[language] || "")}
                        onClear={() => setStdin("")}
                        history={inputHistory}
                        onSelectHistory={setStdin}
                      />
                    </div>
                  }
                  second={
                    <div className="h-full pt-2">
                      <OutputPanel
                        result={result}
                        isRunning={isRunning}
                        onCopy={() => navigator.clipboard.writeText(result?.stdout || "")}
                        onDownload={() => {
                          const blob = new Blob([result?.stdout || ""], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "output.txt";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        onClear={() => setResult(null)}
                        onJumpToLine={jumpToLine}
                      />
                    </div>
                  }
                />
              </div>
            )
          }
        />
      </main>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        minimapEnabled={minimapEnabled}
        setMinimapEnabled={setMinimapEnabled}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
      />
    </div>
  );
}
