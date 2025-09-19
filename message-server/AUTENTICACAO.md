# 🔐 Autenticação com API-KEY

## Visão Geral

O servidor de mensagens possui autenticação obrigatória via API-KEY para proteger todos os endpoints, exceto o `/ping` que permanece público para verificações de saúde.

## Configuração

### Backend (.env)

```bash
# API Key para autenticação dos endpoints
API_KEY=sua-api-key-secreta-aqui
```

### Frontend (.env.local)

```bash
# API Key do servidor WhatsApp (deve ser igual ao backend)
NEXT_PUBLIC_API_KEY=sua-api-key-secreta-aqui
```

## Uso no Frontend

### Endpoints Protegidos
```typescript
// Use messageApiRequest() para endpoints que requerem autenticação
const response = await messageApiRequest('/contacts');
const response = await messageApiRequest('/block-contact', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### Endpoint Público
```typescript
// Use fetch() direto apenas para o ping
const response = await fetch(messageApi('/ping'));
```

## Headers Suportados

O middleware aceita a API-KEY nos seguintes headers (em ordem de prioridade):

1. `x-api-key` (recomendado)
2. `authorization` (formato: `Bearer sua-api-key`)
3. `api-key`

## Endpoints

### 🔓 Público
- `GET /api/ping` - Verificação de saúde (sem autenticação)

### 🔒 Protegidos (requerem API-KEY)
- `GET /api/contacts` - Listar contatos
- `POST /api/block-contact` - Bloquear contato
- `DELETE /api/contacts` - Remover contato
- `POST /api/create-new-task` - Criar nova tarefa
- `POST /api/create-monday-task` - Criar tarefa no Monday
- `POST /api/add-monday-comment` - Adicionar comentário no Monday
- `POST /api/clean-contacts` - Limpar contatos

## ⚠️ Importante

- As API-KEYs do backend e frontend devem ser **idênticas**
- Nunca commite arquivos `.env` no repositório
- Use chaves diferentes para desenvolvimento e produção

## Troubleshooting

### Erro 401 - API Key obrigatória
```json
{
  "success": false,
  "error": "API Key obrigatória",
  "message": "Forneça uma API key válida no header x-api-key"
}
```
**Solução**: Verificar se a variável `NEXT_PUBLIC_API_KEY` está configurada no frontend.

### Erro 403 - API Key inválida
```json
{
  "success": false,
  "error": "API Key inválida",
  "message": "A API key fornecida não é válida"
}
```
**Solução**: Verificar se as API-KEYs do frontend e backend são idênticas.

### Endpoint /ping não funciona
- O `/ping` deve funcionar sem API-KEY
- Verifique se não está sendo aplicado middleware incorretamente
