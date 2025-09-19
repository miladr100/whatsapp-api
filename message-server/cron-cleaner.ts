// cron-cleaner.ts
import mongoose from "mongoose";
import cron from "node-cron";
import { API_KEY, MONGO_URL } from './env';
import { API_URL } from "./utils/consts";

if (!MONGO_URL) {
  console.error("❌ MONGO_URI não definido no env");
  process.exit(1);
}

async function connectIfNotConnected() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URL);
  }
}

// 🔁 Executa a cada 1 hora
cron.schedule("0 * * * *", async () => {
  try {
    const contactsResult = await fetch(`${API_URL}/api/clean-contacts`, { headers: { 'x-api-key': API_KEY } }).then(res => res.json());

    console.log(`✅ Limpeza concluída: ${contactsResult.deletedContactsCount} contatos e ${contactsResult.deletedMessagesCount} mensagens removidos.`);
  } catch (err) {
    console.error("❌ Erro ao apagar documentos:", err);
  }
});

// 🔌 Inicia a conexão e mantém o processo rodando
async function start() {
  try {
    await connectIfNotConnected();
    console.log("✅ Conectado ao MongoDB. Aguardando agendador...");
  } catch (err) {
    console.error("❌ Erro ao conectar no MongoDB:", err);
    process.exit(1);
  }
}

start();
