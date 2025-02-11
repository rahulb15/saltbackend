
// managers/review.manager.ts
import Review from "../models/review.model";
import { IReview } from "../interfaces/review/review.interface";
import { IReviewManager } from "../interfaces/review/review.manager.interface";
import mongoose from "mongoose";

export class ReviewManager implements IReviewManager {
    private static instance: ReviewManager;

    private constructor() {}

    public static getInstance(): ReviewManager {
        if (!ReviewManager.instance) {
            ReviewManager.instance = new ReviewManager();
        }
        return ReviewManager.instance;
    }

    public async create(review: IReview): Promise<IReview> {
        const newReview = new Review(review);
        return await newReview.save();
    }

    public async getAll(filters: any = {}, page: number = 1, limit: number = 10): Promise<{ reviews: IReview[], total: number }> {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            Review.find(filters)
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name')
                .populate('hotelId', 'name')
                .sort({ createdAt: -1 }),
            Review.countDocuments(filters)
        ]);
        return { reviews, total };
    }

    public async getById(id: string): Promise<IReview | null> {
        return await Review.findById(id)
            .populate('userId', 'name')
            .populate('hotelId', 'name')
            .populate('bookingId', 'bookingNumber');
    }

    public async getHotelReviews(hotelId: string, page: number = 1, limit: number = 10): Promise<{ reviews: IReview[], total: number }> {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            Review.find({ hotelId, status: 'approved' })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name')
                .sort({ createdAt: -1 }),
            Review.countDocuments({ hotelId, status: 'approved' })
        ]);
        return { reviews, total };
    }

    public async update(id: string, review: Partial<IReview>): Promise<IReview | null> {
        return await Review.findByIdAndUpdate(
            id,
            { ...review, updatedAt: new Date() },
            { new: true }
        );
    }

    public async updateStatus(id: string, status: string): Promise<IReview | null> {
        return await Review.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        );
    }

    public async respondToReview(
        id: string,
        response: { comment: string; respondedBy: string }
    ): Promise<IReview | null> {
        return await Review.findByIdAndUpdate(
            id,
            {
                response: {
                    ...response,
                    respondedAt: new Date()
                },
                updatedAt: new Date()
            },
            { new: true }
        );
    }

    public async delete(id: string): Promise<IReview | null> {
        return await Review.findByIdAndDelete(id);
    }

    public async getAverageRating(hotelId: string): Promise<number> {
        const result = await Review.aggregate([
            { $match: { hotelId: new mongoose.Types.ObjectId(hotelId), status: 'approved' } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        return result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
    }
}

export default ReviewManager.getInstance();