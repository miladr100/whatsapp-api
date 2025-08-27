import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Função para obter variável de ambiente com valor padrão
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Variável de ambiente ${key} não encontrada`);
  }
  return value || defaultValue!;
}

// Função para obter a URL correta do frontend baseada no ambiente
function getFrontendUrl(): string {
  const environment = getEnvVar('ENVIRONMENT', 'dev');
  
  if (environment === 'dev' || environment === 'development') {
    // Em desenvolvimento, usar localhost
    return process.env.FRONT_URL_DEV!;
  } else {
    // Em produção, usar a primeira URL do array FRONT_URL
    return process.env.FRONT_URL_PROD!;
  }
}

export const MONGO_URL = getEnvVar('MONGO_URL');
export const FRONT_URL = getFrontendUrl();
export const MONDAY_API_TOKEN = getEnvVar('MONDAY_API_TOKEN');
export const ENVIRONMENT = getEnvVar('ENVIRONMENT', 'dev');
export const MESSAGE_PORT = getEnvVar('MESSAGE_PORT', '3002');
export const API_KEY = process.env.API_KEY!;
export const WHATSAPP_API_BASE_URL = process.env.WHATSAPP_API_BASE_URL!;
