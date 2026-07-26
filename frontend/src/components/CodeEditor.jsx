import { useState } from "react";
import Editor from "@monaco-editor/react";
import { LANGUAGE_KEYWORDS } from "../lib/keywords";

const MONACO_LANG_MAP = {
  python: "python",
  c: "c",
  cpp: "cpp",
  java: "java",
  javascript: "javascript",
  typescript: "typescript",
  html: "html",
  css: "css",
  js: "javascript",
  sql: "sql",
  go: "go",
  rust: "rust",
  kotlin: "kotlin",
  swift: "swift",
  php: "php",
  ruby: "ruby",
  csharp: "csharp",
  bash: "shell",
  dart: "dart",
};

/**
 * A thin, opinionated wrapper around Monaco. Almost every item on the
 * "Editor Features" list (auto-closing brackets/quotes, multi-cursor,
 * folding, minimap, sticky scroll, bracket-pair colorization, IntelliSense
 * suggestions, command palette, go-to-line, find/replace) is a Monaco
 * built-in — the work here is turning them on deliberately and wiring
 * error markers for the debugging feature, not reimplementing them.
 */
export default function CodeEditor({
  value,
  onChange,
  language,
  fontSize = 15,
  onMount,
  diagnostics = [],
  minimapEnabled = true,
  darkMode = false,
  onCursorChange,
}) {
  const [loading, setLoading] = useState(true);

  const handleMount = (editor, monaco) => {
    setLoading(false);
    if (onMount) onMount(editor, monaco);

    // Track cursor position
    if (onCursorChange) {
      editor.onDidChangeCursorPosition((e) => {
        onCursorChange({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      });
    }
  };

  const themeName = darkMode ? "skyDark" : "skyLight";

  return (
    <div className="relative w-full h-full">
      {/* Loading skeleton */}
      {loading && (
        <div className="editor-skeleton absolute inset-0 z-10">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-line"
              style={{
                width: `${35 + Math.random() * 55}%`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      )}

      <Editor
        height="100%"
        language={MONACO_LANG_MAP[language] || "plaintext"}
        value={value}
        onChange={onChange}
        onMount={handleMount}
        theme={themeName}
        beforeMount={(monaco) => {
          // Register custom keyword suggestions for each supported language
          Object.entries(LANGUAGE_KEYWORDS).forEach(([langId, keywords]) => {
            const monacoLangId = MONACO_LANG_MAP[langId] || langId;
            monaco.languages.registerCompletionItemProvider(monacoLangId, {
              provideCompletionItems: (model, position) => {
                const suggestions = keywords.map((kw) => ({
                  label: kw,
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: kw,
                  detail: `Keyword for ${langId}`,
                }));
                return { suggestions };
              },
            });
          });

          // Light theme — tuned to sky blue palette
          monaco.editor.defineTheme("skyLight", {
            base: "vs",
            inherit: true,
            rules: [
              { token: "comment", foreground: "94B8CB", fontStyle: "italic" },
              { token: "keyword", foreground: "0EA5E9" },
              { token: "string", foreground: "16A34A" },
              { token: "number", foreground: "D97706" },
              { token: "type", foreground: "0369A1" },
            ],
            colors: {
              "editor.background": "#FFFFFF00",
              "editor.lineHighlightBackground": "#38BDF810",
              "editor.lineHighlightBorder": "#38BDF815",
              "editorLineNumber.foreground": "#94B8CB",
              "editorLineNumber.activeForeground": "#0EA5E9",
              "editorCursor.foreground": "#0EA5E9",
              "editor.selectionBackground": "#38BDF830",
              "editor.inactiveSelectionBackground": "#38BDF818",
              "editorBracketMatch.background": "#38BDF825",
              "editorBracketMatch.border": "#38BDF850",
              "editorIndentGuide.background": "#E2F1FA",
              "editorIndentGuide.activeBackground": "#38BDF850",
              "editorWidget.background": "#FFFFFF",
              "editorWidget.border": "#E2F1FA",
              "editorSuggestWidget.background": "#FFFFFF",
              "editorSuggestWidget.border": "#E2F1FA",
              "editorSuggestWidget.selectedBackground": "#38BDF818",
            },
          });

          // Dark theme — deep oceanic blue
          monaco.editor.defineTheme("skyDark", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "comment", foreground: "4A7A94", fontStyle: "italic" },
              { token: "keyword", foreground: "38BDF8" },
              { token: "string", foreground: "34D399" },
              { token: "number", foreground: "FBBF24" },
              { token: "type", foreground: "7DD3FC" },
            ],
            colors: {
              "editor.background": "#0F1E32",
              "editor.lineHighlightBackground": "#38BDF808",
              "editor.lineHighlightBorder": "#38BDF810",
              "editorLineNumber.foreground": "#4A7A94",
              "editorLineNumber.activeForeground": "#38BDF8",
              "editorCursor.foreground": "#38BDF8",
              "editor.selectionBackground": "#38BDF825",
              "editor.inactiveSelectionBackground": "#38BDF812",
              "editorBracketMatch.background": "#38BDF820",
              "editorBracketMatch.border": "#38BDF840",
              "editorIndentGuide.background": "#1E3A5F",
              "editorIndentGuide.activeBackground": "#38BDF840",
              "editorWidget.background": "#0F1E32",
              "editorWidget.border": "#1E3A5F",
              "editorSuggestWidget.background": "#0F1E32",
              "editorSuggestWidget.border": "#1E3A5F",
              "editorSuggestWidget.selectedBackground": "#38BDF818",
            },
          });
        }}
        options={{
          fontSize,
          fontFamily: "JetBrains Mono, monospace",
          fontLigatures: true,
          automaticLayout: true,
          minimap: {
            enabled: minimapEnabled,
            size: "fit",
            maxColumn: 80,
            scale: 1,
          },
          wordWrap: "on",
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          matchBrackets: "always",
          bracketPairColorization: { enabled: true },
          folding: true,
          renderLineHighlight: "all",
          cursorSmoothCaretAnimation: "on",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          multiCursorModifier: "alt",
          stickyScroll: { enabled: true },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          tabSize: 4,
          renderWhitespace: "selection",
          guides: { indentation: true, bracketPairs: true },
          padding: { top: 12, bottom: 12 },
          lineDecorationsWidth: 10,
          // Command palette, Find/Replace/Find-All, Go To Line are all
          // reachable via default keybindings (Ctrl/Cmd+Shift+P, Ctrl/Cmd+F, Ctrl/Cmd+G).
        }}
      />
    </div>
  );
}

export { MONACO_LANG_MAP };
