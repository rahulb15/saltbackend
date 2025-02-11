// interfaces/review/review.manager.interface.ts
import { IReview } from "./review.interface";

export interface IReviewManager {
    create(review: IReview): Promise<IReview>;
    getAll(filters?: any, page?: number, limit?: number): Promise<{ reviews: IReview[], total: number }>;
    getById(id: string): Promise<IReview | null>;
    getHotelReviews(hotelId: string, page?: number, limit?: number): Promise<{ reviews: IReview[], total: number }>;
    update(id: string, review: Partial<IReview>): Promise<IReview | null>;
    updateStatus(id: string, status: string): Promise<IReview | null>;
    delete(id: string): Promise<IReview | null>;
    getAverageRating(hotelId: string): Promise<number>;
    respondToReview(
        id: string,
        response: {
            comment: string;
            respondedBy: string;
        }
    ): Promise<IReview | null>;
}
