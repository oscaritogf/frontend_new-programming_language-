'use client';

import React, { useRef, useEffect } from "react";

interface ResultViewerProps {
  html?: string;
  css?: string;
  resultado?: string;
  tipo?: string;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ html, css, resultado, tipo }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Efecto para mostrar html + css en iframe
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

  // Efecto para imprimir en consola la respuesta del backend
  useEffect(() => {
    if (resultado) {
      console.log("Respuesta del backend:", resultado);
    }
  }, [resultado]);

  return (
    <div className="h-full w-full border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-700 px-4 py-2 border-b border-gray-300">
        <h3 className="font-medium text-gray-100">Resultados</h3>
        {tipo && resultado && (
          <div className="text-sm text-gray-100">
            Tipo: {tipo}, Valor: {resultado}
          </div>
        )}
      </div>
      
      <div className="h-full">
        {(html || css) ? (
          <iframe 
            ref={iframeRef}
            className="w-full h-full bg-black" 
            title="Resultado"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="p-4">
            {resultado ? (
              <pre className="whitespace-pre-wrap">{resultado}</pre>
            ) : (
              <div className="text-gray-700 italic">No hay resultados para mostrar</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultViewer;
