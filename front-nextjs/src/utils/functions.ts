import { getApiBaseUrl, getMessageApiBaseUrl } from './config';

export const api = (path: string) => {
  // Remove o prefixo /api se existir
  const cleanPath = path.startsWith('/api') ? path.substring(4) : path;
  return `${getApiBaseUrl()}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
};

export const messageApi = (path: string) =>
  `${getMessageApiBaseUrl()}/api${path.startsWith('/') ? path : `/${path}`}`;

export const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    loading: '⌛ Carregando...',
    connected: '✅ Conectado',
    waiting: '🕒 Escaneie o QR para conectar...',
    reconnecting: '🕒 Reconectando, aguarde...',
    uninitialized: '⌛ Gerando QR Code...',
    disconnected: '❌ Desconectado'
  };
  return map[status] || 'Estado desconhecido';
};

// Função para formatar número de telefone
export const formatPhoneNumber = (phone: string) => {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Adiciona @c.us se não estiver presente
  if (cleaned && !cleaned.includes('@c.us')) {
    return `${cleaned}@c.us`;
  }
  
  return cleaned;
};

// Função para validar número de telefone
export const validatePhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};