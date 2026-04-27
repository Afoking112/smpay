import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['General', 'Gift Card'],
        default: 'General',
    },
    senderRole: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    senderName: {
        type: String,
        default: '',
    },
    preferredChannel: {
        type: String,
        enum: ['WhatsApp', 'Telegram', 'Phone', 'Email'],
        default: 'WhatsApp',
    },
    contactHandle: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['Unread', 'Read', 'Contacted', 'Closed'],
        default: 'Unread',
    },
}, { timestamps: true });

const SupportMessage = mongoose.models.SupportMessage || mongoose.model('SupportMessage', supportMessageSchema);

export default SupportMessage;
