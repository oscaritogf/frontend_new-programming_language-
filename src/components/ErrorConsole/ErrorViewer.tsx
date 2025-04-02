// src/components/ErrorConsole/ErrorViewer.tsx
'use client';

import { useState } from "react";

import React from 'react';

interface ErrorViewerProps {
  error?: {
    mensaje: string;
    linea?: number;
    columna?: number;
    traceback?: string;
  };
}

const ErrorViewer: React.FC<ErrorViewerProps> = ({ error }) => {
  const [showTraceback, setShowTraceback] = useState(false);
  
  if (!error) {
    return (
      <div className="h-32 w-full border border-gray-300 rounded-md overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h3 className="font-medium text-gray-700">Consola de Errores</h3>
        </div>
        <div className="p-4 text-gray-400 italic">
          No hay errores.
        </div>
      </div>
    );
  }

  return (
    <div className="h-32 w-full border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex justify-between items-center">
        <h3 className="font-medium text-red-600">Error</h3>
        {error.traceback && (
          <button 
            onClick={() => setShowTraceback(!showTraceback)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showTraceback ? 'Ocultar detalles' : 'Mostrar detalles'}
          </button>
        )}
      </div>
      <div className="p-4 overflow-y-auto h-full">
        <div className="text-red-600">
          {error.mensaje}
          {error.linea && error.columna && (
            <span className="text-gray-600"> (línea {error.linea}, columna {error.columna})</span>
          )}
        </div>
        
        {showTraceback && error.traceback && (
          <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">
            {error.traceback}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ErrorViewer;