'use client';

import { useEffect, useState, useCallback } from 'react';
import { WHATSAPP_STATES, STATUS_CLASS } from "@/utils/consts";
import { api, getStatusText, formatPhoneNumber, validatePhoneNumber, fetchSessionInfo } from "@/utils/functions";
import { getDefaultSessionId, getApiKey } from "@/utils/config";
import { useQRCode } from "@/hooks/useQRCode";
import { WhatsAppStatus, Message, SessionInfo } from '@/utils/types';
import './page.css';

export default function Home() {
  // ===== ESTADOS =====
  const [status, setStatus] = useState<WhatsAppStatus>('loading');
  const [message, setMessage] = useState<Message>({ number: "55", message: "" });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [phoneError, setPhoneError] = useState<string>('');

  // ===== CONFIGURAÇÕES =====
  const sessionId = getDefaultSessionId();
  const apiKey = getApiKey();
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  };

  // ===== HOOKS =====
  const { 
    qrImage, 
    isLoading: loadingQR, 
    error: qrError, 
    refreshQR,
    deleteQRCode
  } = useQRCode(sessionId, 3000, status);

  // ===== EFEITOS =====
  
  // Debug: Log do estado do QR Code (apenas quando realmente muda)
  useEffect(() => {
    console.log('🔍 Estado do QR Code atualizado:', {
      qrImage: qrImage ? 'Imagem gerada' : 'Sem imagem',
      loadingQR,
      error: qrError,
      sessionId,
      whatsappStatus: status
    });
  }, [qrImage, loadingQR, qrError, sessionId, status]);

  // Verificar status da sessão ao carregar a página
  useEffect(() => {
    if (loadingStatus) return;
    checkSessionStatus();
    
    // Polling para verificar status a cada 5 segundos
    const interval = setInterval(checkSessionStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Debug: Log do status da sessão (apenas quando muda)
  useEffect(() => {
    console.log("Estado da sessão:", status);
  }, [status]);

  // ===== FUNÇÕES DE GERENCIAMENTO DE SESSÃO =====

  /**
   * Verifica o status atual da sessão do WhatsApp
   */
  const checkSessionStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch(api(`/session/status/${sessionId}`), { headers });
      
      if (res.ok) {
        const data = await res.json();
        const state = data.state;
        const message = data.message;

        if (state === WHATSAPP_STATES.CONNECTED) {
          setStatus('connected');
          fetchSessionInfo(sessionId, apiKey, setSessionInfo);
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

  /**
   * Cria uma nova sessão do WhatsApp
   */
  const handleCreateSession = useCallback(async () => {
    setStatus('loading');
    
    try {
      // Destruir sessão existente se houver
      await destroyExistingSession();
      
      // Deletar QR Code
      deleteQRCode();
      
      // Aguardar um pouco para garantir que a sessão antiga foi destruída
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar nova sessão
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
  }, [sessionId, apiKey]); // Otimizado dependências

  /**
   * Destrói a sessão atual
   */
  const handleDestroySession = useCallback(async () => {
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
  }, [sessionId, apiKey]); // Otimizado dependências

  /**
   * Gera um novo QR Code destruindo a sessão atual
   */
  const handleGenerateNewQR = useCallback(async () => {
    setStatus('loading');
    
    try {
      // Destruir sessão existente
      await destroyExistingSession();

      // Deletar QR Code
      deleteQRCode();
      
      // Aguardar um pouco para garantir que a sessão antiga foi destruída
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar nova sessão
      const res = await fetch(api(`/session/start/${sessionId}`), { 
        method: 'GET', 
        headers,
      });
      
      if (res.ok) {
        setStatus('uninitialized');
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
  }, [sessionId, apiKey]); // Otimizado dependências

  /**
   * Função auxiliar para destruir sessão existente
   */
  const destroyExistingSession = useCallback(async () => {
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
  }, [sessionId, apiKey]); // Otimizado dependências

  // ===== FUNÇÕES DE VALIDAÇÃO E ENVIO =====

  /**
   * Valida o número de telefone informado
   */
  const checkPhone = (phone: string): boolean => {
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

  /**
   * Envia mensagem de teste para o número especificado
   */
  const handleSendTest = useCallback(async () => {
    if (!message.message.trim()) {
      alert('Por favor, preencha a mensagem.');
      return;
    }

    if (!checkPhone(message.number)) {
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
  }, [message.message, message.number, status, sessionInfo, sessionId, apiKey]); // Otimizado dependências

  // ===== COMPONENTES DE INTERFACE =====

  /**
   * Componente para exibir informações da sessão
   */
  const SessionInfoDisplay = () => {
    if (status !== 'connected' || !sessionInfo) return null;
    
    return (
      <div className="session-info">
        <h3>Informações da Sessão</h3>
        <p><strong>Nome:</strong> {sessionInfo.pushname || 'N/A'}</p>
        <p><strong>Telefone:</strong> {sessionInfo.wid?.user || 'N/A'}</p>
        <p><strong>Plataforma:</strong> {sessionInfo.platform || 'N/A'}</p>
        <p><strong>ID da Sessão:</strong> {sessionId}</p>
      </div>
    );
  };

  /**
   * Componente para exibir botões de ação
   */
  const ActionButtons = () => (
    <div className="button-group">
      {status === 'connected' && (
        <button onClick={handleDestroySession} className="button red">
          Destruir Sessão
        </button>
      )}
      
      {status === 'disconnected' && (
        <button onClick={handleCreateSession} className="button blue">
          Criar/Recriar Sessão
        </button>
      )}
    </div>
  );

  /**
   * Componente para exibir o QR Code
   */
  const QRCodeDisplay = () => {
    // Mostrar QR Code quando há imagem OU quando está aguardando conexão
    if (status !== 'waiting' && status !== 'uninitialized') return null;

    return (
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
              <p>
                {status === 'waiting' ? 'Aguardando QR Code...' : 'Gerando QR Code...'}
              </p>
            </div>
          )}
        </div>
        
        <div className="qr-actions">
          <p className="qr-info">
            {qrImage ? 'QR Code válido por 2 minutos' : 'QR Code sendo gerado...'}
          </p>
          <button onClick={refreshQR} className="button blue">
            Atualizar QR Code
          </button>
          <button onClick={handleGenerateNewQR} className="button gray">
            Recriar Sessão
          </button>
          <p className="qr-note">
            Recriar Sessão irá destruir a atual e gerar um novo QR Code
          </p>
        </div>
      </div>
    );
  };

  /**
   * Componente para exibir erros do QR Code
   */
  const QRCodeError = () => {
    if (!qrError) return null;

    return (
      <div className="qrcode-box error">
        <div className="error-qr">
          <span className="error-icon">❌</span>
          <p className="error-message">{qrError}</p>
          <button onClick={refreshQR} className="button blue">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  };

  /**
   * Componente para o formulário de envio de mensagem
   */
  const MessageForm = () => {
    if (status !== 'connected') return null;

    return (
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
    );
  };

  // ===== RENDERIZAÇÃO PRINCIPAL =====
  
  return (
    <div className="container">
      <h1 className="title">GeoView Conexão com WhatsApp</h1>

      {/* Status da conexão */}
      <div className={`status ${STATUS_CLASS[status]}`}>
        {getStatusText(status)}
        {loadingStatus && <span className="loading-indicator">🔄</span>}
      </div>

      {/* Informações da sessão */}
      <SessionInfoDisplay />

      {/* Botões de ação */}
      <ActionButtons />

      {/* QR Code e componentes relacionados */}
      <QRCodeDisplay />
      <QRCodeError />

      {/* Formulário de mensagem */}
      <MessageForm />

      {/* Verificação manual de status */}
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
