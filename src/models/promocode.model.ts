// models/promocode.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { IPromocode } from "../interfaces/promocode/promocode.interface";

interface IPromocodeDocument extends Document {
    discountType: 'PERCENTAGE' | 'FIXED';
}

const promocodeSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'QUEEN', 'KING', 'OTHERS']
    },
    validFrom: {
        type: Date,
        required: true
    },
    validTo: {
        type: Date,
        required: true
    },
    discountType: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED'],
        default: 'FIXED'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    maxDiscountAmount: {
        type: Number,
        required: function(this: IPromocodeDocument) {
            return this.discountType === 'PERCENTAGE';
        }
    },
    minBookingAmount: {
        type: Number,
        default: 0
    },
    maxUsageCount: {
        type: Number,
        default: null
    },
    currentUsageCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

// Add indexes
promocodeSchema.index({ code: 1 });
promocodeSchema.index({ validFrom: 1, validTo: 1 });
promocodeSchema.index({ isActive: 1 });
promocodeSchema.index({ roomType: 1 });

const Promocode = mongoose.model<IPromocode>("Promocode", promocodeSchema);
export default Promocode;