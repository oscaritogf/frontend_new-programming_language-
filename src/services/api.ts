// src/services/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.eps.rf.gd';

export interface InterpretarResponse {
  estado: 'exito' | 'error';
  resultado?: string;
  tipo?: string;
  html?: string;
  css?: string;
  error?: string;
  traceback?: string;
  linea?: number;
  columna?: number;
}

export interface ASTResponse {
  estado: 'exito' | 'error';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ast?: any;
  error?: string;
}

export const interpretarCodigo = async (codigo: string): Promise<InterpretarResponse> => {
  try {
    const response = await fetch(`${API_URL}/interpretar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codigo }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error interpretando código:', error);
    return {
      estado: 'error',
      error: 'Error de conexión con el servidor',
    };
  }
};

export const obtenerAST = async (codigo: string): Promise<ASTResponse> => {
  try {
    const response = await fetch(`${API_URL}/ast?codigo=${encodeURIComponent(codigo)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo AST:', error);
    return {
      estado: 'error',
      error: 'Error de conexión con el servidor',
    };
  }
};
