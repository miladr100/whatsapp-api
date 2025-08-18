import React, { useState } from 'react';
import { QRCodeDisplay } from './QRCodeDisplay';

export function WhatsAppStatus() {
  const [sessionId, setSessionId] = useState('default');
  const [inputSessionId, setInputSessionId] = useState('default');

  const handleSessionChange = () => {
    setSessionId(inputSessionId);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Status do WhatsApp
        </h2>
        
        <div className="mb-4">
          <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
            ID da Sessão:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="sessionId"
              value={inputSessionId}
              onChange={(e) => setInputSessionId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o ID da sessão"
            />
            <button
              onClick={handleSessionChange}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Atualizar
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Sessão atual: <span className="font-mono font-semibold">{sessionId}</span>
          </p>
        </div>
      </div>

      {/* Componente do QR Code */}
      <QRCodeDisplay sessionId={sessionId} className="bg-white rounded-lg shadow-lg" />
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Este componente mostra o status da conexão do WhatsApp em tempo real</p>
        <p>O QR Code é atualizado automaticamente quando necessário</p>
      </div>
    </div>
  );
}
