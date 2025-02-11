// controllers/review.controller.ts
import { Request, Response } from "express";
import reviewManager from "../../services/review.manager";
import { reviewResponseData } from "../../utils/reviewResponse/review-response.utils";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { ResponseStatus, ResponseMessage, ResponseCode,ResponseDescription } from "../../enum/response-message.enum";
import { hotelResponseData } from "../../utils/hotelResponse/hotel-response.utils";




export class ReviewController {
    public async createReview(req: any, res: Response) {
        try {
            const review = req.body;
            review.userId = req.user._id;

            const newReview = await reviewManager.create(review);
            const data = reviewResponseData(newReview);

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.CREATED,
                description: ResponseDescription.REVIEW_CREATED,
                data: data
            };

            res.status(ResponseCode.CREATED).json(response);
        } catch (error) {
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.REVIEW_FAILED,
                data: null
               
            });
        }
    }

    public async getHotelReviews(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const { reviews, total } = await reviewManager.getHotelReviews(
                req.params.hotelId,
                page,
                limit
            );
            
            const data = reviews.map(review => reviewResponseData(review));

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.REVIEW_FETCHED,
                data: {
                    reviews: data,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.REVIEW_FAILED,
                data: null
            });
        }
    }

    public async updateReview(req: any, res: Response) {
        try {
            const review = await reviewManager.getById(req.params.id);
            
            if (!review) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: ResponseDescription.REVIEW_NOT_FOUND,
                    data: null
                });
            }

            // Check if user is authorized to update this review
            if (review.userId.toString() !== req.user._id.toString()) {
                return res.status(ResponseCode.UNAUTHORIZED).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.UNAUTHORIZED,
                    description: ResponseDescription.REVIEW_UNAUTHORIZED,
                    data: null
                });
            }

            const updatedReview:any = await reviewManager.update(req.params.id, req.body);
            const data = reviewResponseData(updatedReview);
            
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.UPDATED,
                description: ResponseDescription.REVIEW_UPDATED,
                data: data
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.REVIEW_FAILED,
                data: null
            });
        }
    }

    public async respondToReview(req: any, res: Response) {
        try {
            const { comment } = req.body;
            const updatedReview = await reviewManager.respondToReview(req.params.id, {
                comment,
                respondedBy: req.user._id
            });
            
            if (!updatedReview) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: ResponseDescription.REVIEW_NOT_FOUND,
                    data: null
                });
            }

            const data = reviewResponseData(updatedReview);
            
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.REVIEW_RESPONSE_ADDED,
                description: ResponseDescription.REVIEW_RESPONSE_ADDED,
                data: data
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.REVIEW_FAILED,
                data: null
            });
        }
    }

    public async deleteReview(req: any, res: Response) {
        try {
            const review = await reviewManager.getById(req.params.id);
            
            if (!review) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    data: null
                });
            }

            // Check if user is authorized to delete this review
            if (!req.user.isAdmin && review.userId.toString() !== req.user._id.toString()) {
                return res.status(ResponseCode.UNAUTHORIZED).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.UNAUTHORIZED,
                    data: null
                });
            }

            await reviewManager.delete(req.params.id);
            
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.DELETED,
                description: ResponseDescription.REVIEW_DELETED,
                data: null
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.REVIEW_FAILED,
                data: null
            });
        }
    }
}

export default new ReviewController();