# 🤖 WhatsApp API - Sistema Completo de Automação

Sistema completo de automação do WhatsApp com backend de processamento de mensagens e frontend moderno em Next.js.

## 🏗️ Arquitetura do Projeto

```
whatsapp-api/
├── 📱 src/                    # API principal do WhatsApp
├── 🚀 message-server/         # Servidor de processamento de mensagens
├── 🎨 front-nextjs/          # Frontend em Next.js
├── 🐳 docker-compose.yml     # Configuração Docker
└── 📚 docs/                  # Documentação
```

## 🚀 Tecnologias Utilizadas

### Backend Principal (WhatsApp API)
- **Node.js** + **Express**
- **WhatsApp Web JS** para conexão com WhatsApp
- **MongoDB** + **Mongoose** para persistência
- **Swagger** para documentação da API

### Message Server
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** para armazenamento de contatos
- **Integração com Monday.com** para automação
- **Processamento inteligente** de mensagens

### Frontend
- **Next.js 14** com **TypeScript**
- **React Hooks** para gerenciamento de estado
- **QR Code** em tempo real para conexão
- **Interface moderna** e responsiva

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **MongoDB** 6+
- **WhatsApp** ativo no celular
- **Conta Monday.com** (para automação)

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/whatsapp-api.git
cd whatsapp-api
```

### 2. Instale as dependências do projeto principal
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com suas configurações
nano .env
```

### 4. Configure o Message Server
```bash
cd message-server
npm install
cp .env.example .env
# Configure as variáveis do message-server
```

### 5. Configure o Frontend
```bash
cd front-nextjs
npm install
cp env.example .env
# Configure as variáveis do frontend
```

## ⚙️ Configuração das Variáveis de Ambiente

### Projeto Principal (.env)
```env
# MongoDB
MONGO_URL=mongodb://localhost:27017/whatsapp-api

# WhatsApp
WHATSAPP_SERVER_PORT=3001

# API
API_KEY=sua_api_key_aqui
```

### Message Server (.env)
```env
# MongoDB
MONGO_URL=mongodb://localhost:27017/whatsapp-api

# Frontend URLs
FRONT_URL_DEV=http://localhost:3000
FRONT_URL_PROD=https://seu-dominio.com

# Monday.com
MONDAY_API_TOKEN=seu_token_aqui

# Ambiente
ENVIRONMENT=dev
MESSAGE_PORT=3002
API_KEY=sua_api_key_aqui
```

### Frontend (.env)
```env
# Message Server
NEXT_PUBLIC_MESSAGE_API_BASE_URL_LOCAL=http://localhost:3002

# WhatsApp API
NEXT_PUBLIC_WHATSAPP_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=sua_api_key_aqui
```

## 🚀 Executando o Projeto

### 1. Inicie o MongoDB
```bash
# Via Docker
docker-compose up -d mongodb

# Ou localmente
mongod
```

### 2. Inicie a API Principal do WhatsApp
```bash
# Terminal 1
npm run dev
# Servidor rodando na porta 3001
```

### 3. Inicie o Message Server
```bash
# Terminal 2
cd message-server
npm run dev
# Servidor rodando na porta 3002
```

### 4. Inicie o Frontend
```bash
# Terminal 3
cd front-nextjs
npm run dev
# Frontend rodando na porta 3000
```

## 📱 Como Usar

### 1. Acesse o Frontend
Abra `http://localhost:3000` no navegador

### 2. Conecte o WhatsApp
- Clique em "Criar Nova Sessão"
- Escaneie o QR Code com seu WhatsApp
- Aguarde a conexão ser estabelecida

### 3. Teste o Sistema
- Envie uma mensagem para o número conectado
- O sistema processará automaticamente
- Respostas serão enviadas via WhatsApp

## 🔄 Fluxo de Funcionamento

```
1. 📱 Usuário envia mensagem → WhatsApp
2. 🌐 WhatsApp → Webhook → API Principal
3. 🔄 API Principal → Message Server
4. 🧠 Message Server processa mensagem
5. 📤 Message Server → API Principal → WhatsApp
6. 💬 Usuário recebe resposta
```

## 🎯 Funcionalidades

### ✅ WhatsApp
- **Conexão automática** via QR Code
- **Múltiplas sessões** simultâneas
- **Webhooks em tempo real**
- **Envio de mensagens** programático

### ✅ Processamento de Mensagens
- **Análise inteligente** do conteúdo
- **Fluxos conversacionais** automáticos
- **Integração com Monday.com**
- **Histórico de conversas**

### ✅ Frontend
- **Interface moderna** e responsiva
- **Status de conexão** em tempo real
- **Gerenciamento de sessões**
- **QR Code dinâmico**

## 🧪 Testes

### Testar a API
```bash
# Verificar status
curl http://localhost:3001/client/getState/sessao123

# Enviar mensagem
curl -X POST http://localhost:3001/client/sendMessage/sessao123 \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_api_key" \
  -d '{"chatId":"5511999999999@c.us","contentType":"string","content":"Teste"}'
```

### Testar o Message Server
```bash
curl http://localhost:3002/api/ping
```

## 🐳 Docker

### Executar com Docker Compose
```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## 📊 Monitoramento

### Logs dos Serviços
- **API Principal**: `logs/whatsapp-api.log`
- **Message Server**: `message-server/logs/`
- **Frontend**: Console do navegador

### Status das Conexões
- **WhatsApp**: `/client/getState/{sessionId}`
- **Message Server**: `/api/ping`
- **Frontend**: Interface visual

## 🔧 Desenvolvimento

### Estrutura de Pastas
```
message-server/
├── routes/           # Rotas da API
├── models/           # Modelos MongoDB
├── utils/            # Utilitários
└── schemas/          # Schemas de validação

front-nextjs/
├── src/
│   ├── app/          # Páginas Next.js
│   ├── components/   # Componentes React
│   ├── hooks/        # Custom Hooks
│   └── utils/        # Utilitários
└── public/           # Arquivos estáticos
```

### Scripts de Desenvolvimento
```bash
# Projeto principal
npm run dev          # Desenvolvimento
npm run build        # Build de produção

# Message Server
cd message-server
npm run dev          # Desenvolvimento com TSX
npm run build        # Build TypeScript

# Frontend
cd front-nextjs
npm run dev          # Desenvolvimento Next.js
npm run build        # Build de produção
```

## 🚨 Troubleshooting

### Problemas Comuns

#### QR Code não aparece
- Verifique se o servidor está rodando
- Confirme as variáveis de ambiente
- Verifique os logs do servidor

#### Mensagens não são processadas
- Confirme conexão com MongoDB
- Verifique logs do Message Server
- Confirme integração com Monday.com

#### Frontend não carrega
- Verifique se Next.js está rodando
- Confirme variáveis de ambiente
- Verifique console do navegador

### Logs de Debug
```bash
# API Principal
tail -f logs/whatsapp-api.log

# Message Server
cd message-server && tail -f logs/app.log

# Frontend
# Ver console do navegador
```

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Crie** uma branch para sua feature
3. **Commit** suas mudanças
4. **Push** para a branch
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/whatsapp-api/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/whatsapp-api/wiki)
- **Email**: seu-email@exemplo.com

## 🙏 Agradecimentos

- **WhatsApp Web JS** pela biblioteca de conexão
- **Next.js** pelo framework frontend
- **MongoDB** pelo banco de dados
- **Monday.com** pela integração

---

**⭐ Se este projeto te ajudou, considere dar uma estrela!**