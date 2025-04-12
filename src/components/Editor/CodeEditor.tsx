// src/components/Editor/CodeEditor.tsx
'use client';

import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';

interface CodeEditorProps {
  onChange: (code: string) => void;
  initialValue?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue = '' }) => {
  const [code, setCode] = useState(initialValue);
  const [isDark] = useState(true);

  // Tema oscuro personalizado con colores modernos
  const darkTheme = createTheme({
    theme: 'dark',
    settings: {
      background: '#1E1E2E',
      foreground: '#CDD6F4',
      caret: '#F5E0DC',
      selection: '#45475A',
      selectionMatch: '#45475A',
      lineHighlight: '#2A2B3C',
      gutterBackground: '#181825',
      gutterForeground: '#6C7086',
    },
    styles: [
      { tag: t.comment, color: '#6C7086' },
      { tag: t.variableName, color: '#CBA6F7' },
      { tag: t.punctuation, color: '#F5E0DC' },
      { tag: t.keyword, color: '#F38BA8' },
      { tag: t.string, color: '#A6E3A1' },
      { tag: t.number, color: '#FAB387' },
      { tag: t.operator, color: '#89DCEB' },
      { tag: t.function(t.variableName), color: '#89B4FA' },
    ],
  });

  const handleChange = React.useCallback((value: string) => {
    setCode(value);
    onChange(value);
  }, [onChange]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg border border-gray-700 bg-[#1E1E2E] flex flex-col transition-all duration-300">
      {/* Barra superior mejorada */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h3 className="font-medium text-gray-100 flex items-center">
            <span className="mr-2">⚛️</span>
            <span>Editor de Código</span>
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded-md">
            {code.length} caracteres
          </div>
        </div>
      </div>
      
      {/* El editor en sí, con la misma funcionalidad pero tema mejorado */}
      <div className="flex-grow relative overflow-auto">
        <CodeMirror
          value={code}
          height="100%"
          extensions={[
            javascript({ jsx: true }),
            EditorView.lineWrapping,
          ]}
          onChange={handleChange}
          theme={isDark ? darkTheme : 'light'}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
          }}
        />
      </div>
      
      {/* Barra de estado inferior */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
        <div>JSX</div>
        <div className="flex space-x-4">
          <div>{code.split('\n').length} líneas</div>
          <div>{code.length} caracteres</div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;