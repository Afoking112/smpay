import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Transaction from '../../../models/Transaction';
import ServiceRequest from '../../../models/ServiceRequest';

import SupportMessage from '../../../models/SupportMessage';
import Withdrawal from '../../../models/Withdrawal';
import {
    createTransferRecipient,
    generateTransferReference,
    getPaystackErrorMessage,
    initializePayment,
    initiateTransfer,
    listBanks,
    resolveAccountNumber,
    verifyPayment,
} from '../../../services/paystack.js';
import { buyAirtime as purchaseAirtime, buyData as purchaseData } from '../../../services/vtu.js';
import {
    getConfiguredAdminAlertRecipients,
    sendAdminGiftCardAlert,
    sendPasswordResetOtp,
} from '../../../services/email.js';
import {
    createTransaction,
    creditWallet,
    deductWallet,
    refundWallet,
    updateTransactionStatus,
} from '../../../services/transaction.js';

const typeDefs = gql`
  
  enum RepaymentStatus {
    Pending
    Success
    Failed
  }

  type Transaction {
    id: ID!
    service: String!
    amount: Float!
    status: String!
    type: String!
    reference: String
    createdAt: String!
  }

  type User {
    id: ID!
    name: String!
    phone: String!
    email: String!
    role: String!
    walletBalance: Float
    state: String
    address: String
    profilePicture: String
    telegramUsername: String
    createdAt: String!
    transactionCount: Int
    serviceRequestCount: Int
    supportMessageCount: Int
  }

  type PaymentResponse {
    success: Boolean!
    message: String!
    data: PaymentData
  }

  type PaymentData {
    authorization_url: String!
    access_code: String!
    reference: String!
  }

  type WithdrawalBank {
    name: String!
    code: String!
  }

  type BankAccountResolutionResponse {
    success: Boolean!
    message: String!
    accountName: String
  }

  type TransactionResponse {
    success: Boolean!
    message: String!
    transaction: Transaction
  }

  type ServiceRequest {
    id: ID!
    category: String!
    title: String!
    provider: String
    accountOrPhone: String
    amount: Float
    direction: String
    note: String
    status: String!
    feePercentage: Float
    expectedCredit: Float
    createdAt: String!
    updatedAt: String!
  }

  type ServiceRequestResponse {
    success: Boolean!
    message: String!
    request: ServiceRequest
  }

  type LoanRepayment {
    id: ID!
    loanRequestId: ID!
    principalAmount: Float!
    repaymentAmount: Float!
    status: RepaymentStatus!
    paystackReference: String!
    repaidAt: String
    createdAt: String!
    updatedAt: String!
  }

  type LoanRepaymentResponse {
    success: Boolean!
    message: String!
    repayment: LoanRepayment
  }


  type SupportMessage {
    id: ID!
    subject: String!
    message: String!
    category: String!
    senderRole: String!
    senderName: String
    preferredChannel: String!
    contactHandle: String
    status: String!
    createdAt: String!
    updatedAt: String!
    user: User
  }

  type SupportMessageResponse {
    success: Boolean!
    message: String!
    supportMessage: SupportMessage
  }

  type BasicResponse {
    success: Boolean!
    message: String!
  }

  type UserResponse {
    success: Boolean!
    message: String!
    user: User
  }

  type AdminUserDetail {
    user: User!
    transactions: [Transaction!]!
    serviceRequests: [ServiceRequest!]!
    supportMessages: [SupportMessage!]!
  }

  input BuyAirtimeInput {
    phone: String!
    network: String!
    amount: Float!
  }

  input BuyDataInput {
    phone: String!
    network: String!
    planId: String!
    amount: Float!
  }

  input ServiceRequestInput {
    category: String!
    title: String!
    provider: String
    accountOrPhone: String
    amount: Float
    direction: String
    note: String
  }

  input SupportMessageInput {
    subject: String!
    message: String!
    category: String
    preferredChannel: String!
    contactHandle: String
  }

  input AdminReplyInput {
    subject: String!
    message: String!
    category: String
    preferredChannel: String
  }

  input UpdateProfileInput {
    name: String
    phone: String
    state: String
    address: String
    profilePicture: String
    telegramUsername: String
  }

  input WithdrawToBankInput {
    bankCode: String!
    bankName: String!
    accountNumber: String!
    accountName: String!
    amount: Float!
    reason: String
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    token: String!
    user: User
  }

  type Query {
    me: User
    walletBalance: Float!
    withdrawalBanks: [WithdrawalBank!]!
    transactions(limit: Int, offset: Int): [Transaction!]!
    serviceRequests(limit: Int, status: String, category: String): [ServiceRequest!]!
    supportMessages(limit: Int, status: String, category: String): [SupportMessage!]!
    adminUsers(search: String): [User!]!
    adminUser(id: ID!): AdminUserDetail
    adminSupportMessages(limit: Int, status: String, category: String): [SupportMessage!]!
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    adminSignup(input: AdminSignupInput!): AuthPayload!
    adminLogin(email: String!, password: String!): AuthPayload!
    forgotPassword(email: String!, phone: String!): BasicResponse!
    resetPasswordWithOtp(email: String!, otp: String!, newPassword: String!): BasicResponse!
    updateProfile(input: UpdateProfileInput!): UserResponse!
    fundWallet(amount: Float!): PaymentResponse!
    verifyWalletFunding(reference: String!): TransactionResponse!
    resolveWithdrawalAccount(accountNumber: String!, bankCode: String!): BankAccountResolutionResponse!
    withdrawToBank(input: WithdrawToBankInput!): TransactionResponse!
    buyAirtime(input: BuyAirtimeInput!): TransactionResponse!
    buyData(input: BuyDataInput!): TransactionResponse!
    submitServiceRequest(input: ServiceRequestInput!): ServiceRequestResponse!
    updateServiceRequestStatus(requestId: ID!, status: String!): ServiceRequestResponse!
    sendSupportMessage(input: SupportMessageInput!): SupportMessageResponse!
    adminReplySupportMessage(userId: ID!, input: AdminReplyInput!): SupportMessageResponse!
    updateSupportMessageStatus(messageId: ID!, status: String!): SupportMessageResponse!
    deleteUser(userId: ID!): BasicResponse!
  }

  input AdminSignupInput {
    name: String!
    phone: String!
    email: String!
    password: String!
  }

  input SignupInput {
    name: String!
    phone: String!
    email: String!
    password: String!
  }
`;

