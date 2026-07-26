import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import CloudField from "./components/CloudField";
import TopNav from "./components/TopNav";
import CodeEditor from "./components/CodeEditor";
import ResizableSplit from "./components/ResizableSplit";
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import WebPreview from "./components/WebPreview";
import SettingsPanel from "./components/SettingsPanel";
import DebugControls from "./components/DebugControls";
import DebugPanel from "./components/DebugPanel";
import { runCode, fetchLanguages } from "./lib/api";
import { useDebugger } from "./hooks/useDebugger";
import { TEMPLATES, WEB_TEMPLATE, SAMPLE_INPUT } from "./lib/templates";

// sessionStorage survives reloads, but is cleared when the browser tab is closed.
// This keeps each tab's work isolated and avoids leaving old code on shared devices.
const STORAGE_KEY = "skycompiler:tab-session";
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

const getSavedSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

export default function App() {
  const savedSession = getSavedSession();
  const [languages, setLanguages] = useState(LANG_FALLBACK);
  const [language, setLanguage] = useState(savedSession.language || "python");
  const [codeByLanguage, setCodeByLanguage] = useState(() => ({
    ...(savedSession.codeByLanguage || {}),
    // Keep drafts saved by earlier versions of the app.
    ...(savedSession.code ? { [savedSession.language || "python"]: savedSession.code } : {}),
  }));
  const [webFiles, setWebFiles] = useState(() => ({ ...WEB_TEMPLATE, ...(savedSession.webFiles || {}) }));
  const [webTab, setWebTab] = useState(savedSession.webTab || "html");
  const [stdin, setStdin] = useState(savedSession.stdin || "");
  const [inputHistory, setInputHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(savedSession.fontSize || 15);
  const [minimapEnabled, setMinimapEnabled] = useState(savedSession.minimapEnabled || false);
  const [highContrast, setHighContrast] = useState(savedSession.highContrast || false);
  const [darkMode, setDarkMode] = useState(savedSession.darkMode || false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // ── Debugger hook ────────────────────────────────────────────────────────────
  const debugger_ = useDebugger();

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

  // Save immediately after every edit so a refresh cannot lose a recent keystroke.
  useLayoutEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        language,
        codeByLanguage,
        webFiles,
        webTab,
        stdin,
        fontSize,
        minimapEnabled,
        highContrast,
        darkMode,
      })
    );
  }, [language, codeByLanguage, webFiles, webTab, stdin, fontSize, minimapEnabled, highContrast, darkMode]);

  // ── Keyboard shortcuts for debugger ─────────────────────────────────────────
  useEffect(() => {
    if (!debugger_.isDebugging) return;

    const handleKey = (e) => {
      // Only intercept arrow keys when debugger is active
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          debugger_.goNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          debugger_.goPrev();
          break;
        case "Home":
          e.preventDefault();
          debugger_.goFirst();
          break;
        case "End":
          e.preventDefault();
          debugger_.goLast();
          break;
        case "Escape":
          debugger_.exitDebug();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [debugger_.isDebugging, debugger_.goNext, debugger_.goPrev, debugger_.goFirst, debugger_.goLast, debugger_.exitDebug]);

  // ── Auto-scroll editor to current debug line ─────────────────────────────────
  useEffect(() => {
    if (!debugger_.isDebugging || !debugger_.currentStep) return;
    const line = debugger_.currentStep.line;
    if (line && editorRef.current) {
      editorRef.current.revealLineInCenterIfOutsideViewport(line);
    }
  }, [debugger_.currentStep, debugger_.isDebugging]);

  const handleLanguageChange = (id) => {
    setLanguage(id);
    setResult(null);
    // Switching language exits debug
    if (debugger_.isDebugging) debugger_.exitDebug();
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
      setInputHistory((h) => [stdin, ...h].slice(0, 5));
    }

    if (isWeb) {
      const res = await runCode({ language: "web", ...webFiles });
      setPreviewHtml(res.previewHtml || "");
      setIsRunning(false);
      return;
    }

    const res = await runCode({ language, code: activeCode, stdin });
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

  const handleDebug = async () => {
    if (language !== "python") return;
    await debugger_.startDebug(activeCode, stdin);
  };

  const handleSave = () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      language, codeByLanguage, webFiles, webTab, stdin,
      fontSize, minimapEnabled, highContrast, darkMode,
    }));
  };

  const handleReset = () => {
    if (isWeb) setWebFiles(WEB_TEMPLATE);
    else setCodeByLanguage((drafts) => ({ ...drafts, [language]: TEMPLATES[language] || "" }));
    setResult(null);
    if (debugger_.isDebugging) debugger_.exitDebug();
  };

  const handleDownload = () => {
    const blob = new Blob([activeCode], { type: "text/plain" });
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

  const activeCode = isWeb ? webFiles[webTab] : (codeByLanguage[language] ?? TEMPLATES[language] ?? "");
  const activeLangForEditor = isWeb ? webTab : language;

  // ── Derived debug decoration values ─────────────────────────────────────────
  const debugLine = debugger_.isDebugging ? (debugger_.currentStep?.line ?? null) : null;
  const exceptionLine = (debugger_.isDebugging && debugger_.currentStep?.exception)
    ? debugger_.currentStep.line
    : null;

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
        isDebugging={debugger_.isDebugging}
        isDebugLoading={debugger_.isLoading}
        onDebug={handleDebug}
        onStopDebug={debugger_.exitDebug}
      />

      <main className="relative z-10 flex-1 min-h-0 p-4">
        <ResizableSplit
          direction="horizontal"
          initialRatio={debugger_.isDebugging || debugger_.isLoading || debugger_.isError ? 0.5 : 0.65}
          first={
            <div className="h-full flex flex-col pr-2">
              {isWeb && (
                <div className="flex gap-1 mb-2">
                  {["html", "css", "js"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setWebTab(tab)}
                      className={`px-3 py-1.5 text-xs font-mono rounded-t-control glass-control ${webTab === tab ? "shadow-glow text-sky-deep" : "text-mist"
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
                    // Editing while debugging exits the session
                    if (debugger_.isDebugging) debugger_.exitDebug();
                    if (isWeb) setWebFiles((f) => ({ ...f, [webTab]: val ?? "" }));
                    else setCodeByLanguage((drafts) => ({ ...drafts, [language]: val ?? "" }));
                  }}
                  debugLine={debugLine}
                  executedLines={debugger_.isDebugging ? debugger_.executedLines : null}
                  exceptionLine={exceptionLine}
                />
              </div>

              {/* Debug Controls — replaces language selector below editor */}
              {debugger_.isDebugging && (
                <DebugControls
                  currentIndex={debugger_.currentIndex}
                  totalSteps={debugger_.totalSteps}
                  isAtFirst={debugger_.isAtFirst}
                  isAtLast={debugger_.isAtLast}
                  onFirst={debugger_.goFirst}
                  onPrev={debugger_.goPrev}
                  onNext={debugger_.goNext}
                  onLast={debugger_.goLast}
                  onGoTo={debugger_.goTo}
                  currentStep={debugger_.currentStep}
                  truncated={debugger_.truncated}
                />
              )}
            </div>
          }
          second={
            isWeb ? (
              <div className="h-full pl-2">
                <WebPreview srcDoc={previewHtml} />
              </div>
            ) : debugger_.isDebugging || debugger_.isLoading || debugger_.isError ? (
              <div className="h-full pl-2">
                <ResizableSplit
                  direction="vertical"
                  initialRatio={0.5}
                  first={
                    <div className="h-full pb-2">
                      <ResizableSplit
                        direction="horizontal"
                        initialRatio={0.5}
                        first={
                          <div className="h-full pr-1">
                            <InputPanel
                              value={stdin}
                              onChange={setStdin}
                              onClear={() => setStdin("")}
                              history={inputHistory}
                              onSelectHistory={setStdin}
                            />
                          </div>
                        }
                        second={
                          <div className="h-full pl-1">
                            <OutputPanel
                              result={
                                debugger_.isDebugging || debugger_.isLoading
                                  ? {
                                      success: !debugger_.currentStep?.exception,
                                      stdout: debugger_.currentStep?.stdout || "",
                                      stderr: debugger_.currentStep?.exception
                                        ? `${debugger_.currentStep.exception.type}: ${debugger_.currentStep.exception.message}`
                                        : "",
                                      diagnostics: [],
                                      hint: null,
                                      runtimeMs: 0,
                                      compileMs: 0,
                                      exitCode: debugger_.currentStep?.exception ? 1 : 0,
                                    }
                                  : result
                              }
                              isRunning={isRunning || debugger_.isLoading}
                              onCopy={() => navigator.clipboard.writeText(
                                debugger_.isDebugging 
                                  ? (debugger_.currentStep?.stdout || "") 
                                  : (result?.stdout || "")
                              )}
                              onDownload={() => {
                                const outputText = debugger_.isDebugging 
                                  ? (debugger_.currentStep?.stdout || "") 
                                  : (result?.stdout || "");
                                const blob = new Blob([outputText], { type: "text/plain" });
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
                  }
                  second={
                    <div className="h-full pt-2">
                      <DebugPanel
                        currentStep={debugger_.currentStep}
                        isLoading={debugger_.isLoading}
                        error={debugger_.error}
                      />
                    </div>
                  }
                />
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
