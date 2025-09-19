import mongoose, { Schema, Document } from 'mongoose';

export interface IClientContact extends Document {
  whatsappName: string;
  phone: string;
  status: string;
  service?: string | null;
  form?: {
    nome?: string;
    empresa?: string;
    email?: string;
    contato?: string;
    local?: string;
    area?: string;
    previsao?: string | null;
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
        nome: { type: String },
        empresa: { type: String },
        email: { type: String },
        contato: { type: String },
        local: { type: String },
        area: { type: String },
        previsao: { type: String, default: null },
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
