import mongoose, { Schema, Document } from 'mongoose';

// Interface usando o tipo do Zod
export interface IMessages extends Document {
  _id: string;
  sessionId: string;
  messages: Array<{
    type: string;
    data: {
      content: string;
    };
    additional_kwargs?: Record<string, any>;
    response_metadata?: Record<string, any>;
  }>;
  tool_calls?: any[];
  invalid_tool_calls?: any[];
  additional_kwargs?: Record<string, any>;
  response_metadata?: Record<string, any>;
}

// Schema do Mongoose baseado na estrutura Zod
const MessagesMongooseSchema = new Schema<IMessages>(
  {
    _id: { type: String, required: true },
    sessionId: { type: String, required: true },
    messages: [{
      type: { type: String, required: true },
      data: {
        content: { type: String, required: true }
      },
      additional_kwargs: { type: Schema.Types.Mixed, default: {} },
      response_metadata: { type: Schema.Types.Mixed, default: {} }
    }],
    tool_calls: [{ type: Schema.Types.Mixed }],
    invalid_tool_calls: [{ type: Schema.Types.Mixed }],
    additional_kwargs: { type: Schema.Types.Mixed, default: {} },
    response_metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

// Modelo exportado
export const MessagesModel =
  mongoose.models.Messages ||
  mongoose.model<IMessages>('Messages', MessagesMongooseSchema);
