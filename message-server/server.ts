import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from "http";
import { FRONT_URL, MESSAGE_PORT } from './env';
import { connectMongo } from './utils/mongo';
import { apiKeyAuth } from './middleware/auth';

import contactsRoutes from './routes/contacts';
import createNewTaskRoutes from './routes/create-new-task';
import createMondayTaskRoutes from './routes/create-monday-task';
import addMondayCommentRoutes from './routes/add-monday-comment';
import blockContactRoutes from './routes/block-contact';
import cleanContactsRoutes from './routes/clean-contacts';
import ping from './routes/ping';

async function start() {
  await connectMongo();

  const app = express();
  app.use(cors({ origin: FRONT_URL }));
  app.use(bodyParser.json());

  // Rota pública - sem autenticação
  app.use('/api/ping', ping);

  // Aplicar autenticação a todas as outras rotas
  app.use('/api/contacts', apiKeyAuth, contactsRoutes);
  app.use('/api/create-new-task', apiKeyAuth, createNewTaskRoutes);
  app.use('/api/create-monday-task', apiKeyAuth, createMondayTaskRoutes);
  app.use('/api/add-monday-comment', apiKeyAuth, addMondayCommentRoutes);
  app.use('/api/block-contact', apiKeyAuth, blockContactRoutes);
  app.use('/api/clean-contacts', apiKeyAuth, cleanContactsRoutes);

  const httpServer = createServer(app);

  httpServer.listen(MESSAGE_PORT, () => {
    console.log(`🚀 Servidor de mensagens rodando na porta ${MESSAGE_PORT}`);
  });
}

start();
