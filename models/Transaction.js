import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service: {
        type: String,
        required: true,
        enum: ['Airtime', 'Data', 'Gift Card', 'Electricity', 'Cable TV', 'Wallet Funding', 'Airtime to Cash'],
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending',
    },
    reference: {
        type: String,
        unique: true,
    },
    type: {
        type: String,
        enum: ['debit', 'credit'],
        default: 'debit',
    },
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;
