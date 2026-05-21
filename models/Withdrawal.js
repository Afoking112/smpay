import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    bankCode: {
        type: String,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
    accountName: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        default: '',
    },
    reference: {
        type: String,
        required: true,
        unique: true,
    },
    recipientCode: {
        type: String,
        default: '',
    },
    transferCode: {
        type: String,
        default: '',
    },
    providerStatus: {
        type: String,
        default: '',
    },
    failureReason: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending',
    },
}, { timestamps: true });

const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;
