// services/featured-hotel.manager.ts

import FeaturedHotel from "../models/featured-hotel.model";
import { IFeaturedHotel } from "../interfaces/featured-hotel.interface";
import mongoose, { FilterQuery } from "mongoose";
import Hotel from "../models/hotel.model";

export class FeaturedHotelManager {
    private static instance: FeaturedHotelManager;

    private constructor() {}

    public static getInstance(): FeaturedHotelManager {
        if (!FeaturedHotelManager.instance) {
            FeaturedHotelManager.instance = new FeaturedHotelManager();
        }
        return FeaturedHotelManager.instance;
    }

    /**
     * Create a new featured hotel
     */
    public async create(featuredHotelData: Partial<IFeaturedHotel>): Promise<IFeaturedHotel> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check for existing active feature
            const existingFeature = await FeaturedHotel.findOne({
                hotelId: featuredHotelData.hotelId,
                sectionType: featuredHotelData.sectionType,
                isActive: true,
                endDate: { $gte: new Date() }
            }).session(session);

            if (existingFeature) {
                throw new Error('Hotel is already featured in this section');
            }

            // Get next position if not provided
            if (!featuredHotelData.position) {
                featuredHotelData.position = await this.getNextPosition(
                    featuredHotelData.sectionType as string,
                    session
                );
            }

            // Create and save featured hotel
            const newFeaturedHotel = new FeaturedHotel(featuredHotelData);
            await newFeaturedHotel.save({ session });

            await session.commitTransaction();

            // Return populated result with null check
            const populatedHotel = await FeaturedHotel.findById(newFeaturedHotel._id)
                .populate({
                    path: 'hotelId',
                    select: 'name type description address images mainImage rating hotelCode'
                })
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');

            if (!populatedHotel) {
                throw new Error('Failed to create featured hotel');
            }

            return populatedHotel.toObject() as IFeaturedHotel;

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get all featured hotels
     */
    public async getAll({
        filters = {},
        page = 1,
        limit = 10,
        sortField = 'createdAt',
        sortOrder = 'desc'
    }): Promise<{ hotels: IFeaturedHotel[], total: number }> {
        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortField] = sortOrder === 'asc' ? 1 : -1;

        console.log('filters', filters);
    
        const [hotels, total] = await Promise.all([
            FeaturedHotel.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'hotelId',
                    select: 'name type description address images mainImage rating hotelCode'
                })
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email'),
            FeaturedHotel.countDocuments(filters)
        ]);
    
        return { 
            hotels: hotels.map(hotel => hotel.toObject()) as IFeaturedHotel[], 
            total 
        };
    }
    

    /**
     * Get featured hotel by ID
     */
    public async getById(id: string): Promise<IFeaturedHotel | null> {
        const hotel = await FeaturedHotel.findById(id)
            .populate({
                path: 'hotelId',
                select: 'name type description address images mainImage rating hotelCode'
            })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
    
        return hotel ? hotel.toObject() as IFeaturedHotel : null;
    }
    

    /**
     * Update featured hotel
     */
    public async update(
        id: string,
        updateData: Partial<IFeaturedHotel>,
        userId: string
    ): Promise<IFeaturedHotel | null> {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const currentFeatured = await FeaturedHotel.findById(id).session(session);
            if (!currentFeatured) {
                throw new Error('Featured hotel not found');
            }
    
            // Handle position updates if needed
            if (updateData.position !== undefined) {
                if (updateData.sectionType && updateData.sectionType !== currentFeatured.sectionType) {
                    await this.validateAndUpdatePositions(
                        updateData.sectionType,
                        updateData.position,
                        session
                    );
                }
            }
    
            // Update the featured hotel
            const updatedHotel = await FeaturedHotel.findByIdAndUpdate(
                id,
                {
                    $set: {
                        ...updateData,
                        updatedBy: userId,
                        updatedAt: new Date()
                    }
                },
                { new: true, session }
            ).populate({
                path: 'hotelId',
                select: 'name type description address images mainImage rating hotelCode'
            });
    
            await session.commitTransaction();
            return updatedHotel ? updatedHotel.toObject() as IFeaturedHotel : null;
    
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Delete featured hotel
     */
    public async delete(id: string): Promise<IFeaturedHotel | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const deletedHotel = await FeaturedHotel.findByIdAndDelete(id)
                .session(session);

            if (deletedHotel) {
                await this.reorderPositions(
                    deletedHotel.sectionType,
                    deletedHotel.position,
                    session
                );
            }

            await session.commitTransaction();
            return deletedHotel ? deletedHotel.toObject() as IFeaturedHotel : null;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get featured hotels by section
     */
    public async getBySection(sectionType: string, limit = 10): Promise<IFeaturedHotel[]> {
        return await FeaturedHotel.find({
            sectionType,
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        })
        .sort({ position: 1 })
        .limit(limit)
        .populate({
            path: 'hotelId',
            select: 'name type description address images mainImage rating hotelCode'
        });
    }

    /**
     * Helper method to get next position
     */
    public async getNextPosition(
        sectionType: string,
        session?: mongoose.ClientSession
    ): Promise<number> {
        const lastFeatured = await FeaturedHotel.findOne({ sectionType })
            .sort('-position')
            .session(session || null);
        return (lastFeatured?.position || 0) + 1;
    }

    /**
     * Helper method to validate and update positions
     */
    private async validateAndUpdatePositions(
        sectionType: string,
        position: number,
        session: mongoose.ClientSession
    ): Promise<void> {
        await FeaturedHotel.updateMany(
            {
                sectionType,
                position: { $gte: position }
            },
            {
                $inc: { position: 1 }
            },
            { session }
        );
    }

    /**
     * Helper method to reorder positions after deletion
     */
    private async reorderPositions(
        sectionType: string,
        deletedPosition: number,
        session: mongoose.ClientSession
    ): Promise<void> {
        await FeaturedHotel.updateMany(
            {
                sectionType,
                position: { $gt: deletedPosition }
            },
            {
                $inc: { position: -1 }
            },
            { session }
        );
    }

    /**
     * Get featured hotel statistics
     */
    public async getStats(): Promise<any> {
        return await FeaturedHotel.aggregate([
            {
                $group: {
                    _id: '$sectionType',
                    activeCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$isActive', true] },
                                        { $lte: ['$startDate', new Date()] },
                                        { $gte: ['$endDate', new Date()] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    totalCount: { $sum: 1 },
                    upcomingCount: {
                        $sum: {
                            $cond: [
                                { $gt: ['$startDate', new Date()] },
                                1,
                                0
                            ]
                        }
                    },
                    expiredCount: {
                        $sum: {
                            $cond: [
                                { $lt: ['$endDate', new Date()] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);
    }
}

export default FeaturedHotelManager.getInstance();