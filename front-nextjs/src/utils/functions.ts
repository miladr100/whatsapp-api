import { getWhatsappApiBaseUrl, getMessageApiBaseUrl } from './config';
import { SessionInfo } from './types';

export const api = (path: string) => {
  // Remove o prefixo /api se existir
  const cleanPath = path.startsWith('/api') ? path : `/api/${path}`;
  return `${getWhatsappApiBaseUrl()}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
};

export const messageApi = (path: string) =>
  `${getMessageApiBaseUrl()}/api${path.startsWith('/') ? path : `/${path}`}`;

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

/**
 * Busca informações detalhadas da sessão conectada
 */
export const fetchSessionInfo = async (sessionId: string, apiKey: string, setSessionInfo: (sessionInfo: SessionInfo) => void) => {
  try {
    console.log("Tentando buscar informações da sessão: ", sessionId);
    const res = await fetch(api(`/api/sessions/${sessionId}`), {
      headers: { 'x-api-key': apiKey }
    });
    console.log("res: ", res);
    if (res.ok) {
      const data = await res.json();
      setSessionInfo(data?.me ? data.me : {});
    }
  } catch (error) {
    console.error('Erro ao buscar informações da sessão:', error);
  }
};