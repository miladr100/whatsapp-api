# Message Server

Servidor de mensagens para a API do WhatsApp.

## Configuração das Variáveis de Ambiente

Este projeto usa um arquivo `.env` para gerenciar as variáveis de ambiente. Para começar:

### 1. Copie o arquivo de exemplo

```bash
cp .env.example .env
```

### 2. Configure as variáveis no arquivo `.env`

```env
# Configurações do MongoDB
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database

# URLs permitidas para CORS (separadas por vírgula)
FRONT_URL=https://yourdomain.com,http://localhost:3000

# Token da API do Monday
MONDAY_API_TOKEN=your_monday_api_token_here

# Ambiente de execução (dev, prod)
ENVIRONMENT=dev

# Porta do servidor de mensagens
MESSAGE_PORT=3002
```

### 3. Variáveis Obrigatórias

- `MONGO_URL`: String de conexão do MongoDB
- `FRONT_URL`: URLs permitidas para CORS (separadas por vírgula)
- `MONDAY_API_TOKEN`: Token de autenticação da API do Monday

### 4. Variáveis Opcionais

- `ENVIRONMENT`: Ambiente de execução (padrão: "dev")
- `MESSAGE_PORT`: Porta do servidor (padrão: "3002")

## Instalação

```bash
npm install
```

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## Estrutura do Projeto

- `server.ts`: Arquivo principal do servidor
- `env.ts`: Configuração das variáveis de ambiente
- `routes/`: Rotas da API
- `models/`: Modelos do MongoDB
- `utils/`: Utilitários (conexão MongoDB, etc.)

## Segurança

⚠️ **Importante**: O arquivo `.env` contém informações sensíveis e não deve ser commitado no repositório. Ele já está incluído no `.gitignore`.

## Troubleshooting

Se você encontrar erros relacionados a variáveis de ambiente:

1. Verifique se o arquivo `.env` existe
2. Confirme se todas as variáveis obrigatórias estão definidas
3. Reinicie o servidor após modificar o `.env`
