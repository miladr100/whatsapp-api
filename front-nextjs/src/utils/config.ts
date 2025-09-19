// Configuração das variáveis de ambiente
export const config = {
  // Configuração do ambiente de desenvolvimento
  NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || 'dev',

  // API key
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || 'api-key',
  
  // ID da sessão padrão
  DEFAULT_SESSION_ID: process.env.NEXT_PUBLIC_DEFAULT_SESSION_ID || 'default',
  
  // URLs da API (Backend roda na porta 3001)
  WHATSAPP_API_BASE_URL_LOCAL: process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL_LOCAL || 'http://localhost:7000',
  WHATSAPP_API_BASE_URL: process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL || 'https://sua-api-whatsapp-producao.com',
  
  // URLs da API de mensagens (se necessário)
  MESSAGE_API_BASE_URL_LOCAL: process.env.NEXT_PUBLIC_MESSAGE_API_BASE_URL_LOCAL || 'http://localhost:3001',
  MESSAGE_API_BASE_URL: process.env.NEXT_PUBLIC_MESSAGE_API_BASE_URL || 'https://sua-api-mensagens-producao.com'
};

// Função para obter a URL base da API baseada no ambiente
export const getWhatsappApiBaseUrl = () => {
  return config.NODE_ENV === 'dev' ? config.WHATSAPP_API_BASE_URL_LOCAL : config.WHATSAPP_API_BASE_URL;
};

// Função para obter a URL base da API de mensagens baseada no ambiente
export const getMessageApiBaseUrl = () => {
  return config.NODE_ENV === 'dev' ? config.MESSAGE_API_BASE_URL_LOCAL : config.MESSAGE_API_BASE_URL;
};

// Função para obter o ID da sessão padrão
export const getDefaultSessionId = () => {
  return config.DEFAULT_SESSION_ID;
};

// Função para obter a API key
export const getApiKey = () => {
  return config.API_KEY;
};
