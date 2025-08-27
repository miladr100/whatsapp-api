'use client';
// pages
import { useEffect, useState } from 'react';
import { messageApi, fetchSessionInfo } from "@/utils/functions";
import { getDefaultSessionId, getApiKey, getApiBaseUrl } from "@/utils/config";
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
  const apiBaseUrl = getApiBaseUrl();

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
    fetch(messageApi('/contacts?all=true'))
      .then(res => res.json())
      .then(data => {
        setAllContacts(data || []);
        console.log("Todos os contatos carregados:", data);
        return data.filter((c: ClientContact) => c.block);
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
    const res = await fetch(messageApi('/block-contact'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(messageApi(`/contacts?phone=${phone}`), { method: 'DELETE' });
    const resesponse = await res.json();
    if (resesponse.success) {
      setContacts(prev => prev.filter(c => c.phone !== phone));
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
      <div className="session-info">
        {sessionInfo ? (
          <>
            <h3>✅ Sessão Conectada</h3>
            <p><strong>Nome:</strong> {sessionInfo?.pushName || 'N/A'}</p>
            <p><strong>Telefone:</strong> {sessionInfo?.id || 'N/A'}</p>
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
      </div>
    );
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
                placeholder="Nome (opcional)"
                value={whatsappName}
                onChange={e => setWhatsappName(e.target.value)}
                className="form-input"
              />
              <input
                type="text"
                placeholder="Número de telefone"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="form-input"
              />
            </div>
            <button onClick={handleBlockContact} className="form-button add">
              Adicionar
            </button>
          </div>

          <ul className="contacts-table">
            {contacts.map(contact => (
              <li key={contact.phone} className="contacts-item">
                <div><strong>Número:</strong> {contact?.phone?.split('@')?.[0]}</div>
                {contact.whatsappName && <div><strong>Nome:</strong> {contact.whatsappName}</div>}
                <button
                  onClick={() => handleDeleteContact(contact.phone)}
                  className="remove-button"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        isServerOnline ? <h2 className="page-container">Carregando...</h2> : <h2 className="page-container">Servidor offline. Verifique a conexão do servidor.</h2>
      )}
    </>
  );
}
