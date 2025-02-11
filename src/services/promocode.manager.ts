
// services/promocode.manager.ts
import Promocode from "../models/promocode.model";
import { IPromocode } from "../interfaces/promocode/promocode.interface";

export class PromocodeManager {
    private static instance: PromocodeManager;

    private constructor() {}

    public static getInstance(): PromocodeManager {
        if (!PromocodeManager.instance) {
            PromocodeManager.instance = new PromocodeManager();
        }
        return PromocodeManager.instance;
    }

    public async create(promocode: IPromocode): Promise<IPromocode> {
        const newPromocode = new Promocode(promocode);
        return await newPromocode.save();
    }

    public async getAll(
        filters: any = {},
        page: number = 1,
        limit: number = 10,
        sortField: string = 'createdAt',
        sortOrder: string = 'desc'
    ): Promise<{ promocodes: IPromocode[]; total: number }> {
        const skip = (page - 1) * limit;
        const sortOptions: any = {};
        sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

        const [promocodes, total] = await Promise.all([
            Promocode.find(filters)
                .skip(skip)
                .limit(limit)
                .sort(sortOptions),
            Promocode.countDocuments(filters)
        ]);

        return { promocodes, total };
    }

    public async getById(id: string): Promise<IPromocode | null> {
        return await Promocode.findById(id);
    }

    public async update(id: string, promocode: Partial<IPromocode>): Promise<IPromocode | null> {
        return await Promocode.findByIdAndUpdate(
            id,
            { $set: promocode },
            { new: true }
        );
    }

    public async delete(id: string): Promise<IPromocode | null> {
        return await Promocode.findByIdAndDelete(id);
    }

    public async validatePromocode(code: string, roomType: string, bookingAmount: number): Promise<{ 
        valid: boolean; 
        message: string;
        discountAmount?: number;
    }> {

        console.log('Validating promocode:', code.toUpperCase(), roomType, bookingAmount);
        const promocode = await Promocode.findOne({ 
            code: code.toUpperCase(),
            // roomType,
            isActive: true,
            // validFrom: { $lte: new Date() },
            // validTo: { $gte: new Date() }
        });

        console.log('Promocode:', promocode);

        if (!promocode) {
            return { valid: false, message: 'Invalid promocode' };
        }

        if (promocode.maxUsageCount && promocode.currentUsageCount >= promocode.maxUsageCount) {
            return { valid: false, message: 'Promocode usage limit exceeded' };
        }

        if (bookingAmount < promocode.minBookingAmount) {
            return { 
                valid: false, 
                message: `Minimum booking amount should be ${promocode.minBookingAmount}` 
            };
        }

        console.log('Promocode discount:', promocode.discountType, promocode.discountValue);

        let discountAmount = promocode.discountType === 'PERCENTAGE' 
            ? (bookingAmount * promocode.discountValue / 100)
            : promocode.discountValue;

        // if (promocode.maxDiscountAmount) {
        //     discountAmount = Math.min(discountAmount, promocode.maxDiscountAmount);
        // }

        return { 
            valid: true, 
            message: 'Promocode applied successfully',
            discountAmount 
        };
    }

    public async incrementUsage(code: string): Promise<void> {
        await Promocode.updateOne(
            { code: code.toUpperCase() },
            { $inc: { currentUsageCount: 1 } }
        );
    }
}

export default PromocodeManager.getInstance();
