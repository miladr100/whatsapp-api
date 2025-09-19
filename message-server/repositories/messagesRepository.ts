import { MessagesModel } from "../models/Messages";
import { Messages, CreateMessages, UpdateMessages } from "../schemas/MessagesShema";

export class MessagesRepository {
  async findMessagesBySessionId(sessionId: string): Promise<Messages | null> {
    return MessagesModel.findOne({ sessionId });
  }

  async findMessagesById(_id: string): Promise<Messages | null> {
    return MessagesModel.findOne({ _id });
  }

  async listAllMessages(): Promise<Messages[]> {
    return MessagesModel.find().exec();
  }

  async insertNewMessages(data: CreateMessages): Promise<Messages> {
    const messages = new MessagesModel(data);
    return messages.save();
  }

  async updateMessagesById(_id: string, newDocument: Partial<UpdateMessages>) {
    return MessagesModel.updateOne(
      { _id },
      { $set: newDocument }
    );
  }

  async updateMessagesBySessionId(sessionId: string, newDocument: Partial<UpdateMessages>) {
    return MessagesModel.updateOne(
      { sessionId },
      { $set: newDocument }
    );
  }

  async deleteMessagesById(_id: string) {
    return MessagesModel.deleteOne({ _id });
  }

  async deleteMessagesBySessionId(sessionId: string) {
    return MessagesModel.deleteOne({ sessionId });
  }

  async deleteManyMessagesBySessionId(sessionIds: string[]) {
    return MessagesModel.deleteMany({ sessionId: { $in: sessionIds } });
  }
}
