// models/transaction.model.ts
import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
        index: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    status: {
        type: String,
        enum: ["created", "authorized", "captured", "failed", "refunded"],
        default: "created",
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ["card", "netbanking", "wallet", "upi", "emi"],
        required: false
    },
    paymentDetails: {
        cardNetwork: String,
        cardLastDigits: String,
        bankName: String,
        walletName: String,
        upiId: String,
        emiPlan: String
    },
    refund: {
        refundId: String,
        amount: Number,
        status: String,
        reason: String,
        processedAt: Date
    },
    metadata: Schema.Types.Mixed,
    webhookEvents: [{
        eventId: String,
        eventType: String,
        eventData: Schema.Types.Mixed,
        receivedAt: Date
    }],
    error: {
        code: String,
        description: String,
        source: String,
        reason: String
    }
}, {
    timestamps: true
});

// Indexes
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ "webhookEvents.eventId": 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;