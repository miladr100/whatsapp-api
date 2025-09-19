import { BOARD_CODES } from "./consts";
import { MESSAGE_PORT } from '../env';

const API_URL = `http://localhost:${MESSAGE_PORT}`;

export async function getContactByPhone(phone: string) {
  try {
    console.log(`🔍 Buscando contato para telefone: ${phone}`);
    const response = await fetch(`${API_URL}/api/contacts?phone=${encodeURIComponent(phone)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log(`📡 Resposta do endpoint contacts: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const contact = await response.json();
      console.log(`📋 Dados retornados do banco:`, contact);
      
      // Verificar se o contato foi encontrado (não é null)
      if (contact && contact.phone && contact.phone.trim()) {
        console.log(`✅ Contato encontrado: ${contact.whatsappName} (${contact.phone})`);
        return { success: true, contact };
      } else {
        console.log(`❌ Contato não encontrado ou dados inválidos para telefone: ${phone}`);
        return { success: false, message: `Contato não encontrado para o telefone: ${phone}` };
      }
    } else {
      console.error(`❌ Erro HTTP ao buscar contato: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => null);
      console.error(`❌ Detalhes do erro:`, errorData);
      return { success: false, message: `Erro ao buscar contato: ${response.status} ${response.statusText}` };
    }
  } catch (err) {
    console.error("❌ Erro ao buscar contato:", err);
    return { success: false, message: `Erro ao buscar contato: ${err instanceof Error ? err.message : "Erro desconhecido"}` };
  }
}

export async function createNewContact(name: string, number: string) {
  try {
    await fetch(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whatsappName: name,
        phone: number,
        status: "aguardando_opcao"
      }),
    });
  } catch (err) {
    console.error("Erro ao criar contato:", err);
  }
}

export async function updateContact(number: string, content: string, service: string, status: string, boardId?: string, groupId?: string) {
  try {
    await fetch(`${API_URL}/api/contacts`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          phone: number,
          form: content,
          status,
          service,
          boardId,
          groupId
        }
      ),
    });
  } catch (err) {
    console.error("Erro ao atualizar contato", err);
  }
}

export async function createMondayTask(name: string, boardId: number, groupId: string, boardCode: string) {
  const date = new Date();
  const year = date.getFullYear();
  const shortYear = year.toString().slice(-2);
  try {
    const response = await fetch(`${API_URL}/api/create-monday-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskName: `GEOV0000-${shortYear}.${name}.${boardCode}`,
        boardId,
        groupId
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar tarefa no Monday:", error);
    return { success: false, message: "Erro ao criar tarefa no Monday." };
  }
}

export async function createMondayTaskComment(phone: string, name: string, form: string, itemId: number) {
  const data = new Date();
  const beautifiedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
    hour12: false,
  }).format(data);
  const comment = `Proposta enviada por ${name} (${phone})\n\nData: ${beautifiedDate}\n\n${form}`;
  try {
    const response = await fetch(`${API_URL}/api/add-monday-comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId,
        description: comment
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    return { success: false, message: "Erro ao adicionar comentário." };
  }
}

export async function handleMondayNewTask(phone: string, name: string, form: string, task: string) {
  const boardItem = BOARD_CODES[task as keyof typeof BOARD_CODES];
  if (!boardItem) {
    console.error(`Erro: quadro inválido ${task}`);
    return;
  }
  const formattedPhone = phone.replace(/\D/g, '');
  const taskResponse = await createMondayTask(name, boardItem.id, boardItem.group.id, boardItem.code);

  if (taskResponse?.success && taskResponse?.itemId) {
    console.log("Tarefa criada com sucesso no Monday.");
    const commentResponse = await createMondayTaskComment(formattedPhone, name, form, taskResponse.itemId);
    if (commentResponse?.success) {
      console.log("Comentário criado com sucesso no Monday.");
    } else {
      console.error("Erro ao adicionar comentário:", commentResponse?.message);
    }

    await updateContact(phone, form, task, 'tarefa_criada', boardItem.id.toString(), boardItem.group.id.toString());
  } else {
    console.error("Erro ao criar tarefa:", taskResponse.message);
  }
}