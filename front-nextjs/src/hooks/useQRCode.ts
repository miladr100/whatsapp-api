import { useState, useEffect, useCallback } from 'react';

interface UseQRCodeReturn {
  qrImage: string | null;
  isLoading: boolean;
  error: string | null;
  refreshQR: () => void;
  deleteQRCode: () => void;
}

export function useQRCode(sessionId: string, pollingInterval: number = 2000, whatsappStatus?: string): UseQRCodeReturn {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCode = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Só mostra loading se não há QR Code atual (primeira vez)
      if (!qrImage) {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/webhook?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.success) {
        if (data.hasQR && data.qrImage) {
          // Verifica se o QR Code mudou comparando o conteúdo da imagem
          const currentQR = qrImage;
          const newQR = data.qrImage;
          
          // Se não há QR Code atual OU se o novo é diferente
          if (!currentQR || currentQR !== newQR) {
            console.log('📱 QR Code atualizado:', {
              anterior: currentQR ? 'Existia' : 'Não existia',
              novo: newQR ? 'Disponível' : 'Não disponível',
              mudou: currentQR !== newQR,
              mensagem: data.message
            });
            setQrImage(newQR);
          } else {
            console.log('📱 QR Code mantido (sem mudanças)');
          }
        } else {
          // Se não há mais QR Code, limpa o estado
          if (qrImage !== null) {
            console.log('📱 QR Code expirou ou foi removido');
            setQrImage(null);
          }
        }
      } else {
        setError(data.error || 'Erro ao buscar QR Code');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao buscar QR Code:', err);
    } finally {
      // Só esconde loading se estava mostrando
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [sessionId]); // Removido qrImage das dependências para evitar re-criação

  const refreshQR = useCallback(() => {
    fetchQRCode();
  }, [fetchQRCode]);

  const deleteQRCode = useCallback(() => {
    setQrImage(null);
  }, []);

  // Buscar QR Code inicial
  useEffect(() => {
    fetchQRCode();
  }, [fetchQRCode]);

  // Polling para manter QR Code atualizado
  useEffect(() => {
    if (!sessionId) return;

    // Parar polling apenas quando WhatsApp estiver conectado
    if (whatsappStatus === 'connected') {
      console.log('✅ WhatsApp conectado - Parando polling do QR Code');
      return;
    }

    // Parar polling quando WhatsApp estiver desconectado
    if (whatsappStatus === 'disconnected') {
      console.log('❌ WhatsApp desconectado - Parando polling do QR Code');
      return;
    }

    // IMPORTANTE: Continuar polling mesmo quando há QR Code
    // para detectar quando ele expira e é renovado automaticamente
    console.log('🔄 Iniciando polling para QR Code (incluindo quando há QR Code ativo)');
    
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🔄 [${timestamp}] Executando polling do QR Code...`);
      
      // Chamar fetchQRCode diretamente para evitar dependências circulares
      if (sessionId) {
        fetchQRCode();
      }
    }, pollingInterval);

    return () => {
      console.log('⏹️ Parando polling do QR Code');
      clearInterval(interval);
    };
  }, [sessionId, whatsappStatus, pollingInterval]); // Removido fetchQRCode das dependências

  // Log quando o estado muda
  useEffect(() => {
    if (whatsappStatus === 'connected') {
      console.log('✅ WhatsApp conectado - Sistema em estado estável');
    } else if (qrImage) {
      console.log('📱 QR Code disponível - Aguardando escaneamento (polling ativo para renovação)');
    } else {
      console.log('🔄 Aguardando QR Code - Polling ativo para detectar mudanças');
    }
  }, [qrImage, whatsappStatus]);

  return {
    qrImage,
    isLoading,
    error,
    refreshQR,
    deleteQRCode
  };
}
