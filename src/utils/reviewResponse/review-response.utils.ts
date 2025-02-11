// utils/responseData/review-response.utils.ts
import { IReview } from "../../interfaces/review/review.interface";
export const reviewResponseData = (review: IReview) => {
    return {
        _id: review._id,
        userId: review.userId,
        hotelId: review.hotelId,
        bookingId: review.bookingId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        categories: review.categories,
        status: review.status,
        createdAt: review.createdAt
    };
};