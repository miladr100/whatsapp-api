# 🚀 Message Server

Servidor para gerenciamento de mensagens WhatsApp em Banco com autenticação por API-KEY.

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

# URLs do frontend para CORS
FRONT_URL_DEV=http://localhost:3000
FRONT_URL_PROD=https://yourdomain.com

# 🔐 API Key para autenticação (OBRIGATÓRIA)
API_KEY=sua-api-key-secreta-aqui

# URL da API principal do WhatsApp
WHATSAPP_API_BASE_URL=http://localhost:7000

# Token da API do Monday
MONDAY_API_TOKEN=your_monday_api_token_here

# Ambiente de execução (dev, prod)
ENVIRONMENT=dev

# Porta do servidor de mensagens
MESSAGE_PORT=3001
```

### 3. Variáveis Obrigatórias

- `MONGO_URL`: String de conexão do MongoDB
- `API_KEY`: Chave de autenticação para proteger os endpoints
- `WHATSAPP_API_BASE_URL`: URL da API principal do WhatsApp
- `FRONT_URL_DEV` / `FRONT_URL_PROD`: URLs do frontend para CORS
- `MONDAY_API_TOKEN`: Token de autenticação da API do Monday

### 4. Variáveis Opcionais

- `ENVIRONMENT`: Ambiente de execução (padrão: "dev")
- `MESSAGE_PORT`: Porta do servidor (padrão: "3001")

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

## 🔐 Autenticação

### Endpoints Públicos
- `GET /api/ping` - Verificação de saúde do servidor

### Endpoints Protegidos (requerem API-KEY)
- `GET /api/contacts` - Listar contatos
- `POST /api/block-contact` - Bloquear contato
- `DELETE /api/contacts` - Remover contato
- `POST /api/create-new-task` - Criar nova tarefa
- `POST /api/create-monday-task` - Criar tarefa no Monday
- `POST /api/add-monday-comment` - Adicionar comentário no Monday
- `POST /api/clean-contacts` - Limpar contatos

### Headers de Autenticação

Para acessar endpoints protegidos, inclua um dos seguintes headers:

```bash
# Recomendado
x-api-key: sua-api-key

# Alternativas
authorization: Bearer sua-api-key
api-key: sua-api-key
```

## Estrutura do Projeto

- `server.ts`: Arquivo principal do servidor
- `env.ts`: Configuração das variáveis de ambiente
- `middleware/auth.ts`: Middleware de autenticação
- `routes/`: Rotas da API
- `schemas/`: Schemas do MongoDB
- `utils/`: Utilitários (conexão MongoDB, etc.)
- `AUTENTICACAO.md`: Documentação detalhada da autenticação

## 🛡️ Segurança

⚠️ **Importante**: 
- O arquivo `.env` contém informações sensíveis e não deve ser commitado no repositório
- Use API-KEYs fortes e diferentes para desenvolvimento e produção
- Mantenha as chaves seguras e rotacione-as regularmente
- Todos os endpoints (exceto `/ping`) requerem autenticação via API-KEY

## 🔧 Troubleshooting

### Erros de Variáveis de Ambiente
1. Verifique se o arquivo `.env` existe
2. Confirme se todas as variáveis obrigatórias estão definidas
3. Reinicie o servidor após modificar o `.env`

### Erros de Autenticação

**401 - API Key obrigatória**
```json
{
  "success": false,
  "error": "API Key obrigatória",
  "message": "Forneça uma API key válida no header x-api-key"
}
```
- Solução: Adicione o header `x-api-key` com sua chave

**403 - API Key inválida**
```json
{
  "success": false,
  "error": "API Key inválida",
  "message": "A API key fornecida não é válida"
}
```
- Solução: Verifique se a API-KEY no frontend é igual à do backend

### Problemas de Conexão
- Verifique se o MongoDB está rodando
- Confirme se a `MONGO_URL` está correta
- Teste a conectividade com `GET /api/ping` (não requer autenticação)

## 📚 Documentação Adicional

Para informações detalhadas sobre autenticação, consulte:
- `AUTENTICACAO.md` - Guia completo de autenticação
- Exemplos de uso e boas práticas de segurança
