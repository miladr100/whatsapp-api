import express from 'express';
import { handleMondayNewTask, getContactByPhone } from '../utils/functions';
import { API_KEY } from '../env';

const router = express.Router();

// Função para formatar o formulário como string
function formatFormAsString(form: any): string {
  if (!form || typeof form !== 'object') {
    console.warn('⚠️ Formulário não é um objeto válido:', form);
    return 'Formulário não disponível';
  }

  const fields = [];
  
  if (form.nome_solicitante) fields.push(`Nome: ${form.nome_solicitante}`);
  if (form.empresa) fields.push(`Empresa: ${form.empresa}`);
  if (form.email) fields.push(`Email: ${form.email}`);
  if (form.telefone_contato) fields.push(`Telefone: ${form.telefone_contato}`);
  if (form.local_servico) fields.push(`Local do Serviço: ${form.local_servico}`);
  if (form.tamanho_area_pesquisa) fields.push(`Tamanho da Área: ${form.tamanho_area_pesquisa}`);
  if (form.previsao_realizacao_servico) fields.push(`Previsão: ${form.previsao_realizacao_servico}`);
  if (form.observacoes) fields.push(`Observações: ${form.observacoes}`);
  
  return fields.length > 0 ? fields.join('\n') : 'Formulário vazio';
}

router.post("/", async (req, res) => {
  try {
    const { phone } = req.body;

    // Validar se o telefone foi fornecido
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      console.error("❌ Telefone não fornecido ou inválido");
      return res.status(400).json({
        error: "Telefone obrigatório",
        details: "O campo 'phone' deve ser fornecido na requisição"
      });
    }

    const contactResult = await getContactByPhone(phone);
    
    if (!contactResult.success) {
      console.error(`❌ Erro ao buscar contato: ${contactResult.message}`);
      return res.status(404).json({
        error: "Contato não encontrado",
        details: contactResult.message
      });
    }

    const contact = contactResult.contact;

    // Validar se o contato foi retornado corretamente
    if (!contact) {
      console.error(`❌ Contato é null ou undefined para telefone: ${phone}`);
      return res.status(404).json({
        error: "Contato não encontrado",
        details: "O contato não foi encontrado no banco de dados"
      });
    }

    // Validar se o contato tem as informações necessárias
    if (!contact.form) {
      console.error(`❌ Contato ${phone} não possui formulário preenchido`);
      return res.status(400).json({
        error: "Formulário não encontrado",
        details: "O contato não possui formulário preenchido"
      });
    }

    if (!contact.service) {
      console.error(`❌ Contato ${phone} não possui serviço definido`);
      return res.status(400).json({
        error: "Serviço não definido",
        details: "O contato não possui serviço definido"
      });
    }

    // Validar se o formulário não está vazio
    if (typeof contact.form === 'object' && Object.keys(contact.form).length === 0) {
      console.error(`❌ Contato ${phone} possui formulário vazio`);
      return res.status(400).json({
        error: "Formulário vazio",
        details: "O formulário do contato está vazio"
      });
    }

    try {
      // Formatar o formulário como string para o comentário
      const formattedForm = formatFormAsString(contact.form);

      // Criar a tarefa no Monday usando os dados do contato
      await handleMondayNewTask(contact.phone, contact.whatsappName, formattedForm, contact.service);

      return res.status(200).json({
        message: "Tarefa processada com sucesso",
        contact: {
          name: contact.whatsappName,
          phone: contact.phone,
          service: contact.service
        }
      });
    } catch (taskError) {
      console.error(`❌ Erro ao criar tarefa para ${contact.whatsappName}:`, taskError);
      return res.status(500).json({
        error: "Erro ao criar tarefa no Monday",
        details: taskError instanceof Error ? taskError.message : "Erro desconhecido ao criar tarefa"
      });
    }

  } catch (err) {
    console.error("❌ Erro ao processar tarefa:", err);
    return res.status(500).json({
      error: "Erro interno do servidor",
      details: err instanceof Error ? err.message : "Erro desconhecido",
    });
  }
});

export default router;