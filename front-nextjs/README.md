# Front-end Next.js para WhatsApp API

Este é o front-end recriado para usar exclusivamente as funções da API WhatsApp, sem dependência de WebSockets.

## Funcionalidades

- ✅ **Verificação automática do status da sessão** a cada 5 segundos
- ✅ **Criação de nova sessão** com botão dedicado
- ✅ **Destruição de sessão** quando conectado
- ✅ **Geração de novo QR Code** quando necessário
- ✅ **Envio de mensagens de teste** quando conectado
- ✅ **Validação de números de telefone** com feedback visual
- ✅ **Informações da sessão** exibidas quando conectado
- ✅ **Interface responsiva** para dispositivos móveis

## Como usar

### 1. Configuração do ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```bash
# Configuração do ambiente
NEXT_PUBLIC_NODE_ENV=dev

# ID da sessão padrão
NEXT_PUBLIC_DEFAULT_SESSION_ID=geobot

# API Key do servidor WhatsApp
NEXT_PUBLIC_API_KEY=geo-chave

# URLs da API
NEXT_PUBLIC_API_BASE_URL_LOCAL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=https://sua-api-producao.com

# URLs da API de mensagens (se necessário)
NEXT_PUBLIC_MESSAGE_API_BASE_URL_LOCAL=http://localhost:3002
NEXT_PUBLIC_MESSAGE_API_BASE_URL=https://sua-api-producao.com
```

**⚠️ Importante**: A `NEXT_PUBLIC_API_KEY` deve ser **exatamente igual** à configurada no servidor backend.

### 2. Instalação das dependências

```bash
npm install
# ou
yarn install
```

### 3. Executar em desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

O front-end rodará automaticamente na porta **3000**.

### 4. Build para produção

```bash
npm run build
npm start
# ou
yarn build
yarn start
```

## Configuração das Portas

### 🖥️ **Backend (API)**
- **Porta**: 3001
- **URL**: `http://localhost:3001`
- **Função**: Servidor da API WhatsApp

### 🌐 **Frontend (Next.js)**
- **Porta**: 3000
- **URL**: `http://localhost:3000`
- **Função**: Interface do usuário

### 📋 **Resumo**
```
Backend API:  http://localhost:3001  ← Sua API WhatsApp
Frontend:     http://localhost:3000  ← Interface Next.js
```

## Estrutura da API

O front-end usa as seguintes rotas da API (sem o prefixo `/api`):

### Sessões
- `GET /session/start/{sessionId}` - Criar nova sessão
- `GET /session/status/{sessionId}` - Verificar status da sessão
- `GET /session/qr/{sessionId}/image` - Obter QR code da sessão
- `GET /session/restart/{sessionId}` - Reiniciar sessão
- `GET /session/terminate/{sessionId}` - Destruir sessão

### Cliente
- `GET /client/getState/{sessionId}` - Obter estado do cliente
- `GET /client/getClassInfo/{sessionId}` - Obter informações da sessão
- `POST /client/sendMessage/{sessionId}` - Enviar mensagem

## Autenticação

Todas as requisições para a API incluem automaticamente o header de autenticação:

```typescript
headers: {
  'x-api-key': 'sua-api-key'  // Valor configurado em .env.local
}
```

## Estados da Sessão

- **`connected`** - Conectado ao WhatsApp
- **`waiting`** - Aguardando escaneamento do QR Code
- **`disconnected`** - Desconectado
- **`uninitialized`** - Gerando QR Code
- **`loading`** - Carregando/processando
- **`reconnecting`** - Tentando reconectar

## Validação de Telefone

O sistema valida automaticamente os números de telefone:
- Deve conter entre 10 e 15 dígitos
- Remove automaticamente caracteres especiais
- Adiciona automaticamente `@c.us` se necessário
- Exibe mensagens de erro em tempo real

## Polling vs WebSockets

Este front-end usa **polling** (verificação a cada 5 segundos) em vez de WebSockets para:

- ✅ **Simplicidade** - Não requer configuração de WebSocket
- ✅ **Confiabilidade** - Funciona mesmo com problemas de rede
- ✅ **Compatibilidade** - Funciona em todos os navegadores
- ✅ **Manutenção** - Código mais simples e fácil de debugar

## Estrutura do Projeto

```
front-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Página principal
│   │   ├── page.css          # Estilos da página
│   │   └── ignore/           # Página /ignore
│   ├── utils/
│   │   ├── config.ts         # Configuração de ambiente
│   │   ├── functions.ts      # Funções utilitárias
│   │   └── consts.ts         # Constantes
│   └── lib/                  # Bibliotecas
├── env.example               # Exemplo de configuração
├── package.json              # Dependências
└── README.md                 # Este arquivo
```

## Personalização

### Alterar ID da sessão padrão

Edite o arquivo `.env.local`:

```bash
NEXT_PUBLIC_DEFAULT_SESSION_ID=sua-sessao-personalizada
```

### Alterar API Key

Edite o arquivo `.env.local`:

```bash
NEXT_PUBLIC_API_KEY=sua-api-key-personalizada
```

**⚠️ Importante**: A API Key deve ser **exatamente igual** à configurada no servidor backend.

### Alterar intervalo de verificação

No arquivo `src/app/page.tsx`, altere o valor do `setInterval`:

```typescript
const interval = setInterval(checkSessionStatus, 10000); // 10 segundos
```

### Adicionar novos tipos de mensagem

Você pode expandir o sistema para suportar outros tipos de mensagem da API:
- Imagens
- Localização
- Botões
- Listas
- Contatos
- Enquetes

## Troubleshooting

### Erro de CORS
Certifique-se de que a API está configurada para aceitar requisições do domínio do front-end.

### Erro de autenticação
Verifique se a `NEXT_PUBLIC_API_KEY` está configurada corretamente e é **exatamente igual** à do servidor.

### QR Code não aparece
Verifique se a sessão foi criada com sucesso e se o endpoint `/session/qr/{sessionId}/image` está funcionando.

### Erro de import
Se houver problemas com imports, verifique se todos os arquivos estão nos diretórios corretos conforme a estrutura do projeto.

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das suas mudanças
4. Abra um Pull Request

## Licença

Este projeto está sob a mesma licença do projeto principal.
