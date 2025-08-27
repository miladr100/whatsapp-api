import express from 'express';
import { processIncomingMessage } from '../utils/functions';

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // 🔎 Tenta identificar formato WAHA
    const isWaha = req.body && req.body.event === "message" && req.body.payload;

    let from: string;
    let bodyText: string;
    let name: string;
    let type: "chat" | "media" | string;
    let messageId: string;
    let sessionId: string;

    if (isWaha) {
      // --------- Webhook WAHA ---------
      const payload = req.body.payload;
      if (!payload) {
        return res.status(400).json({ error: "Payload ausente no webhook" });
      }

      from = String(payload.from || "");
      bodyText = String(payload.body || "");
      const hasMedia = !!payload.hasMedia;
      type = hasMedia ? "media" : "chat";
      messageId = String(payload.id || Date.now().toString());
      sessionId = String(req.body.session || "default");

      // Nome do remetente: tenta notifyName, depois parte do JID, depois fallback
      name =
        payload._data?.notifyName ||
        from.split("@")[0] ||
        req.body.me?.pushName ||
        "Desconhecido";

      if (!from) {
        return res.status(400).json({ error: "Campo 'from' ausente no webhook" });
      }

      // Logs úteis (curtos)
      console.log("📥 WAHA webhook:", {
        from,
        body: bodyText.slice(0, 80),
        type,
      });
    } else {
      // --------- Chamada direta (REST) ---------
      from = String(req.body.from || "");
      bodyText = String(req.body.body || "");
      type = String(req.body.type || "chat");
      messageId = String(req.body.messageId || Date.now().toString());
      sessionId = String(req.body.sessionId || "default");
      name = String(req.body.name || from.split("@")[0] || "Desconhecido");

      if (!from || !bodyText) {
        return res.status(400).json({
          error: "Campos obrigatórios ausentes (from, body)",
        });
      }

      console.log("📥 Direct call:", {
        from,
        body: bodyText.slice(0, 80),
        type,
        sessionId,
      });
    }

    // ✅ Envia para processamento (não aguarda)
    // Ajuste a assinatura se seu processador aceitar um objeto
    processIncomingMessage(from, bodyText, name, type, messageId, sessionId);

    // ✅ Responde imediatamente para não bloquear o provedor do webhook
    return res.json({
      success: true,
      source: isWaha ? "webhook" : "direct",
      data: {
        from,
        name,
        type,
        messageId,
        sessionId,
        hasText: bodyText.length > 0,
      },
    });
  } catch (err) {
    console.error("❌ Erro ao processar mensagem:", err);
    return res.status(500).json({
      error: "Erro interno do servidor",
      details: err instanceof Error ? err.message : "Erro desconhecido",
    });
  }
});

export default router;