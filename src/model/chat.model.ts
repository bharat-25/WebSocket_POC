import mongoose, { Document, Schema } from 'mongoose';

export interface Chat {
    senderId: any;
    receiverId: any;
    message: string;
}

export interface ChatDocument extends Document, Chat {}

const chatSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    receiverId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    message: { type: String, required: true },
    status:{type:String},
    createdAt: {
        type: Date,
        // default: Date.now()
        default: new Date().toISOString()

    },
},
{timestamps:true}
);

const ChatModel = mongoose.model<ChatDocument>('Chat', chatSchema);

export default ChatModel;
