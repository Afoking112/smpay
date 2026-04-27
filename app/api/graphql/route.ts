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
import { initializePayment, verifyPayment } from '../../../services/paystack.js';
import { buyAirtime as purchaseAirtime, buyData as purchaseData } from '../../../services/vtu.js';
import { sendAdminGiftCardAlert } from '../../../services/email.js';
import {
    createTransaction,
    creditWallet,
    deductWallet,
    refundWallet,
    updateTransactionStatus,
} from '../../../services/transaction.js';

const typeDefs = gql`
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
  }

  type ServiceRequestResponse {
    success: Boolean!
    message: String!
    request: ServiceRequest
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

  type AuthPayload {
    success: Boolean!
    message: String!
    token: String!
    user: User
  }

  type Query {
    me: User
    walletBalance: Float!
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
    forgotPassword(email: String!, phone: String!, newPassword: String!): BasicResponse!
    updateProfile(input: UpdateProfileInput!): UserResponse!
    fundWallet(amount: Float!): PaymentResponse!
    verifyWalletFunding(reference: String!): TransactionResponse!
    buyAirtime(input: BuyAirtimeInput!): TransactionResponse!
    buyData(input: BuyDataInput!): TransactionResponse!
    submitServiceRequest(input: ServiceRequestInput!): ServiceRequestResponse!
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
    const admins = await User.find({ role: 'admin' }).select('email');
    const recipients = admins
        .map((admin) => admin.email)
        .filter((email): email is string => Boolean(email));

    try {
        await sendAdminGiftCardAlert({
            recipients,
            userName: user.name || 'Unknown user',
            userEmail: user.email || '',
            userPhone: user.phone || '',
            preferredChannel,
            contactHandle,
            message,
        });
    } catch (error) {
        console.error('Failed to send gift card admin email alert', error);
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
            { email, phone, newPassword }: { email: string; phone: string; newPassword: string }
        ) => {
            await connectDB();

            if (!email || !phone || !newPassword) {
                throw new Error('Email, phone number, and new password are required');
            }

            if (newPassword.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const user = await User.findOne({ email: normalizeEmail(email) });
            if (!user || user.phone.trim() !== phone.trim()) {
                throw new Error('We could not verify your account with that email and phone number');
            }

            user.password = await bcrypt.hash(newPassword, 12);
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

            if (category === 'Gift Card') {
                await notifyAdminsAboutGiftCardChat({
                    user,
                    preferredChannel: input.preferredChannel,
                    contactHandle,
                    message: input.message.trim(),
                });
            }

            return {
                success: true,
                message: category === 'Gift Card'
                    ? 'Your gift card chat has been sent. Hold on until the admin is online.'
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
