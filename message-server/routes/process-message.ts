import express from 'express';
import { processIncomingMessage } from '../utils/functions';
import { FRONT_URL, ENVIRONMENT } from '../env';

const router = express.Router();

// Função para enviar webhook para o frontend
async function forwardWebhookToFrontend(webhookData: any) {
  try {
    // Usar a URL correta do frontend baseada no ambiente
    const webhookUrl = `${FRONT_URL}/api/webhook`;
        
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (response.ok) {
      console.log('✅ Webhook enviado com sucesso para o frontend');
    } else {
      const errorData = await response.json();
      console.error('❌ Erro ao enviar webhook para o frontend:', response.status, errorData);
    }
  } catch (error) {
    console.error('❌ Erro ao encaminhar webhook para o frontend:', error);
  }
}

router.post('/', async (req, res) => {
  try {
    // 🔄 ENVIAR WEBHOOK ORIGINAL PARA O FRONTEND
    // Encaminhar o webhook exatamente como recebido, sem modificar
    forwardWebhookToFrontend(req.body);

    // Verificar se é uma chamada do webhook ou direta
    const isWebhookCall = req.body.dataType === 'message';
    
    let from: string;
    let body: string;
    let name: string;
    let type: string;
    let messageId: string;
    let sessionId: string;

    if (isWebhookCall) {
      // Chamada do webhook - extrair dados da mensagem
      const messageData = req.body.data?.message;
      
      if (!messageData) {
        return res.status(400).json({ 
          error: 'Dados da mensagem não encontrados no webhook' 
        });
      }

      // Extrair dados da mensagem do WhatsApp
      from = messageData.from;
      type = messageData.type;
      body = type === 'chat' ? (messageData.body || messageData.text || '') : '';
      name = messageData._data?.notifyName || messageData.from?.split('@')[0] || 'Desconhecido';
      messageId = messageData.id?._serialized || messageData.id || Date.now().toString();
      sessionId = req.body.sessionId || 'default';
      
      console.log("📱 Mensagem recebida via webhook:", {
        from,
        body: body.substring(0, 50) + (body.length > 50 ? '...' : ''),
      });
    } else {
      // Chamada direta - usar dados do body
      from = req.body.from;
      type = req.body.type;
      body = type === 'chat' ? req.body.body : '';
      name = req.body.name;
      messageId = req.body.messageId;
      sessionId = req.body.sessionId || 'default';

      if (!from || !body || !name || !messageId) {
        return res.status(400).json({ 
          error: 'Dados obrigatórios: from, body, name, messageId' 
        });
      }

      console.log("📱 Mensagem recebida diretamente:", {
        from,
        body: body.substring(0, 50) + (body.length > 50 ? '...' : ''),
        sessionId
      });
    }
    
    // Processa a mensagem de forma assíncrona
    processIncomingMessage(from, body, name, type, messageId, sessionId);

    // Responde imediatamente para não bloquear o WhatsApp
    return res.json({ 
      success: true, 
      message: 'Mensagem recebida para processamento',
      source: isWebhookCall ? 'webhook' : 'direct',
      data: {
        from,
        name,
        type,
        messageId,
        sessionId,
        bodyLength: body.length
      }
    });
  } catch (err) {
    console.error('❌ Erro ao processar mensagem:', err);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    });
  }
});

export default router;