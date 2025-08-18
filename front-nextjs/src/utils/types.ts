export interface ClientContact {
    whatsappName: string;
    phone: string;
    status: string;
    service?: string | null;
    form?: string | null;
    boardId?: string | null;
    groupId?: string | null;
    block: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type WhatsAppStatus = 'connected' | 'waiting' | 'disconnected' | 'reconnecting' | 'uninitialized' | 'loading';

export interface Message {
  number: string;
  message: string;
}
export interface SessionInfo {
  pushname?: string;
  wid?: { user: string };
  platform?: string;
}