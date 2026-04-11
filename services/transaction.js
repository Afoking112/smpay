import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const createTransaction = async (userId, service, amount, type, reference, status = 'Pending') => {
    const transaction = new Transaction({
        userId,
        service,
        amount,
        type,
        reference,
        status
    });
    await transaction.save();
    return transaction;
};

export const updateTransactionStatus = async (reference, status) => {
    const transaction = await Transaction.findOneAndUpdate(
        { reference },
        { status },
        { new: true }
    );
    return transaction;
};

export const refundWallet = async (userId, amount) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.walletBalance += amount;
    await user.save();
    return user.walletBalance;
};

export const deductWallet = async (userId, amount) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (user.walletBalance < amount) {
        throw new Error('Insufficient wallet balance');
    }
    user.walletBalance -= amount;
    await user.save();
    return user.walletBalance;
};

export const creditWallet = async (userId, amount) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.walletBalance += amount;
    await user.save();
    return user.walletBalance;
};

