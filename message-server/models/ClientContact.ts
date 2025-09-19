import mongoose, { Schema, Document } from 'mongoose';

export interface IClientContact extends Document {
  whatsappName: string;
  phone: string;
  status: string;
  service?: string | null;
  form?: {
    nome_solicitante?: string;
    empresa?: string;
    email?: string;
    telefone_contato?: string;
    local_servico?: string;
    tamanho_area_pesquisa?: string;
    previsao_realizacao_servico?: string | null;
    observacoes?: string | null;
  } | null;
  boardId?: string | null;
  groupId?: string | null;
  block?: boolean;
  hasMedia: boolean;
  lastMessage?: string | null;
  lastMessageId: string;
  mediaUrl?: string | null;
  running: boolean;
  audioMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const ClientContactSchema = new Schema<IClientContact>(
  {
    whatsappName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    service: { type: String, default: null },
    boardId: { type: String, default: null },
    groupId: { type: String, default: null },
    block: { type: Boolean, default: false },
    hasMedia: { type: Boolean, default: null },
    lastMessage: { type: String, default: null },
    lastMessageId: { type: String, default: null },
    mediaUrl: { type: String, default: null },
    running: { type: Boolean, required: true },
    audioMessage: { type: String, default: null },
    form: {
      type: {
        nome_solicitante: { type: String },
        empresa: { type: String },
        email: { type: String },
        telefone_contato: { type: String },
        local_servico: { type: String },
        tamanho_area_pesquisa: { type: String },
        previsao_realizacao_servico: { type: String, default: null },
        observacoes: { type: String, default: null },
      },
      default: null
    },
  },
  { timestamps: true }
);

export const ClientContactModel =
  mongoose.models.ClientContact ||
  mongoose.model<IClientContact>('ClientContact', ClientContactSchema);
