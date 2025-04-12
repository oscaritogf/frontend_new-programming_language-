// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import CodeEditor from '@/components/Editor/CodeEditor';
import ResultViewer from '@/components/Output/ResultViewer';
import ErrorViewer from '@/components/ErrorConsole/ErrorViewer';
import ASTViewer from '@/components/AST/ASTViewer';
import { interpretarCodigo, obtenerAST } from '@/services/api';

// Componente para la animación de escritura
const TypewriterText = ({ text, speed = 50 }: { text: string, speed?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);
  
  // Maneja los saltos de línea en el texto
  const formattedText = displayText.split('\n').map((line, index) => (
    <span key={index} className="block">
      {line || ' '}
    </span>
  ));
  
  // Muestra un cursor parpadeante al final si la animación no ha terminado
  return (
    <div className="font-mono">
      {formattedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </div>
  );
};

export default function Home() {
  const [code, setCode] = useState<string>('');
  interface ResultadoType {
    resultado: string;
    tipo: string;
    html?: string;
    css?: string;
  }

  const [resultado, setResultado] = useState<ResultadoType | null>(null);
  interface ErrorType {
    mensaje: string;
    linea?: number;
    columna?: number;
    traceback?: string;
  }

  const [error, setError] = useState<ErrorType | null>(null);
  interface ASTType {
    tipo: string;
    linea?: number;
    columna?: number;
    children?: ASTType[];
    [key: string]: unknown;
  }

  const [ast, setAst] = useState<ASTType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('result');
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [showTypewriter, setShowTypewriter] = useState<boolean>(true);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedExampleName, setCopiedExampleName] = useState("");

  // Ejemplos de código para copiar
  const [examples] = useState([
    {
      name: "FUNCIÓN SALUDAR",
      code: `funcion saludar(nombre: cadena){ 
  mostrar('Hola, ' + nombre)
}
llamado saludar('Steph')`
    },
    {
      name: "FUNCIÓN SUMAR",
      code: `funcion sumar(a: entero, b:entero) : 
entero { a + b  }
llamado sumar(5, 4)`
    },
    {
      name: "CONDICIONAL",
      code: `variable n = 1
variable m = 2
si(n == m){
  mostrar("mismo valor")
}
sino{
  mostrar("valores diferentes")
}`
    },
    {
      name: "PARENTESIS ANIDADOS",
      code: `( 10 )( 8 + 4 )( 2 + (5 - 4) )`
    },
    {
      name: "LISTAS",
      code: `variable lista = [1, 2, 3, 4, 5];
mostrar(lista)`
    }
  ]);

  // Ejemplos de código para ejecución inicial
  const ejemplos = {
    basico: 'variable mensaje = "Hola mundo";\nmostrar(mensaje);',
    condicional: 'variable edad = 18;\n\nsi (edad >= 18) {\n  mostrar("Eres mayor de edad");\n} sino {\n  mostrar("Eres menor de edad");\n}',
    bucle: 'variable contador = 0;\n\nmientras (contador < 5) {\n  mostrar(contador);\n  contador = contador + 1;\n}',
    funcion: 'funcion sumar(a, b) {\n  devolver a + b;\n}\n\nmostrar(sumar(5, 3));',
    html: 'variable titulo = "Mi Página";\nvariable contenido = div(h1(titulo), p("Este es un párrafo de ejemplo"));'
  };

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
          resultado: respuesta.resultado ?? '',
          tipo: respuesta.tipo ?? '',
          html: respuesta.html,
          css: respuesta.css
        });
        setError(null);
        setActiveTab('result');
        
        // Mostrar modal de éxito
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        setResultado(null);
        setError({
          mensaje: respuesta.error || 'Error desconocido',
          linea: respuesta.linea,
          columna: respuesta.columna,
          traceback: respuesta.traceback
        });
        setActiveTab('error');
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
      setActiveTab('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed unused handleEjemploClick function

  // Ejemplos de documentación con código
  const documentacionEjemplos = [
    {
      title: 'Variables',
      icon: (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
        </svg>
      ),
      code: 'variable nombre = valor;'
    },
    {
      title: 'Condicionales',
      icon: (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      code: 'si (condicion) {\n  // código\n}'
    },
    {
      title: 'Bucles',
      icon: (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      ),
      code: 'mientras (condicion) {\n  // código\n}'
    },
    {
      title: 'Funciones',
      icon: (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      code: 'funcion nombre(param) {\n  devolver valor;\n}'
    },
    {
      title: 'HTML',
      icon: (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      ),
      code: 'div(h1("Título"), p("Texto"));'
    },
    {
      title: 'Listas',
      icon: (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
      ),
      code: 'variable lista = [1, 2, 3];'
    }
  ];

  // Animación automática entre los ejemplos de documentación
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTypewriter(false);
      setTimeout(() => {
        setActiveDocIndex((prevIndex) => (prevIndex + 1) % documentacionEjemplos.length);
        setShowTypewriter(true);
      }, 200);
    }, 6000); // Cambiar cada 6 segundos
    
    return () => clearInterval(interval);
  }, [documentacionEjemplos.length]);

  return (
    <main className="min-h-screen bg-[#1E1E2E] p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center hover:text-blue-500 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 hover:scale-110 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            SandBoxEPS
          </h1>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={ejecutarCodigo}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ejecutando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Ejecutar Código
                </>
              )}
            </button>
           
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-md shadow-md transition-all duration-300 flex items-center hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                Ejemplos
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 shadow-lg rounded-md z-10 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                  {examples.map((example) => (
                    <button
                      key={example.name}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-all duration-200 hover:pl-6 flex justify-between items-center"
                      onClick={() => {
                        navigator.clipboard.writeText(example.code);
                        setCopiedExampleName(example.name);
                        setShowCopyModal(true);
                        setTimeout(() => setShowCopyModal(false), 2000);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {example.name}
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
                Editor de Código
              </h2>
            </div>
            <div className="h-96 bg-[#1E1E2E]">
              <CodeEditor 
                onChange={handleCodeChange} 
                initialValue={ejemplos.basico}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-600">
              <div className="flex">
                <button 
                  className={`mr-4 px-3 py-1 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === 'result' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} hover:shadow transform hover:scale-105 active:scale-100`}
                  onClick={() => setActiveTab('result')}
                >
                  Resultados
                </button>
                <button 
                  className={`mr-4 px-3 py-1 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === 'error' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} hover:shadow transform hover:scale-105 active:scale-100`}
                  onClick={() => setActiveTab('error')}
                >
                  Errores
                </button>
                <button 
                  className={`px-3 py-1 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === 'ast' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} hover:shadow transform hover:scale-105 active:scale-100`}
                  onClick={() => setActiveTab('ast')}
                >
                  AST
                </button>
              </div>
            </div>
            <div className="h-96 overflow-auto">
              {activeTab === 'result' && (
                <ResultViewer 
                  resultado={resultado?.resultado}
                  tipo={resultado?.tipo}
                  html={resultado?.html}
                  css={resultado?.css}
                />
              )}
              
              {activeTab === 'error' && (
                <ErrorViewer error={error || undefined} />
              )}
              
              {activeTab === 'ast' && (
                <ASTViewer ast={ast || undefined} />
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            Documentación Rápida
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentacionEjemplos.map((ejemplo, index) => (
              <div 
                key={index}
                className={`${index === activeDocIndex ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700' : 'border-gray-200 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-400`}
              >
                <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center">
                  <span className="transform transition-transform duration-200 hover:scale-110 inline-block">
                    {ejemplo.icon}
                  </span>
                  {ejemplo.title}
                </h3>
                <div className="bg-gray-800 text-green-400 p-3 rounded-md text-sm overflow-x-auto min-h-32 transition-all duration-300 hover:shadow-inner">
                  {index === activeDocIndex && showTypewriter ? (
                    <TypewriterText text={ejemplo.code} speed={30} />
                  ) : (
                    <div className="font-mono">{ejemplo.code.split('\n').map((line, i) => <span key={i} className="block">{line || ' '}</span>)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <footer className="text-center text-gray-600 dark:text-gray-400 text-sm py-4">
          <p className="hover:text-blue-500 transition-colors duration-300">SandBoxLanCode © {new Date().getFullYear()} - Entorno de desarrollo para aprender programación</p>
        </footer>
      </div>
      
      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-opacity-50 backdrop-blur-sm animate-fadeIn"></div>
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-auto transform transition-all duration-300 animate-scale">
            <div className="text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡FUNCIONA!</h3>
              <p className="text-gray-600 dark:text-gray-300">Tu código se ha ejecutado correctamente</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de copia exitosa */}
      {showCopyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-opacity-50 backdrop-blur-sm animate-fadeIn"></div>
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-auto transform transition-all duration-300 animate-scale">
            <div className="text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Copiado!</h3>
              <p className="text-gray-600 dark:text-gray-300">
                El ejemplo <span className="font-semibold text-blue-600 dark:text-blue-400">{copiedExampleName}</span> se ha copiado al portapapeles
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Estilos para animaciones */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scale {
          animation: scale 0.4s ease-out forwards;
        }
      `}</style>
    </main>
  );
}