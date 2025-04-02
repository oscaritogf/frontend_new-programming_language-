// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import CodeEditor from '@/components/Editor/CodeEditor';
import ResultViewer from '@/components/Output/ResultViewer';
import ErrorViewer from '@/components/ErrorConsole/ErrorViewer';
import ASTViewer from '@/components/AST/ASTViewer';
import { interpretarCodigo, obtenerAST } from '@/services/api';

export default function Home() {
  const [code, setCode] = useState<string>('');
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [ast, setAst] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const ejecutarCodigo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const respuesta = await interpretarCodigo(code);
      
      if (respuesta.estado === 'exito') {
        setResultado({
          resultado: respuesta.resultado,
          tipo: respuesta.tipo,
          html: respuesta.html,
          css: respuesta.css
        });
        setError(null);
      } else {
        setResultado(null);
        setError({
          mensaje: respuesta.error || 'Error desconocido',
          linea: respuesta.linea,
          columna: respuesta.columna,
          traceback: respuesta.traceback
        });
      }
      
      // Obtener AST cada vez que se ejecuta el código
      const astResponse = await obtenerAST(code);
      if (astResponse.estado === 'exito') {
        setAst(astResponse.ast);
      }
    } catch (err) {
      console.error('Error ejecutando código:', err);
      setError({
        mensaje: 'Error de conexión con el servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ejemplos de código para empezar
  const ejemplos = {
    basico: 'variable mensaje = "Hola mundo";\nmostrar(mensaje);',
    condicional: 'variable edad = 18;\n\nsi (edad >= 18) {\n  mostrar("Eres mayor de edad");\n} sino {\n  mostrar("Eres menor de edad");\n}',
    bucle: 'variable contador = 0;\n\nmientras (contador < 5) {\n  mostrar(contador);\n  contador = contador + 1;\n}',
    funcion: 'funcion sumar(a, b) {\n  devolver a + b;\n}\n\nmostrar(sumar(5, 3));',
    html: 'variable titulo = "Mi Página";\nvariable contenido = div(h1(titulo), p("Este es un párrafo de ejemplo"));'
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Intérprete de Lenguaje en Español
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={ejecutarCodigo}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Ejecutando...' : 'Ejecutar Código'}
            </button>
            
            <div className="dropdown relative ml-auto">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md">
                Ejemplos
              </button>
              <div className="dropdown-menu hidden absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md z-10">
                {Object.entries(ejemplos).map(([key, value]) => (
                  <button
                    key={key}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setCode(value)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-96">
              <CodeEditor 
                onChange={handleCodeChange} 
                initialValue={ejemplos.basico}
              />
            </div>
            
            <div className="h-96">
              <ResultViewer 
                resultado={resultado?.resultado}
                tipo={resultado?.tipo}
                html={resultado?.html}
                css={resultado?.css}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <ErrorViewer error={error} />
          </div>
          
          <div className="mt-4">
            <ASTViewer ast={ast} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Documentación Rápida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="font-bold text-gray-700">Variables</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm">variable nombre = valor;</pre>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Condicionales</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm">si (condicion) {`{\n  // código\n}`}</pre>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Bucles</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm">mientras (condicion) {`{\n  // código\n}`}</pre>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Funciones</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm">funcion nombre(param) {`{\n  devolver valor;\n}`}</pre>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">HTML</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm">div(h1("Título"), p("Texto"));</pre>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Listas</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm">variable lista = [1, 2, 3];</pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}