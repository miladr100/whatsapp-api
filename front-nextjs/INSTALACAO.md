# 🚀 Instalação Rápida - Front-end WhatsApp API

## ⚡ Passos para executar em 5 minutos

### 1. 📋 Pré-requisitos
- Node.js 18+ instalado
- API WhatsApp rodando (backend)
- Navegador moderno
- **API Key configurada no servidor**

### 2. 🔧 Configuração rápida

```bash
# Entrar no diretório
cd front-nextjs

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp env.example .env.local

# Editar configuração (IMPORTANTE!)
# - Verificar se a API Key é igual à do servidor
# - Ajustar URLs se necessário
```

### 3. 🚀 Executar

```bash
# Desenvolvimento
npm run dev

# Acessar no navegador
# http://localhost:3001
```

### 4. ✅ Testar

1. Abra http://localhost:3001
2. Clique em "Criar Nova Sessão"
3. Escaneie o QR Code com seu WhatsApp
4. Envie uma mensagem de teste

## 🔧 Configuração personalizada

### Alterar porta da API
Edite `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL_LOCAL=http://localhost:8080
```

### Alterar ID da sessão
Edite `.env.local`:
```bash
NEXT_PUBLIC_DEFAULT_SESSION_ID=minha-sessao
```

**Padrão**: `geo-chave`

### Alterar API Key
Edite `.env.local`:
```bash
NEXT_PUBLIC_API_KEY=sua-api-key
```

**⚠️ CRÍTICO**: Deve ser **exatamente igual** à configurada no servidor!

## 🆘 Problemas comuns

### Erro: "Cannot connect to API"
- Verifique se o backend está rodando
- Confirme a URL no arquivo `.env.local`
- Verifique se não há firewall bloqueando

### Erro: "Unauthorized" ou "Invalid API Key"
- **Verifique se a API Key está correta**
- Confirme que é **exatamente igual** à do servidor
- Verifique se não há espaços extras

### QR Code não aparece
- Aguarde alguns segundos após criar a sessão
- Verifique o console do navegador para erros
- Tente clicar em "Gerar Novo QR Code"

### Erro de CORS
- Configure o backend para aceitar requisições do front-end
- Verifique se as URLs estão corretas

## 📱 Funcionalidades

- ✅ **Criar sessão** - Botão para iniciar nova conexão
- ✅ **QR Code** - Escaneie com seu WhatsApp
- ✅ **Status em tempo real** - Verificação automática a cada 5s
- ✅ **Enviar mensagens** - Teste a conexão
- ✅ **Destruir sessão** - Encerre quando necessário
- ✅ **Interface responsiva** - Funciona em mobile e desktop
- ✅ **Autenticação automática** - API Key em todas as requisições

## 🔄 Como funciona

1. **Polling automático** - Verifica status a cada 5 segundos
2. **Sem WebSockets** - Mais simples e confiável
3. **Validação automática** - Números de telefone formatados
4. **Feedback visual** - Estados claros e mensagens de erro
5. **Configuração flexível** - ID da sessão e API Key via variáveis
6. **Autenticação automática** - Header `x-api-key` em todas as requisições

## 🔑 Configuração da API Key

**IMPORTANTE**: A API Key deve ser configurada em dois lugares:

1. **Servidor backend** - Configuração da API
2. **Front-end** - Arquivo `.env.local`

```bash
# No servidor (backend)
API_KEY=geo-chave

# No front-end (.env.local)
NEXT_PUBLIC_API_KEY=geo-chave
```

**⚠️ Os valores devem ser IDÊNTICOS!**

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador
2. Confirme se a API está funcionando
3. **Verifique se a API Key está correta**
4. Verifique a configuração no `.env.local`
5. Consulte o README.md completo

---

**🎯 Objetivo**: Interface simples para gerenciar sessões WhatsApp via API
**⚡ Tecnologia**: Next.js + TypeScript + CSS puro
**🔌 Comunicação**: HTTP REST (sem WebSockets)
**🆔 Sessão Padrão**: geo-chave
**🔑 API Key**: geo-chave
