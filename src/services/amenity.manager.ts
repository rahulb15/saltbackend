// services/amenity.manager.ts
import Amenity from "../models/amenity.model";
import { IAmenity } from "../interfaces/amenity/amenity.interface";

export class AmenityManager {
    private static instance: AmenityManager;

    private constructor() {}

    public static getInstance(): AmenityManager {
        if (!AmenityManager.instance) {
            AmenityManager.instance = new AmenityManager();
        }
        return AmenityManager.instance;
    }

    public async create(amenity: IAmenity): Promise<IAmenity> {
        const newAmenity = new Amenity(amenity);
        return await newAmenity.save();
    }

    public async getAll(
        filters: any = {},
        page: number = 1,
        limit: number = 10,
        sortField: string = 'name',
        sortOrder: string = 'asc'
    ): Promise<{ amenities: IAmenity[]; total: number }> {
        const skip = (page - 1) * limit;
        const sortOptions: any = {};
        sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

        const [amenities, total] = await Promise.all([
            Amenity.find(filters)
                .skip(skip)
                .limit(limit)
                .sort(sortOptions),
            Amenity.countDocuments(filters)
        ]);

        return { amenities, total };
    }

    public async getById(id: string): Promise<IAmenity | null> {
        return await Amenity.findById(id);
    }

    public async update(id: string, amenity: Partial<IAmenity>): Promise<IAmenity | null> {
        return await Amenity.findByIdAndUpdate(
            id,
            { $set: { ...amenity, updatedAt: new Date() } },
            { new: true }
        );
    }

    public async delete(id: string): Promise<IAmenity | null> {
        return await Amenity.findByIdAndDelete(id);
    }

    public async bulkDelete(ids: string[]): Promise<boolean> {
        const result = await Amenity.deleteMany({ _id: { $in: ids } });
        return result.deletedCount > 0;
    }

    public async toggleStatus(id: string): Promise<IAmenity | null> {
        const amenity = await Amenity.findById(id);
        if (!amenity) return null;

        amenity.isActive = !amenity.isActive;
        return await amenity.save();
    }

    public async search(query: string): Promise<IAmenity[]> {
        return await Amenity.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).limit(10);
    }
}

export default AmenityManager.getInstance();