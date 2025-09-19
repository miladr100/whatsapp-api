import { z } from "zod";

// Schema para o objeto 'data' dentro de uma mensagem
const MessageDataSchema = z.object({
  content: z.string(),
});

// Schema para uma mensagem individual
const MessageSchema = z.object({
  type: z.string(), // "human" ou "ai"
  data: MessageDataSchema,
  additional_kwargs: z.record(z.string(), z.any()).optional(),
  response_metadata: z.record(z.string(), z.any()).optional(),
});

// Schema principal para a estrutura de logs/mensagens
export const MessagesSchema = z.object({
  _id: z.string(), // ObjectId como string
  sessionId: z.string(),
  messages: z.array(MessageSchema),
  tool_calls: z.array(z.any()).optional(),
  invalid_tool_calls: z.array(z.any()).optional(),
  additional_kwargs: z.record(z.string(), z.any()).optional(),
  response_metadata: z.record(z.string(), z.any()).optional(),
});

// Schema para criação (sem _id)
export const CreateMessagesSchema = MessagesSchema.omit({
  _id: true,
});

// Schema para atualização (todos opcionais exceto _id ou sessionId)
export const UpdateMessagesSchema = MessagesSchema.partial().extend({
  _id: z.string(), // _id sempre obrigatório para identificar
});

// Types exportados
export type Messages = z.infer<typeof MessagesSchema>;
export type CreateMessages = z.infer<typeof CreateMessagesSchema>;
export type UpdateMessages = z.infer<typeof UpdateMessagesSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type MessageData = z.infer<typeof MessageDataSchema>;