// src/components/Editor/CodeEditor.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

interface CodeEditorProps {
  onChange: (code: string) => void;
  initialValue?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue = '' }) => {
  const [code, setCode] = useState(initialValue);

  const handleChange = React.useCallback((value: string) => {
    setCode(value);
    onChange(value);
  }, [onChange]);

  return (
    <div className="h-full w-full border border-gray-600 rounded-md overflow-hidden">
      <div className="bg-gray-700 px-4 py-2 border-b border-gray-500 flex justify-between items-center">
        <h3 className="font-medium text-gray-100">Editor de Código</h3>
        <div className="text-sm text-gray-700">{code.length} caracteres</div>
      </div>
      <CodeMirror
        value={code}
        height="100%"
        extensions={[javascript({ jsx: true })]}
        onChange={handleChange}
        className="h-full"
        theme="light"
      />
    </div>
  );
};

export default CodeEditor;