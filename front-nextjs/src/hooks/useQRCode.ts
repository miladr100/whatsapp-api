import { useState, useEffect, useCallback } from 'react';

interface UseQRCodeReturn {
  qrCode: string | null;
  qrImage: string | null;
  isLoading: boolean;
  error: string | null;
  hasQR: boolean;
  refreshQR: () => void;
}

export function useQRCode(sessionId: string, pollingInterval: number = 2000, whatsappStatus?: string): UseQRCodeReturn {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasQR, setHasQR] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const fetchQRCode = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/webhook?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.success) {
        if (data.hasQR) {
          setQrCode(data.qr);
          setQrImage(data.qrImage);
          setHasQR(true);
          setIsConnected(false); // Não está conectado se tem QR
          console.log('📱 QR Code atualizado:', data.message);
        } else {
          setQrCode(null);
          setQrImage(null);
          setHasQR(false);
          // Se não tem QR, pode estar conectado ou não
          // Vamos assumir que está conectado se não tem QR e não é erro
          if (!data.error) {
            setIsConnected(true);
            console.log('✅ WhatsApp conectado - QR Code não disponível');
          } else {
            setIsConnected(false);
            console.log('ℹ️ Status:', data.message);
          }
        }
      } else {
        setError(data.error || 'Erro ao buscar QR Code');
        setHasQR(false);
        setIsConnected(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setHasQR(false);
      setIsConnected(false);
      console.error('❌ Erro ao buscar QR Code:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const refreshQR = useCallback(() => {
    fetchQRCode();
  }, [fetchQRCode]);

  // Buscar QR Code inicial
  useEffect(() => {
    fetchQRCode();
  }, [fetchQRCode]);

  // Polling apenas quando necessário (aguardando QR Code)
  useEffect(() => {
    if (!sessionId) return;

    // Parar polling se WhatsApp estiver conectado (baseado no status da página)
    if (whatsappStatus === 'connected') {
      console.log('✅ WhatsApp conectado (status) - Parando polling do QR Code');
      return;
    }

    // Parar polling se WhatsApp estiver conectado (baseado no estado interno)
    if (isConnected) {
      console.log('✅ WhatsApp conectado (estado interno) - Parando polling do QR Code');
      return;
    }

    // Parar polling se tem QR Code (aguardando escaneamento)
    if (hasQR) {
      console.log('📱 QR Code disponível - Parando polling (aguardando escaneamento)');
      return;
    }

    console.log('🔄 WhatsApp não conectado - Iniciando polling para QR Code');
    
    const interval = setInterval(() => {
      fetchQRCode();
    }, pollingInterval);

    return () => {
      console.log('⏹️ Parando polling do QR Code');
      clearInterval(interval);
    };
  }, [sessionId, hasQR, isConnected, whatsappStatus, pollingInterval, fetchQRCode]);

  // Log quando o estado muda
  useEffect(() => {
    if (whatsappStatus === 'connected' || isConnected) {
      console.log('✅ WhatsApp conectado - Sistema em estado estável');
    } else if (hasQR) {
      console.log('📱 QR Code disponível - Aguardando escaneamento');
    } else {
      console.log('🔄 Aguardando conexão - Polling ativo para detectar mudanças');
    }
  }, [hasQR, isConnected, whatsappStatus]);

  return {
    qrCode,
    qrImage,
    isLoading,
    error,
    hasQR,
    refreshQR
  };
}
