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
import { initializePayment, verifyPayment } from '../../../services/paystack.js';
import { buyAirtime as purchaseAirtime, buyData as purchaseData } from '../../../services/vtu.js';
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
    createdAt: String!
  }

  type ServiceRequestResponse {
    success: Boolean!
    message: String!
    request: ServiceRequest
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
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    adminSignup(input: AdminSignupInput!): AuthPayload!
    adminLogin(email: String!, password: String!): AuthPayload!
    fundWallet(amount: Float!): PaymentResponse!
    verifyWalletFunding(reference: String!): TransactionResponse!
    buyAirtime(input: BuyAirtimeInput!): TransactionResponse!
    buyData(input: BuyDataInput!): TransactionResponse!
    submitServiceRequest(input: ServiceRequestInput!): ServiceRequestResponse!
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

function getToken(req: NextRequest) {
    const authHeader = req.headers.get('authorization') || '';
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
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

function getPaymentUserId(paymentData: {
    metadata?: { userId?: string; custom_fields?: Array<{ value?: string }> };
}) {
    return String(paymentData.metadata?.userId || paymentData.metadata?.custom_fields?.[0]?.value || '');
}

function serializeUser(user: typeof User.prototype) {
    return {
        id: user._id.toString(),
        name: user.name ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
        role: user.role ?? 'user',
        walletBalance: user.walletBalance ?? 0,
    };
}

function serializeTransaction(transaction: typeof Transaction.prototype) {
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

function serializeServiceRequest(request: typeof ServiceRequest.prototype) {
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
        createdAt: request.createdAt.toISOString(),
    };
}

const resolvers = {
    Query: {
        me: async (_parent: unknown, _args: unknown, { req }: GraphQLContext) => {
            await connectDB();

            try {
                const user = await getAuthenticatedUser(req);
                return serializeUser(user);
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
    },

    Mutation: {
        signup: async (_parent: unknown, { input }: { input: { name: string; phone: string; email: string; password: string } }) => {
            await connectDB();
            const { name, phone, email, password } = input;

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

            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const user = await User.findOne({ email });
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
            const { name, phone, email, password } = input;

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

            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const user = await User.findOne({ email });
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

            if (!input.category || !input.title) {
                throw new Error('Category and title are required');
            }

            const request = await ServiceRequest.create({
                userId: user._id,
                category: input.category,
                title: input.title,
                provider: input.provider || '',
                accountOrPhone: input.accountOrPhone || '',
                amount: Number(input.amount || 0),
                direction: input.direction || '',
                note: input.note || '',
            });

            return {
                success: true,
                message: 'Service request submitted successfully',
                request: serializeServiceRequest(request),
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