type GraphQLContext = {
    req: NextRequest;
};

type CountSummary = {
    transactionCount?: number;
    serviceRequestCount?: number;
    supportMessageCount?: number;
};

type ObjectIdLike = {
    toString(): string;
};

type UserRecord = {
    _id: ObjectIdLike;
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
    walletBalance?: number;
    state?: string;
    address?: string;
    profilePicture?: string;
    telegramUsername?: string;
    createdAt?: Date;
};

type TransactionRecord = {
    _id: ObjectIdLike;
    service: string;
    amount: number;
    status: string;
    type: string;
    reference?: string | null;
    createdAt: Date;
};

type ServiceRequestRecord = {
    _id: ObjectIdLike;
    category: string;
    title: string;
    provider?: string;
    accountOrPhone?: string;
    amount?: number;
    direction?: string;
    note?: string;
    status: string;
    feePercentage?: number;
    expectedCredit?: number;
    createdAt: Date;
    updatedAt?: Date;
};

type SupportMessageRecord = {
    _id: ObjectIdLike;
    subject: string;
    message: string;
    category?: string;
    senderRole?: string;
    senderName?: string;
    preferredChannel: string;
    contactHandle?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};

function getToken(req: NextRequest) {
    const authHeader = req.headers.get('authorization') || '';
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
}

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function normalizeTelegramUsername(value = '') {
    return value.trim().replace(/^@/, '');
}

function normalizeStatus(status: string, allowed: string[]) {
    if (!allowed.includes(status)) {
        throw new Error(`Invalid status. Allowed values: ${allowed.join(', ')}`);
    }

    return status;
}

function normalizeSupportCategory(category?: string | null) {
    return category === 'Gift Card' ? 'Gift Card' : 'General';
}

function normalizePhoneNumber(phone: string) {
    return phone.trim();
}

function normalizeAccountNumber(accountNumber: string) {
    return accountNumber.replace(/\D/g, '').trim();
}

function generatePasswordResetOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function clearPasswordResetState(user: {
    passwordResetOtpHash?: string;
    passwordResetOtpExpiresAt?: Date | null;
    passwordResetOtpRequestedAt?: Date | null;
}) {
    user.passwordResetOtpHash = '';
    user.passwordResetOtpExpiresAt = null;
    user.passwordResetOtpRequestedAt = null;
}

function mapWithdrawalProviderStatus(status = '') {
    return status === 'success' ? 'Success' : status === 'failed' ? 'Failed' : 'Pending';
}

function buildWithdrawalMessage(providerStatus = '') {
    if (providerStatus === 'success') {
        return 'Withdrawal sent successfully to your bank account.';
    }

    if (providerStatus === 'otp') {
        return 'Withdrawal created successfully and is awaiting Paystack transfer approval.';
    }

    return 'Withdrawal submitted successfully and is being processed.';
}

