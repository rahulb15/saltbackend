import Hotel from "../models/hotel.model";
import { IHotel } from "../interfaces/hotel/hotel.interface";
import { IHotelManager } from "../interfaces/hotel/hotel.manager.interface";

export class HotelManager implements IHotelManager {
    private static instance: HotelManager;

    private constructor() {}

    public static getInstance(): HotelManager {
        if (!HotelManager.instance) {
            HotelManager.instance = new HotelManager();
        }
        return HotelManager.instance;
    }

    public async create(hotel: IHotel): Promise<IHotel> {
        const newHotel = new Hotel(hotel);
        return await newHotel.save();
    }

    public async getAll(
        filters: any = {},
        page: number = 1,
        limit: number = 10,
        sortField: string = 'createdAt',
        sortOrder: string = 'desc'
    ): Promise<{ hotels: IHotel[]; total: number }> {
        const skip = (page - 1) * limit;
        const sortOptions: any = {};
        sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

        const [hotels, total] = await Promise.all([
            Hotel.find(filters)
                .skip(skip)
                .limit(limit)
                .sort(sortOptions)
                .populate('reviews', 'rating comment')
                .populate('rooms', 'name type price'),
            Hotel.countDocuments(filters)
        ]);

        return { hotels, total };
    }

    public async getById(id: string): Promise<IHotel | null> {
        return await Hotel.findById(id)
            .populate('reviews')
            .populate('rooms');
    }

    public async update(id: string, hotel: Partial<IHotel>): Promise<IHotel | null> {
        return await Hotel.findByIdAndUpdate(
            id,
            { 
                $set: {
                    ...hotel,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
    }

    public async delete(id: string): Promise<IHotel | null> {
        // First check if hotel exists
        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return null;
        }

        // TODO: Add cleanup logic for related data (reviews, rooms, etc.)
        // This should be handled in a transaction
        
        return await Hotel.findByIdAndDelete(id);
    }

    public async search(filters: any): Promise<IHotel[]> {
        return await Hotel.find(filters)
            .populate('reviews', 'rating comment')
            .sort({ rating: -1 })
            .limit(10);
    }

    public async updateStatus(id: string, status: string): Promise<IHotel | null> {
        return await Hotel.findByIdAndUpdate(
            id,
            {
                $set: {
                    status,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
    }

    public async bulkDelete(ids: string[]): Promise<boolean> {
        const result = await Hotel.deleteMany({ _id: { $in: ids } });
        return result.deletedCount > 0;
    }

    public async getHotelStats(): Promise<any> {
        return await Hotel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);
    }
}

export default HotelManager.getInstance();