'use client';
// pages
import { useEffect, useState } from 'react';
import { messageApi, messageApiRequest, fetchSessionInfo } from "@/utils/functions";
import { getDefaultSessionId, getApiKey, getWhatsappApiBaseUrl, getMessageApiBaseUrl } from "@/utils/config";
import { ClientContact, SessionInfo } from "@/utils/types";

import './page.css';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [allContacts, setAllContacts] = useState<ClientContact[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappName, setWhatsappName] = useState('');
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  // ===== CONFIGURAÇÕES =====
  const sessionId = getDefaultSessionId();
  const apiKey = getApiKey();
  const apiBaseUrl = getWhatsappApiBaseUrl();
  const messageApiBaseUrl = getMessageApiBaseUrl();

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(messageApi('/ping'));
        const result = await res.json();
        if (result?.ok) {
          setIsReady(true);
          fetchSessionInfo(sessionId, apiKey, setSessionInfo);
        } else {
          setIsReady(false);
          setIsServerOnline(false);
        }
      } catch (err) {
        console.error('Erro ao conectar com o servidor:', err);
        setIsReady(false);
        setIsServerOnline(false);
      }
    };

    checkServer();
  }, []);

  // Carregar contatos ao iniciar
  useEffect(() => {
    messageApiRequest('/contacts?all=true')
      .then(res => res.json())
      .then(data => {
        setAllContacts(data || []);
        console.log("Todos os contatos carregados:", data);
        return data.filter((c: ClientContact) => c.block && c.status.toLowerCase() === "bloqueado");
      })
      .then(data => setContacts(data || []))
      .catch(err => console.error('Erro ao buscar contatos', err));
  }, [isReady]);

  const handleBlockContact = async () => {
    if (!phoneNumber) {
      alert('Número de telefone é obrigatório');
      return;
    }
    const sanitizedNumber = phoneNumber.replace(/\D/g, '');
    if (!/^\d{10,}$/.test(sanitizedNumber)) {
      alert('Número inválido. Deve conter pelo menos 10 dígitos (incluindo DDD).');
      return;
    }

    // Verifica se tem DDD (2 dígitos após o código do país)
    if (!/^\d{2}\d{8,}$/.test(sanitizedNumber)) {
      alert('Número inválido. Deve conter DDD (2 dígitos) após o código do país.');
      return;
    }

    // Verifica se o contato já existe e está bloqueado
    const foundContact = allContacts.find(c => c.phone.includes(sanitizedNumber) && c.block);
    if (foundContact) {
      alert('Contato já existe e está bloqueado.');
      return;
    }
    const newDocument = {
      phone: `${sanitizedNumber}@c.us`,
      name: whatsappName || "Desconhecido",
    };
    const res = await messageApiRequest('/block-contact', {
      method: 'POST',
      body: JSON.stringify(newDocument),
    });

    if (res.ok) {
      const saved = await res.json();
      setContacts(prev => [...prev, saved]);
      setPhoneNumber('');
      setWhatsappName('');
    } else {
      console.error('Erro ao adicionar contato');
    }
  };

  const handleDeleteContact = async (phone: string) => {
    const res = await messageApiRequest(`/contacts?phone=${phone}`, { method: 'DELETE' });
    const resesponse = await res.json();
    if (resesponse.success) {
      setContacts(prev => prev.filter(c => c.phone !== phone));
      setAllContacts(prev => prev.filter(c => c.phone !== phone));
      alert(`Contato ${phone} removido com sucesso!`);
    } else {
      console.error('Erro ao remover contato');
    }
  };

  /**
 * Componente para exibir informações da sessão
 */
  const SessionInfoDisplay = () => {
    return (
      sessionInfo !== null && (<div className="session-info">
        {sessionInfo ? (
          <>
            <h3>✅ Sessão Conectada</h3>
            <p><strong>Nome:</strong> {sessionInfo?.pushName}</p>
            <p><strong>Telefone:</strong> {sessionInfo?.id}</p>
            <p><strong>ID da Sessão:</strong> {sessionId}</p>
            <a href={`${apiBaseUrl}/dashboard`} target="_blank" rel="noopener noreferrer">
              <button className="form-button add">
                Dashboard
              </button>
            </a>
          </>
        ) : (
          <h3>❌ Sessão Desconectada</h3>
        )}
      </div>));
  };

  return (
    <>
      {isReady && isServerOnline ? (
        <div className="page-container">
          <h1 className="contacts-title">Bloquear Contatos</h1>
          <div className="session-info-container">
            <SessionInfoDisplay />
          </div>

          <div className="form-container">
            <div className="form-input-container">
              <input
                type="text"
                placeholder="👤 Nome do contato (opcional)"
                value={whatsappName}
                onChange={e => setWhatsappName(e.target.value)}
                className="form-input"
              />
              <input
                type="tel"
                placeholder="📱 Número com DDD (ex: 11999999999)"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="form-input"
                pattern="[0-9]{10,15}"
              />
            </div>
            <button onClick={handleBlockContact} className="form-button add">
              🚫 Bloquear Contato
            </button>
          </div>

          <ul className="contacts-table">
            {contacts.length === 0 ? (
              <li className="contacts-item">
                <div className="contact-info">
                  <div className="contact-name">📝 Nenhum contato bloqueado</div>
                  <div className="contact-phone">Adicione contatos usando o formulário acima</div>
                </div>
              </li>
            ) : (
              contacts.map(contact => (
                <li key={contact.phone} className="contacts-item">
                  <div className="contact-info">
                    <div className="contact-name">
                      {contact.whatsappName || "Sem nome"}
                    </div>
                    <div className="contact-phone">
                      📞 {contact?.phone?.split('@')?.[0]}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(contact.phone)}
                    className="remove-button"
                    title="Remover contato da lista de bloqueados"
                  >
                    🗑️ Remover
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : (
        isServerOnline ? (
          <div className="page-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <h2>Carregando aplicação...</h2>
              <p>Conectando ao servidor de mensagens</p>
            </div>
          </div>
        ) : (
          <div className="page-container">
            <div className="error-container">
              <h2>🔌 Servidor Offline</h2>
              <p>Não foi possível conectar ao servidor de mensagens.</p>
              <p>Verifique se o servidor está rodando na porta <a href={`${messageApiBaseUrl}/api/ping`} target="_blank" rel="noopener noreferrer">{messageApiBaseUrl}</a>.</p>
            </div>
          </div>
        )
      )}
    </>
  );
}
