import { Request, Response, NextFunction } from 'express';
import { API_KEY } from '../env';

export interface AuthenticatedRequest extends Request {
  isAuthenticated?: boolean;
}

/**
 * Middleware para verificar a API-KEY nos headers da requisição
 * Verifica o header 'x-api-key' ou 'authorization'
 */
export const apiKeyAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Buscar a API key nos headers possíveis
    const apiKey = req.headers['x-api-key'] || 
                   req.headers['authorization']?.replace('Bearer ', '') ||
                   req.headers['api-key'];

    // Verificar se a API key foi fornecida
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API Key obrigatória',
        message: 'Forneça uma API key válida no header x-api-key'
      });
    }

    // Verificar se a API key é válida
    if (apiKey !== API_KEY) {
      return res.status(403).json({
        success: false,
        error: 'API Key inválida',
        message: 'A API key fornecida não é válida'
      });
    }

    // Marcar a requisição como autenticada
    req.isAuthenticated = true;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao processar autenticação'
    });
  }
};

/**
 * Middleware opcional para rotas que podem ou não precisar de autenticação
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['authorization']?.replace('Bearer ', '') ||
                 req.headers['api-key'];

  if (apiKey && apiKey === API_KEY) {
    req.isAuthenticated = true;
  } else {
    req.isAuthenticated = false;
  }

  next();
};
