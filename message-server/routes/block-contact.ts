import express, { Request, Response } from "express";
import { ZodError } from "zod";

const router = express.Router();
import { API_URL } from '../utils/consts';
import { API_KEY } from "../env";

// POST /api/contacts
router.post("/", async (req: Request, res: Response) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Número de telefone obrigatório' });
    }

    const newContact = {
        phone,
        whatsappName: name || "Desconhecido",
        status: "bloqueado",
        block: true,
        hasMedia: false,
        lastMessageId: "",
        running: false,
    };
    const result = await fetch(`${API_URL}/api/contacts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify(newContact),
    });

    if(result.ok) {
      console.log("Contato bloqueado com sucesso", phone);
      return res.json({ message: 'Contato bloqueado com sucesso', phone, whatsappName: name });
    } else {
      console.error("Erro ao bloquear contato", result.statusText);
      return res.status(500).json({ success: false, error: "Erro ao bloquear contato" });
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Erro de validação",
        issues: err.flatten(),
      });
    }

    console.error("Erro inesperado ao criar contato:", err);
    return res.status(500).json({ success: false, error: "Erro interno do servidor" });
  }
});

export default router;