import mongoose from 'mongoose';

const loanRepaymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // The ServiceRequest (category=Loan) representing the approved loan.
        loanRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceRequest',
            required: true,
        },

        // Principal the user is paying back.
        principalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // What user actually pays via Paystack (currently same as principalAmount).
        repaymentAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Paystack reference for the repayment checkout.
        paystackReference: {
            type: String,
            required: true,
            unique: true,
        },

        status: {
            type: String,
            enum: ['Pending', 'Success', 'Failed'],
            default: 'Pending',
        },

        repaidAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const LoanRepayment =
    mongoose.models.LoanRepayment || mongoose.model('LoanRepayment', loanRepaymentSchema);

export default LoanRepayment;

