// src/components/Output/ResultViewer.tsx
'use client';

import React from 'react';
import { useRef, useEffect } from "react";

interface ResultViewerProps {
  html?: string;
  css?: string;
  resultado?: string;
  tipo?: string;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ html, css, resultado, tipo }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && (html || css)) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>${css || ''}</style>
            </head>
            <body>
              ${html || ''}
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  }, [html, css]);

  return (
    <div className="h-full w-full border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <h3 className="font-medium text-gray-700">Resultados</h3>
        {tipo && resultado && (
          <div className="text-sm text-gray-500">
            Tipo: {tipo}, Valor: {resultado}
          </div>
        )}
      </div>
      
      <div className="h-full">
        {(html || css) ? (
          <iframe 
            ref={iframeRef}
            className="w-full h-full bg-white" 
            title="Resultado"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="p-4">
            {resultado ? (
              <pre className="whitespace-pre-wrap">{resultado}</pre>
            ) : (
              <div className="text-gray-400 italic">No hay resultados para mostrar</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultViewer;