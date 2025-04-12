// src/components/AST/ASTViewer.tsx
'use client';

import React, { useState } from 'react';

interface ASTNode {
  tipo: string;
  linea?: number;
  columna?: number;
  [key: string]: unknown;
}

interface ASTViewerProps {
  ast?: ASTNode;
}

const NodeComponent: React.FC<{ node: ASTNode; depth?: number }> = ({ 
  node, 
  depth = 0 
}) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  
  // Filtrar propiedades que no queremos mostrar
  const propertiesToShow = Object.entries(node).filter(([key]) => {
    return !['tipo', 'linea', 'columna'].includes(key);
  });
  
  const hasChildren = propertiesToShow.length > 0;
  
  return (
    <div className="ml-4">
      <div className="flex items-baseline">
        {hasChildren && (
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="mr-1 text-gray-500 focus:outline-none"
          >
            {isOpen ? '▼' : '►'}
          </button>
        )}
        <span className="font-medium text-blue-600">{node.tipo}</span>
        {node.linea && node.columna && (
          <span className="text-xs text-gray-500 ml-2">
            (línea: {node.linea}, columna: {node.columna})
          </span>
        )}
      </div>
      
      {isOpen && hasChildren && (
        <div className="pl-4 border-l-2 border-gray-200">
          {propertiesToShow.map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="mt-1">
                    <span className="text-purple-600">{key}:</span>
                    {value.length === 0 ? (
                      <span className="text-gray-500 ml-2">[]</span>
                    ) : (
                      <div className="ml-4">
                        {value.map((item, index) => (
                          <div key={index} className="mt-1">
                            {typeof item === 'object' && item !== null ? (
                              <NodeComponent node={item} depth={depth + 1} />
                            ) : (
                              <span className="text-green-600">&quot;{item}&quot;</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={key} className="mt-1">
                    <span className="text-purple-600">{key}:</span>
                    {typeof value === 'object' && value !== null && 'tipo' in value ? (
                      <NodeComponent node={value as ASTNode} depth={depth + 1} />
                    ) : (
                      <span className="text-red-500">Invalid ASTNode</span>
                    )}
                  </div>
                );
              }
            } else {
              return (
                <div key={key} className="mt-1">
                  <span className="text-purple-600">{key}:</span>{' '}
                  <span className="text-green-600">
                    {value === null ? 'null' : JSON.stringify(value)}
                  </span>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

const ASTViewer: React.FC<ASTViewerProps> = ({ ast }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div className="w-full border border-gray-300 rounded-md overflow-hidden">
      <div 
        className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex justify-between items-center cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="font-medium text-gray-700">
          Árbol Sintáctico (AST)
        </h3>
        <button className="text-gray-500">
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="p-4 overflow-y-auto max-h-96">
          {ast ? (
            <NodeComponent node={ast} />
          ) : (
            <div className="text-gray-400 italic">
              No hay AST para mostrar. Ejecuta el código primero.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ASTViewer;