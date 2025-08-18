import React from 'react';
import { useQRCode } from '../hooks/useQRCode';

interface QRCodeDisplayProps {
  sessionId: string;
  className?: string;
}

export function QRCodeDisplay({ sessionId, className = '' }: QRCodeDisplayProps) {
  const { qrCode, isLoading, error, hasQR, refreshQR } = useQRCode(sessionId);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Carregando QR Code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <p className="text-red-600 text-center mb-4">{error}</p>
        <button
          onClick={refreshQR}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!hasQR) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <p className="text-green-600 text-center text-lg font-semibold">
          WhatsApp Conectado!
        </p>
        <p className="text-gray-600 text-center mt-2">
          Seu WhatsApp está funcionando normalmente
        </p>
      </div>
    );
  }

  if (qrCode) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="text-blue-500 text-6xl mb-4">📱</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Escaneie o QR Code
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Abra o WhatsApp no seu celular e escaneie o código abaixo
        </p>
        
        <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code WhatsApp"
            className="w-64 h-64"
          />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            QR Code válido por 2 minutos
          </p>
          <button
            onClick={refreshQR}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Atualizar QR Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className="text-gray-400 text-6xl mb-4">⏳</div>
      <p className="text-gray-600 text-center">
        Aguardando QR Code...
      </p>
    </div>
  );
}
