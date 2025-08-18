'use client';

import { useEffect, useState } from 'react';
import { WHATSAPP_STATES, STATUS_CLASS } from "@/utils/consts";
import { api, getStatusText, formatPhoneNumber, validatePhoneNumber } from "@/utils/functions";
import { getDefaultSessionId, getApiKey } from "@/utils/config";
import { useQRCode } from "@/hooks/useQRCode";
import './page.css';

export default function Home() {
  const [status, setStatus] = useState<'connected' | 'waiting' | 'disconnected' | 'reconnecting' | 'uninitialized' | 'loading'>('loading');
  const [message, setMessage] = useState({ number: "55", message: "" });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [phoneError, setPhoneError] = useState<string>('');

  // Obter ID da sessão e API key da configuração
  const sessionId = getDefaultSessionId();
  const apiKey = getApiKey();
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  };

  // Usar o novo hook de QR Code
  const { qrCode, qrImage, isLoading: loadingQR, error: qrError, hasQR, refreshQR } = useQRCode(sessionId, 3000, status);

  // Debug: Log do estado do QR Code
  useEffect(() => {
    console.log('🔍 Estado do QR Code atualizado:', {
      hasQR,
      qrCode: qrCode ? 'Disponível' : 'Não disponível',
      qrImage: qrImage ? 'Imagem gerada' : 'Sem imagem',
      loadingQR,
      error: qrError,
      sessionId,
      whatsappStatus: status
    });
  }, [hasQR, qrCode, qrImage, loadingQR, qrError, sessionId, status]);

  // Função para verificar o status da sessão
  const checkSessionStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch(api(`/session/status/${sessionId}`), { 
        headers,
      });
      
      if (res.ok) {
        const data = await res.json();
        const state = data.state;
        const message = data.message;
        console.log("Estado da sessão:", state);

        if (state === WHATSAPP_STATES.CONNECTED) {
          setStatus('connected');
          // Buscar informações da sessão
          fetchSessionInfo();
        } else if (
          state === WHATSAPP_STATES.UNPAIRED ||
          state === WHATSAPP_STATES.UNPAIRED_IDLE ||
          state === WHATSAPP_STATES.PAIRING ||
          message === "session_not_connected" ||
          message === "session_not_authenticated" ||
          message === "session_not_paired"
        ) {
          setStatus('waiting');
        } else if (
          state === WHATSAPP_STATES.OPENING ||
          state === WHATSAPP_STATES.CONFLICT
        ) {
          setStatus('loading');
        } else {
          setStatus('disconnected');
        }
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setStatus('disconnected');
    } finally {
      setLoadingStatus(false);
    }
  };

  // Função para buscar informações da sessão
  const fetchSessionInfo = async () => {
    try {
      const res = await fetch(api(`/client/getClassInfo/${sessionId}`), { 
        headers: {
          'x-api-key': apiKey
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSessionInfo(data.sessionInfo);
      }
    } catch (error) {
      console.error('Erro ao buscar informações da sessão:', error);
    }
  };

  // Verificar status da sessão ao carregar a página
  useEffect(() => {
    checkSessionStatus();
    
    // Polling para verificar status a cada 5 segundos
    const interval = setInterval(checkSessionStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Função para criar nova sessão
  const handleCreateSession = async () => {
    setStatus('loading');
    
    try {
      // Primeiro, tentar destruir a sessão existente se houver
      try {
        const destroyRes = await fetch(api(`/session/terminate/${sessionId}`), { 
          method: 'GET', 
          headers,
        });
        
        if (destroyRes.ok) {
          console.log('✅ Sessão antiga destruída com sucesso');
        } else {
          console.log('⚠️ Não foi possível destruir sessão antiga, continuando...');
        }
      } catch (destroyError) {
        console.log('⚠️ Erro ao destruir sessão antiga, continuando...', destroyError);
      }

      // Aguardar um pouco para garantir que a sessão antiga foi destruída
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Agora criar a nova sessão
      const res = await fetch(api(`/session/start/${sessionId}`), { 
        method: 'GET', 
        headers,
      });
      
      if (res.ok) {
        setStatus('uninitialized');
        // Aguardar um pouco e verificar status
        setTimeout(() => {
          checkSessionStatus();
        }, 2000);
      } else {
        throw new Error('Falha ao criar sessão');
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      alert('Erro ao criar sessão. Tente novamente.');
      setStatus('disconnected');
    }
  };

  // Função para destruir sessão
  const handleDestroySession = async () => {
    try {
      const res = await fetch(api(`/session/terminate/${sessionId}`), { 
        method: 'GET', 
        headers,
      });
      
      if (res.ok) {
        setStatus('disconnected');
        setSessionInfo(null);
        alert('Sessão destruída com sucesso!');
      } else {
        throw new Error('Falha ao destruir sessão');
      }
    } catch (error) {
      console.error('Erro ao destruir sessão:', error);
      alert('Erro ao destruir sessão. Tente novamente.');
    }
  };

  // Função para gerar novo QR code
  const handleGenerateNewQR = async () => {
    setStatus('loading');
    
    try {
      // Primeiro, tentar destruir a sessão existente se houver
      try {
        const destroyRes = await fetch(api(`/session/terminate/${sessionId}`), { 
          method: 'GET', 
          headers,
        });
        
        if (destroyRes.ok) {
          alert('✅ Sessão antiga encerrada para gerar novo QR Code');
        } else {
          alert('⚠️ Não foi possível encerrar sessão antiga, continuando...');
        }
      } catch (destroyError) {
        alert('⚠️ Erro ao encerrar sessão antiga, continuando...');
      }

      // Aguardar um pouco para garantir que a sessão antiga foi destruída
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Agora criar a nova sessão
      const res = await fetch(api(`/session/start/${sessionId}`), { 
        method: 'GET', 
        headers,
      });
      
      if (res.ok) {
        setStatus('uninitialized');
        // Aguardar um pouco e verificar status
        setTimeout(() => {
          checkSessionStatus();
        }, 2000);
      } else {
        throw new Error('Falha ao gerar novo QR Code');
      }
    } catch (error) {
      console.error('Erro ao gerar novo QR Code:', error);
      alert('Erro ao gerar novo QR Code. Tente novamente.');
      setStatus('disconnected');
    }
  };

  // Função para validar número de telefone
  const validatePhone = (phone: string) => {
    if (!phone) {
      setPhoneError('Número de telefone é obrigatório');
      return false;
    }
    
    if (!validatePhoneNumber(phone)) {
      setPhoneError('Número de telefone inválido');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  // Função para enviar mensagem de teste
  const handleSendTest = async () => {
    if (!message.message.trim()) {
      alert('Por favor, preencha a mensagem.');
      return;
    }

    if (!validatePhone(message.number)) {
      return;
    }

    // Verificar se a sessão está realmente pronta
    if (status !== 'connected' || !sessionInfo) {
      alert('Sessão não está pronta. Aguarde a conexão completa.');
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(message.number);
      const requestBody = {
        chatId: formattedPhone,
        contentType: 'string',
        content: message.message.trim()
      };

      const res = await fetch(api(`/client/sendMessage/${sessionId}`), {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody), 
      });

      if (res.ok) {
        alert('✅ Mensagem enviada com sucesso!');
        setMessage({ number: message.number, message: "" });
        setPhoneError('');
      } else {
        const errorData = await res.json();
        console.error('❌ Erro detalhado:', {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        });
        alert(`❌ Erro ao enviar mensagem: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  return (
    <div className="container">
      <h1 className="title">GeoView Conexão com WhatsApp</h1>

      <div className={`status ${STATUS_CLASS[status]}`}>
        {getStatusText(status)}
        {loadingStatus && <span className="loading-indicator">🔄</span>}
      </div>

      {/* Informações da sessão quando conectado */}
      {status === 'connected' && sessionInfo && (
        <div className="session-info">
          <h3>Informações da Sessão</h3>
          <p><strong>Nome:</strong> {sessionInfo.pushname || 'N/A'}</p>
          <p><strong>Telefone:</strong> {sessionInfo.wid?.user || 'N/A'}</p>
          <p><strong>Plataforma:</strong> {sessionInfo.platform || 'N/A'}</p>
          <p><strong>ID da Sessão:</strong> {sessionId}</p>
        </div>
      )}

      <div className="button-group">
        {status === 'connected' && (
          <button onClick={handleDestroySession} className="button red">
            Destruir Sessão
          </button>
        )}
        
        {status === 'disconnected' && (
          <button
            onClick={handleCreateSession}
            className="button blue"
          >
            Criar/Recriar Sessão
          </button>
        )}
      </div>

      {/* QR Code - Nova implementação */}
      {hasQR && qrCode && (
        <div className="qrcode-box">
          <h3>📱 Escaneie o QR Code</h3>
          <p className="qr-instructions">
            Abra o WhatsApp no seu celular e escaneie o código abaixo
          </p>
          
          <div className="qr-container">
            {qrImage ? (
              <img 
                src={qrImage} 
                alt="QR Code WhatsApp" 
                className="qrcode" 
              />
            ) : (
              <div className="qr-placeholder">
                <span className="qr-icon">📱</span>
                <p>Gerando QR Code...</p>
              </div>
            )}
          </div>
          
          <div className="qr-actions">
            <p className="qr-info">QR Code válido por 2 minutos</p>
            <button
              onClick={refreshQR}
              className="button blue"
            >
              Atualizar QR Code
            </button>
            <button
              onClick={handleGenerateNewQR}
              className="button gray"
            >
              Recriar Sessão
            </button>
            <p className="qr-note">Recriar Sessão irá destruir a atual e gerar um novo QR Code</p>
          </div>
        </div>
      )}

      {/* Status de carregamento do QR Code */}
      {loadingQR && (
        <div className="qrcode-box">
          <div className="loading-qr">
            <div className="spinner"></div>
            <p>Carregando QR Code...</p>
          </div>
        </div>
      )}

      {/* Erro no QR Code */}
      {qrError && (
        <div className="qrcode-box error">
          <div className="error-qr">
            <span className="error-icon">❌</span>
            <p className="error-message">{qrError}</p>
            <button onClick={refreshQR} className="button blue">
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Formulário de mensagem de teste */}
      {status === 'connected' && (
        <div className="form">
          <h3>Enviar Mensagem de Teste</h3>
          <div className="input-group">
            <input
              value={message.number}
              onChange={(e) => {
                setMessage({ number: e.target.value, message: message.message });
                if (phoneError) setPhoneError('');
              }}
              placeholder="Número (ex: 5511999999999)"
              className={`input ${phoneError ? 'error' : ''}`}
            />
            {phoneError && <span className="error-message">{phoneError}</span>}
          </div>
          <textarea
            value={message.message}
            onChange={(e) => setMessage({ number: message.number, message: e.target.value })}
            placeholder="Mensagem de teste"
            className="textarea"
          />
          <button onClick={handleSendTest} className="button green">
            Enviar Mensagem de Teste
          </button>
        </div>
      )}

      {/* Botão para verificar status manualmente */}
      <div className="manual-check">
        <button 
          onClick={checkSessionStatus} 
          className="button gray"
          disabled={loadingStatus}
        >
          {loadingStatus ? 'Verificando...' : 'Verificar Status Manualmente'}
        </button>
      </div>
    </div>
  );
}