async function getAuthenticatedUser(req: NextRequest) {
    const token = getToken(req);

    if (!token) {
        throw new Error('Unauthorized');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

async function getAuthenticatedAdmin(req: NextRequest) {
    const user = await getAuthenticatedUser(req);

    if (user.role !== 'admin') {
        throw new Error('Access denied. Admin only.');
    }

    return user;
}

function getPaymentUserId(paymentData: {
    metadata?: { userId?: string; custom_fields?: Array<{ value?: string }> };
}) {
    return String(paymentData.metadata?.userId || paymentData.metadata?.custom_fields?.[0]?.value || '');
}

async function buildUserCounts(userId: string) {
    const [transactionCount, serviceRequestCount, supportMessageCount] = await Promise.all([
        Transaction.countDocuments({ userId }),
        ServiceRequest.countDocuments({ userId }),
        SupportMessage.countDocuments({ userId }),
    ]);

    return {
        transactionCount,
        serviceRequestCount,
        supportMessageCount,
    };
}

function serializeUser(user: UserRecord, counts: CountSummary = {}) {
    return {
        id: user._id.toString(),
        name: user.name ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
        role: user.role ?? 'user',
        walletBalance: user.walletBalance ?? 0,
        state: user.state ?? '',
        address: user.address ?? '',
        profilePicture: user.profilePicture ?? '',
        telegramUsername: user.telegramUsername ?? '',
        createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
        transactionCount: counts.transactionCount ?? 0,
        serviceRequestCount: counts.serviceRequestCount ?? 0,
        supportMessageCount: counts.supportMessageCount ?? 0,
    };
}

function serializeTransaction(transaction: TransactionRecord) {
    return {
        id: transaction._id.toString(),
        service: transaction.service,
        amount: transaction.amount,
        status: transaction.status,
        type: transaction.type,
        reference: transaction.reference ?? null,
        createdAt: transaction.createdAt.toISOString(),
    };
}

function serializeServiceRequest(request: ServiceRequestRecord) {
    return {
        id: request._id.toString(),
        category: request.category,
        title: request.title,
        provider: request.provider || '',
        accountOrPhone: request.accountOrPhone || '',
        amount: request.amount ?? 0,
        direction: request.direction || '',
        note: request.note || '',
        status: request.status,
        feePercentage: request.feePercentage ?? 0,
        expectedCredit: request.expectedCredit ?? 0,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt ? request.updatedAt.toISOString() : request.createdAt.toISOString(),
    };
}

function serializeSupportMessage(message: SupportMessageRecord, user: UserRecord | null = null) {
    return {
        id: message._id.toString(),
        subject: message.subject,
        message: message.message,
        category: normalizeSupportCategory(message.category),
        senderRole: message.senderRole || 'user',
        senderName: message.senderName || '',
        preferredChannel: message.preferredChannel,
        contactHandle: message.contactHandle || '',
        status: message.status,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        user: user ? serializeUser(user) : null,
    };
}

function buildSupportContactHandle(user: UserRecord, input: { preferredChannel: string; contactHandle?: string | null }) {
    const providedHandle = input.contactHandle?.trim() || '';

    if (input.preferredChannel === 'Telegram') {
        return providedHandle || normalizeTelegramUsername(user.telegramUsername || '');
    }

    if (input.preferredChannel === 'Email') {
        return providedHandle || user.email || '';
    }

    if (input.preferredChannel === 'Phone' || input.preferredChannel === 'WhatsApp') {
        return providedHandle || user.phone || '';
    }

    return providedHandle;
}

async function notifyAdminsAboutGiftCardChat({
    user,
    preferredChannel,
    contactHandle,
    message,
}: {
    user: UserRecord;
    preferredChannel: string;
    contactHandle: string;
    message: string;
}) {
    console.log('[GIFT CARD ALERT] Function called');
    console.log('[GIFT CARD ALERT] User:', user.name, user.email, user.phone);
    console.log('[GIFT CARD ALERT] Message preview:', message.substring(0, 100));

    const configuredRecipients = getConfiguredAdminAlertRecipients();
    const adminUsers = await User.find({ role: 'admin' }).select('email');
    const adminRecipients = adminUsers
        .map((admin: { email?: string }) => admin.email)
        .filter((email): email is string => Boolean(email));
    const recipients = Array.from(new Set([...configuredRecipients, ...adminRecipients]));

    console.log('[GIFT CARD ALERT] Recipients:', recipients);

    if (recipients.length === 0) {
        return {
            sent: false,
            reason: 'No admin alert recipients are configured',
        };
    }

    try {
        const result = await sendAdminGiftCardAlert({
            recipients,
            userName: user.name || 'Unknown user',
            userEmail: user.email || '',
            userPhone: user.phone || '',
            preferredChannel,
            contactHandle,
            message,
        });
        console.log('[GIFT CARD ALERT] Email sent result:', result);
        return result;
    } catch (error) {
        console.error('[GIFT CARD ALERT] Failed to send email:', error);
        return {
            sent: false,
            reason: error instanceof Error ? error.message : 'Unknown email error',
        };
    }
}

function buildAirtimeToCashValues(category: string, amount: number) {
    if (category !== 'Airtime to Cash') {
        return {
            feePercentage: 0,
            expectedCredit: 0,
        };
    }

    const feePercentage = 7;
    const expectedCredit = Number((amount * ((100 - feePercentage) / 100)).toFixed(2));

    return {
        feePercentage,
        expectedCredit,
    };
}

const resolvers = {
    Query: {
        me: async (_parent: unknown, _args: unknown, { req }: GraphQLContext) => {
            await connectDB();

            try {
                const user = await getAuthenticatedUser(req);
                const counts = await buildUserCounts(user._id.toString());
                return serializeUser(user, counts);
            } catch {
                return null;
            }
        },
        walletBalance: async (_parent: unknown, _args: unknown, { req }: GraphQLContext) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);
            return user.walletBalance ?? 0;
        },
        withdrawalBanks: async (_parent: unknown, _args: unknown, { req }: GraphQLContext) => {
            await connectDB();
            await getAuthenticatedUser(req);

            const banks = await listBanks();

            return banks
                .filter((bank: { active?: boolean; code?: string; name?: string }) => bank.active !== false && bank.code && bank.name)
                .map((bank: { code: string; name: string }) => ({
                    code: bank.code,
                    name: bank.name,
                }))
                .sort((first: { name: string }, second: { name: string }) => first.name.localeCompare(second.name));
        },
        transactions: async (
            _parent: unknown,
            { limit = 10, offset = 0 }: { limit?: number; offset?: number },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);

            const transactions = await Transaction.find({ userId: user._id })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit);

            return transactions.map(serializeTransaction);
        },
        serviceRequests: async (
            _parent: unknown,
            { limit = 10, status, category }: { limit?: number; status?: string; category?: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);

            const filters: Record<string, unknown> = { userId: user._id };
            if (status) {
                filters.status = status;
            }
            if (category) {
                filters.category = category;
            }

            const requests = await ServiceRequest.find(filters)
                .sort({ createdAt: -1 })
                .limit(limit);

            return requests.map(serializeServiceRequest);
        },
        supportMessages: async (
            _parent: unknown,
            { limit = 20, status, category }: { limit?: number; status?: string; category?: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);

            const filters: Record<string, unknown> = { userId: user._id };
            if (status) {
                filters.status = status;
            }
            if (category) {
                filters.category = normalizeSupportCategory(category);
            }

            const messages = await SupportMessage.find(filters)
                .sort({ createdAt: -1 })
                .limit(limit);

            return messages.reverse().map((message) => serializeSupportMessage(message, user));
        },
        adminUsers: async (
            _parent: unknown,
            { search }: { search?: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            await getAuthenticatedAdmin(req);

            const filters = search
                ? {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } },
                        { state: { $regex: search, $options: 'i' } },
                    ],
                }
                : {};

            const users = await User.find(filters).sort({ createdAt: -1 });

            return Promise.all(
                users.map(async (user) => {
                    const counts = await buildUserCounts(user._id.toString());
                    return serializeUser(user, counts);
                })
            );
        },
        adminUser: async (
            _parent: unknown,
            { id }: { id: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            await getAuthenticatedAdmin(req);

            const user = await User.findById(id);
            if (!user) {
                return null;
            }

            const [counts, transactions, serviceRequests, supportMessages] = await Promise.all([
                buildUserCounts(user._id.toString()),
                Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(100),
                ServiceRequest.find({ userId: user._id }).sort({ createdAt: -1 }).limit(100),
                SupportMessage.find({ userId: user._id }).sort({ createdAt: -1 }).limit(100),
            ]);

            return {
                user: serializeUser(user, counts),
                transactions: transactions.map(serializeTransaction),
                serviceRequests: serviceRequests.map(serializeServiceRequest),
                supportMessages: supportMessages.reverse().map((message) => serializeSupportMessage(message, user)),
            };
        },
        adminSupportMessages: async (
            _parent: unknown,
            { limit = 50, status, category }: { limit?: number; status?: string; category?: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            await getAuthenticatedAdmin(req);

            const filters: Record<string, unknown> = { senderRole: 'user' };
            if (status) {
                filters.status = status;
            }
            if (category) {
                filters.category = normalizeSupportCategory(category);
            }

            const messages = await SupportMessage.find(filters)
                .populate('userId')
                .sort({ createdAt: -1 })
                .limit(limit);

            return messages.map((message) => serializeSupportMessage(message, message.userId));
        },
    },

    Mutation: {
        signup: async (_parent: unknown, { input }: { input: { name: string; phone: string; email: string; password: string } }) => {
            await connectDB();
            const name = input.name.trim();
            const phone = input.phone.trim();
            const email = normalizeEmail(input.email);
            const password = input.password;

            if (!name || !phone || !email || !password) {
                throw new Error('All fields are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = await User.create({
                name,
                phone,
                email,
                password: hashedPassword,
            });

            const token = jwt.sign(
                { id: user._id.toString() },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            return {
                success: true,
                message: 'User created successfully',
                token,
                user: serializeUser(user),
            };
        },

        login: async (_parent: unknown, { email, password }: { email: string; password: string }) => {
            await connectDB();

            const normalizedEmail = normalizeEmail(email);
            if (!normalizedEmail || !password) {
                throw new Error('Email and password are required');
            }

            const user = await User.findOne({ email: normalizedEmail });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Invalid credentials');
            }

            const token = jwt.sign(
                { id: user._id.toString() },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            return {
                success: true,
                message: 'Login successful',
                token,
                user: serializeUser(user),
            };
        },

        adminSignup: async (
            _parent: unknown,
            { input }: { input: { name: string; phone: string; email: string; password: string } }
        ) => {
            await connectDB();
            const name = input.name.trim();
            const phone = input.phone.trim();
            const email = normalizeEmail(input.email);
            const password = input.password;

            if (!name || !phone || !email || !password) {
                throw new Error('All fields are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = await User.create({
                name,
                phone,
                email,
                password: hashedPassword,
                role: 'admin',
            });

            const token = jwt.sign(
                { id: user._id.toString() },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            return {
                success: true,
                message: 'Admin created successfully',
                token,
                user: serializeUser(user),
            };
        },

        adminLogin: async (_parent: unknown, { email, password }: { email: string; password: string }) => {
            await connectDB();

            const normalizedEmail = normalizeEmail(email);
            if (!normalizedEmail || !password) {
                throw new Error('Email and password are required');
            }

            const user = await User.findOne({ email: normalizedEmail });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            if (user.role !== 'admin') {
                throw new Error('Access denied. Admin only.');
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Invalid credentials');
            }

            const token = jwt.sign(
                { id: user._id.toString() },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            return {
                success: true,
                message: 'Admin login successful',
                token,
                user: serializeUser(user),
            };
        },
        forgotPassword: async (
            _parent: unknown,
            { email, phone }: { email: string; phone: string }
        ) => {
            await connectDB();

            if (!email || !phone) {
                throw new Error('Email and phone number are required');
            }

            const user = await User.findOne({ email: normalizeEmail(email) });
            if (!user || normalizePhoneNumber(user.phone || '') !== normalizePhoneNumber(phone)) {
                throw new Error('We could not verify your account with that email and phone number');
            }

            const requestedAt = user.passwordResetOtpRequestedAt ? new Date(user.passwordResetOtpRequestedAt) : null;
            if (requestedAt && (Date.now() - requestedAt.getTime()) < 60 * 1000) {
                throw new Error('Please wait a minute before requesting another OTP');
            }

            const otp = generatePasswordResetOtp();
            user.passwordResetOtpHash = await bcrypt.hash(otp, 10);
            user.passwordResetOtpExpiresAt = new Date(Date.now() + (10 * 60 * 1000));
            user.passwordResetOtpRequestedAt = new Date();
            await user.save();

            const emailResult = await sendPasswordResetOtp({
                recipient: user.email,
                userName: user.name || 'there',
                otp,
            });

            if (!emailResult.sent) {
                clearPasswordResetState(user);
                await user.save();
                throw new Error(emailResult.reason || 'We could not send the password reset OTP');
            }

            return {
                success: true,
                message: 'A 6-digit OTP has been sent to your email address.',
            };
        },
        resetPasswordWithOtp: async (
            _parent: unknown,
            { email, otp, newPassword }: { email: string; otp: string; newPassword: string }
        ) => {
            await connectDB();

            if (!email || !otp || !newPassword) {
                throw new Error('Email, OTP, and new password are required');
            }

            if (!/^\d{6}$/.test(otp.trim())) {
                throw new Error('OTP must be a 6-digit code');
            }

            if (newPassword.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const user = await User.findOne({ email: normalizeEmail(email) });
            if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
                throw new Error('No active password reset request was found for this email');
            }

            if (new Date(user.passwordResetOtpExpiresAt).getTime() < Date.now()) {
                clearPasswordResetState(user);
                await user.save();
                throw new Error('This OTP has expired. Request a new one.');
            }

            const isValidOtp = await bcrypt.compare(otp.trim(), user.passwordResetOtpHash);
            if (!isValidOtp) {
                throw new Error('Invalid OTP');
            }

            user.password = await bcrypt.hash(newPassword, 12);
            clearPasswordResetState(user);
            await user.save();

            return {
                success: true,
                message: 'Password updated successfully. You can now sign in.',
            };
        },
        updateProfile: async (
            _parent: unknown,
            {
                input,
            }: {
                input: {
                    name?: string;
                    phone?: string;
                    state?: string;
                    address?: string;
                    profilePicture?: string;
                    telegramUsername?: string;
                };
            },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);

            if (typeof input.name === 'string') {
                const name = input.name.trim();
                if (!name) {
                    throw new Error('Name cannot be empty');
                }
                user.name = name;
            }

            if (typeof input.phone === 'string') {
                const phone = input.phone.trim();
                if (!phone) {
                    throw new Error('Phone number cannot be empty');
                }
                user.phone = phone;
            }

            if (typeof input.state === 'string') {
                user.state = input.state.trim();
            }

            if (typeof input.address === 'string') {
                user.address = input.address.trim();
            }

            if (typeof input.telegramUsername === 'string') {
                user.telegramUsername = normalizeTelegramUsername(input.telegramUsername);
            }

            if (typeof input.profilePicture === 'string') {
                if (input.profilePicture.length > 1500000) {
                    throw new Error('Profile picture is too large. Please upload a smaller image.');
                }
                user.profilePicture = input.profilePicture;
            }

            await user.save();

            const counts = await buildUserCounts(user._id.toString());

            return {
                success: true,
                message: 'Profile updated successfully',
                user: serializeUser(user, counts),
            };
        },

        fundWallet: async (_parent: unknown, { amount }: { amount: number }, { req }: GraphQLContext) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);

            if (!amount || amount <= 0) {
                throw new Error('Amount must be greater than zero');
            }

            const payment = await initializePayment(user.email, amount, user._id.toString());

            await createTransaction(
                user._id,
                'Wallet Funding',
                amount,
                'credit',
                payment.reference
            );

            return {
                success: true,
                message: 'Payment initialized',
                data: payment,
            };
        },
        verifyWalletFunding: async (
            _parent: unknown,
            { reference }: { reference: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);

            if (!reference) {
                throw new Error('Payment reference is required');
            }

            const paymentData = await verifyPayment(reference);
            if (paymentData.status !== 'success') {
                throw new Error('Payment has not been completed yet');
            }

            const paymentUserId = getPaymentUserId(paymentData);
            if (paymentUserId && paymentUserId !== user._id.toString()) {
                throw new Error('This payment does not belong to the current user');
            }

            const amount = Number(paymentData.amount) / 100;
            let transaction = await Transaction.findOne({ reference });

            if (!transaction) {
                transaction = await createTransaction(
                    user._id,
                    'Wallet Funding',
                    amount,
                    'credit',
                    reference
                );
            }

            if (transaction.status !== 'Success') {
                await creditWallet(user._id, amount);
                transaction = await updateTransactionStatus(reference, 'Success');
            }

            return {
                success: true,
                message: 'Wallet funded successfully',
                transaction: transaction ? serializeTransaction(transaction) : null,
            };
        },
        resolveWithdrawalAccount: async (
            _parent: unknown,
            { accountNumber, bankCode }: { accountNumber: string; bankCode: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            await getAuthenticatedUser(req);

            const normalizedAccountNumber = normalizeAccountNumber(accountNumber);
            const normalizedBankCode = bankCode.trim();

            if (!normalizedBankCode) {
                throw new Error('Bank code is required');
            }

            if (normalizedAccountNumber.length !== 10) {
                throw new Error('Account number must be 10 digits');
            }

            try {
                const resolution = await resolveAccountNumber(normalizedAccountNumber, normalizedBankCode);

                const accountName = String(
                    resolution?.account_name ??
                    resolution?.accountName ??
                    resolution?.account_name?.trim?.() ??
                    ''
                ).trim();

                return {
                    success: true,
                    message: 'Account verified successfully',
                    accountName,
                };
            } catch (error) {
                throw new Error(getPaystackErrorMessage(error, 'We could not verify this bank account'));
            }
        },
        withdrawToBank: async (
            _parent: unknown,
            {
                input,
            }: {
                input: {
                    bankCode: string;
                    bankName: string;
                    accountNumber: string;
                    accountName: string;
                    amount: number;
                    reason?: string;
                };
            },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);

            const bankCode = input.bankCode.trim();
            const bankName = input.bankName.trim();
            const accountNumber = normalizeAccountNumber(input.accountNumber);
            const amount = Number(input.amount);
            const reason = input.reason?.trim() || 'Wallet withdrawal';

            if (!bankCode || !bankName) {
                throw new Error('Bank details are required');
            }

            if (accountNumber.length !== 10) {
                throw new Error('Account number must be 10 digits');
            }

            if (!amount || amount <= 0) {
                throw new Error('Withdrawal amount must be greater than zero');
            }

            if ((user.walletBalance ?? 0) < amount) {
                throw new Error('Insufficient wallet balance');
            }

            try {
                const resolution = await resolveAccountNumber(accountNumber, bankCode);
                const resolvedAccountName = String(resolution.account_name || input.accountName || '').trim();

                if (!resolvedAccountName) {
                    throw new Error('We could not verify this bank account');
                }

                const recipient = await createTransferRecipient({
                    name: resolvedAccountName,
                    accountNumber,
                    bankCode,
                });

                const reference = generateTransferReference();
                let walletDebited = false;
                let transaction: TransactionRecord | null = null;
                let withdrawalRecord: { _id: ObjectIdLike } | null = null;

                try {
                    await deductWallet(user._id, amount);
                    walletDebited = true;

                    transaction = await createTransaction(user._id, 'Withdrawal', amount, 'debit', reference);

                    const createdWithdrawalRecord = await Withdrawal.create({
                        userId: user._id,
                        amount,
                        bankCode,
                        bankName,
                        accountNumber,
                        accountName: resolvedAccountName,
                        reason,
                        reference,
                        recipientCode: recipient.recipient_code || '',
                    });
                    withdrawalRecord = createdWithdrawalRecord;
                    const withdrawalRecordId = createdWithdrawalRecord._id;

                    const transfer = await initiateTransfer({
                        recipient: recipient.recipient_code,
                        amount,
                        reference,
                        reason,
                    });

                    const providerStatus = String(transfer.status || '').toLowerCase();
                    const mappedStatus = mapWithdrawalProviderStatus(providerStatus);
                    const failureReason = mappedStatus === 'Failed'
                        ? String(transfer.complete_message || transfer.message || 'Withdrawal failed')
                        : '';

                    await Withdrawal.findByIdAndUpdate(withdrawalRecordId, {
                        transferCode: transfer.transfer_code || transfer.code || '',
                        providerStatus,
                        status: mappedStatus,
                        failureReason,
                    });

                    transaction = await updateTransactionStatus(reference, mappedStatus);

                    if (mappedStatus === 'Failed' && walletDebited) {
                        await refundWallet(user._id, amount);
                        walletDebited = false;
                    }

                    return {
                        success: mappedStatus !== 'Failed',
                        message: mappedStatus === 'Failed'
                            ? failureReason || 'Withdrawal failed'
                            : buildWithdrawalMessage(providerStatus),
                        transaction: transaction ? serializeTransaction(transaction) : null,
                    };
                } catch (error) {
                    if (walletDebited) {
                        await refundWallet(user._id, amount);
                    }

                    if (withdrawalRecord) {
                        await Withdrawal.findByIdAndUpdate(withdrawalRecord._id, {
                            status: 'Failed',
                            providerStatus: 'failed',
                            failureReason: getPaystackErrorMessage(error, 'Withdrawal failed'),
                        });
                    }

                    if (transaction) {
                        transaction = await updateTransactionStatus(reference, 'Failed');
                    }

                    throw error;
                }
            } catch (error) {
                throw new Error(getPaystackErrorMessage(error, 'We could not complete the withdrawal'));
            }
        },

        buyAirtime: async (
            _parent: unknown,
            { input }: { input: { phone: string; network: string; amount: number } },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);

            if (!input.amount || input.amount <= 0) {
                throw new Error('Amount must be greater than zero');
            }

            const reference = `AIRTIME_${Date.now()}`;
            await deductWallet(user._id, input.amount);
            await createTransaction(user._id, 'Airtime', input.amount, 'debit', reference);

            const result = await purchaseAirtime(input.phone, input.network, input.amount);

            if (result.success) {
                await updateTransactionStatus(reference, 'Success');
            } else {
                await refundWallet(user._id, input.amount);
                await updateTransactionStatus(reference, 'Failed');
            }

            const transaction = await Transaction.findOne({ reference });

            return {
                success: result.success,
                message: result.success ? 'Airtime purchased successfully' : String(result.error || 'Airtime purchase failed'),
                transaction: transaction ? serializeTransaction(transaction) : null,
            };
        },

        buyData: async (
            _parent: unknown,
            { input }: { input: { phone: string; network: string; planId: string; amount: number } },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);
            const amount = Number(input.amount);

            if (!amount || amount <= 0) {
                throw new Error('Invalid plan amount');
            }

            if (!input.planId) {
                throw new Error('Data plan ID is required');
            }

            const reference = `DATA_${Date.now()}`;
            await deductWallet(user._id, amount);
            await createTransaction(user._id, 'Data', amount, 'debit', reference);

            const result = await purchaseData(input.phone, input.network, input.planId);

            if (result.success) {
                await updateTransactionStatus(reference, 'Success');
            } else {
                await refundWallet(user._id, amount);
                await updateTransactionStatus(reference, 'Failed');
            }

            const transaction = await Transaction.findOne({ reference });

            return {
                success: result.success,
                message: result.success ? 'Data purchased successfully' : String(result.error || 'Data purchase failed'),
                transaction: transaction ? serializeTransaction(transaction) : null,
            };
        },
        submitServiceRequest: async (
            _parent: unknown,
            {
                input,
            }: {
                input: {
                    category: string;
                    title: string;
                    provider?: string;
                    accountOrPhone?: string;
                    amount?: number;
                    direction?: string;
                    note?: string;
                };
            },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const user = await getAuthenticatedUser(req);
            const amount = Number(input.amount || 0);

            if (!input.category || !input.title) {
                throw new Error('Category and title are required');
            }

            if (amount <= 0) {
                throw new Error('Amount must be greater than zero');
            }

            const { feePercentage, expectedCredit } = buildAirtimeToCashValues(input.category, amount);

            const request = await ServiceRequest.create({
                userId: user._id,
                category: input.category,
                title: input.title,
                provider: input.provider || '',
                accountOrPhone: input.accountOrPhone || '',
                amount,
                direction: input.direction || '',
                note: input.note || '',
                feePercentage,
                expectedCredit,
            });

            return {
                success: true,
                message: input.category === 'Airtime to Cash'
                    ? `Request submitted successfully. Expected wallet credit after 7% charge: ${expectedCredit}.`
                    : 'Service request submitted successfully',
                request: serializeServiceRequest(request),
            };
        },
        updateServiceRequestStatus: async (
            _parent: unknown,
            { requestId, status }: { requestId: string; status: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            await getAuthenticatedAdmin(req);

            const normalizedStatus = normalizeStatus(status, ['Pending', 'In Review', 'Completed', 'Declined']);
            const request = await ServiceRequest.findByIdAndUpdate(
                requestId,
                { status: normalizedStatus },
                { new: true }
            );

            if (!request) {
                throw new Error('Service request not found');
            }

            return {
                success: true,
                message: 'Service request updated successfully',
                request: serializeServiceRequest(request),
            };
        },
        sendSupportMessage: async (
            _parent: unknown,
            {
                input,
            }: {
                input: {
                    subject: string;
                    message: string;
                    category?: string;
                    preferredChannel: string;
                    contactHandle?: string;
                };
            },
            { req }: GraphQLContext
        ) => {
            console.log('[SUPPORT MSG] sendSupportMessage resolver called');
            console.log('[SUPPORT MSG] input:', input);

            await connectDB();
            const user = await getAuthenticatedUser(req);

            if (!input.subject.trim() || !input.message.trim()) {
                throw new Error('Subject and message are required');
            }

            const allowedChannels = ['WhatsApp', 'Telegram', 'Phone', 'Email'];
            if (!allowedChannels.includes(input.preferredChannel)) {
                throw new Error(`Preferred channel must be one of: ${allowedChannels.join(', ')}`);
            }

            const category = normalizeSupportCategory(input.category);
            console.log('[SUPPORT MSG] category input:', input.category, 'normalized:', category);
            const contactHandle = buildSupportContactHandle(user, input);

            const supportMessage = await SupportMessage.create({
                userId: user._id,
                subject: input.subject.trim(),
                message: input.message.trim(),
                category,
                senderRole: 'user',
                senderName: user.name || '',
                preferredChannel: input.preferredChannel,
                contactHandle,
            });

            const giftCardAlertResult = category === 'Gift Card'
                ? await notifyAdminsAboutGiftCardChat({
                    user,
                    preferredChannel: input.preferredChannel,
                    contactHandle,
                    message: input.message.trim(),
                })
                : null;

            return {
                success: true,
                message: category === 'Gift Card'
                    ? giftCardAlertResult?.sent
                        ? 'Your gift card chat has been sent. Hold on until the admin is online.'
                        : 'Your gift card chat has been sent and the admin dashboard was alerted, but the email alert could not be delivered yet.'
                    : 'Your message has been sent to support. An admin can now follow up from the dashboard.',
                supportMessage: serializeSupportMessage(supportMessage, user),
            };
        },
        adminReplySupportMessage: async (
            _parent: unknown,
            {
                userId,
                input,
            }: {
                userId: string;
                input: {
                    subject: string;
                    message: string;
                    category?: string;
                    preferredChannel?: string;
                };
            },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const admin = await getAuthenticatedAdmin(req);
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            if (!input.subject.trim() || !input.message.trim()) {
                throw new Error('Subject and message are required');
            }

            const category = normalizeSupportCategory(input.category);
            const preferredChannel = input.preferredChannel || 'Email';
            const supportMessage = await SupportMessage.create({
                userId: user._id,
                subject: input.subject.trim(),
                message: input.message.trim(),
                category,
                senderRole: 'admin',
                senderName: admin.name || 'Admin',
                preferredChannel,
                contactHandle: admin.email || '',
                status: 'Contacted',
            });

            return {
                success: true,
                message: 'Reply sent successfully',
                supportMessage: serializeSupportMessage(supportMessage, user),
            };
        },
        updateSupportMessageStatus: async (
            _parent: unknown,
            { messageId, status }: { messageId: string; status: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            await getAuthenticatedAdmin(req);

            const normalizedStatus = normalizeStatus(status, ['Unread', 'Read', 'Contacted', 'Closed']);
            const supportMessage = await SupportMessage.findByIdAndUpdate(
                messageId,
                { status: normalizedStatus },
                { new: true }
            ).populate('userId');

            if (!supportMessage) {
                throw new Error('Support message not found');
            }

            return {
                success: true,
                message: 'Support message updated successfully',
                supportMessage: serializeSupportMessage(supportMessage, supportMessage.userId),
            };
        },
        deleteUser: async (
            _parent: unknown,
            { userId }: { userId: string },
            { req }: GraphQLContext
        ) => {
            await connectDB();
            const admin = await getAuthenticatedAdmin(req);

            if (admin._id.toString() === userId) {
                throw new Error('Admins cannot delete their own account from this page');
            }

            const existingUser = await User.findById(userId);
            if (!existingUser) {
                throw new Error('User not found');
            }

            await Promise.all([
                Transaction.deleteMany({ userId }),
                ServiceRequest.deleteMany({ userId }),
                SupportMessage.deleteMany({ userId }),
                User.findByIdAndDelete(userId),
            ]);

            return {
                success: true,
                message: 'User and related records deleted successfully',
            };
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
    context: async (req) => ({ req }),
});

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
    return handler(request);
}

export async function POST(request: NextRequest) {
    return handler(request);
}
