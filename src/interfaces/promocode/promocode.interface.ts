// interfaces/promocode/promocode.interface.ts
export interface IPromocode extends Document {
    code: string;
    roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD' | 'QUEEN' | 'KING' | 'OTHERS';
    validFrom: Date;
    validTo: Date;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxDiscountAmount?: number;
    minBookingAmount: number;
    maxUsageCount?: number;
    currentUsageCount: number;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}
