import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: ['Gift Card', 'Airtime to Cash', 'Electricity', 'Cable TV'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    provider: {
        type: String,
        default: '',
    },
    accountOrPhone: {
        type: String,
        default: '',
    },
    amount: {
        type: Number,
        default: 0,
        min: 0,
    },
    direction: {
        type: String,
        default: '',
    },
    note: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['Pending', 'In Review', 'Completed', 'Declined'],
        default: 'Pending',
    },
}, { timestamps: true });

const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);

export default ServiceRequest;
