// middlewares/featured-hotel.validation.middleware.ts

import { Request, Response, NextFunction } from "express";
import { ResponseStatus, ResponseMessage, ResponseCode } from "../enum/response-message.enum";
import mongoose from "mongoose";

export const validateFeaturedHotel = (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            hotelId,
            sectionType,
            startDate,
            endDate,
            position,
            customTitle,
            customDescription,
            highlightTags,
            promotionalOffer,
            customAmenities,
            displayPrice,
            specialFeatures
        } = req.body;

        // Check if it's a POST request (creation)
        const isCreating = req.method === 'POST';

        // Validate required fields for creation
        if (isCreating) {
            if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Valid hotel ID is required",
                    data: null
                });
            }

            if (!sectionType) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Section type is required",
                    data: null
                });
            }

            if (!startDate || !endDate) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Start date and end date are required",
                    data: null
                });
            }
        }

        // Validate section type if provided
        if (sectionType) {
            const validSectionTypes = ['featured', 'trending', 'topRated', 'recommended'];
            if (!validSectionTypes.includes(sectionType)) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Invalid section type",
                    data: null
                });
            }
        }

        // Validate dates if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Invalid date format",
                    data: null
                });
            }

            if (start > end) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Start date must be before end date",
                    data: null
                });
            }
        }

        // Validate position if provided
        if (position !== undefined) {
            const positionNum = Number(position);
            if (isNaN(positionNum) || positionNum < 0) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Position must be a non-negative number",
                    data: null
                });
            }
        }

        // Validate arrays if provided
        if (highlightTags && !Array.isArray(highlightTags)) {
            return res.status(ResponseCode.BAD_REQUEST).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.VALIDATION_ERROR,
                description: "Highlight tags must be an array",
                data: null
            });
        }

        if (customAmenities && !Array.isArray(customAmenities)) {
            return res.status(ResponseCode.BAD_REQUEST).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.VALIDATION_ERROR,
                description: "Custom amenities must be an array",
                data: null
            });
        }

        if (specialFeatures && !Array.isArray(specialFeatures)) {
            return res.status(ResponseCode.BAD_REQUEST).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.VALIDATION_ERROR,
                description: "Special features must be an array",
                data: null
            });
        }

        // Validate display price if provided
        if (displayPrice) {
            if (typeof displayPrice !== 'object' || displayPrice === null) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Display price must be an object",
                    data: null
                });
            }

            const { basePrice, discountedPrice, discountPercentage } = displayPrice;

            if (basePrice && (isNaN(Number(basePrice)) || Number(basePrice) < 0)) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Base price must be a non-negative number",
                    data: null
                });
            }

            if (discountedPrice && (isNaN(Number(discountedPrice)) || Number(discountedPrice) < 0)) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Discounted price must be a non-negative number",
                    data: null
                });
            }

            if (discountPercentage && (isNaN(Number(discountPercentage)) || Number(discountPercentage) < 0 || Number(discountPercentage) > 100)) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Discount percentage must be between 0 and 100",
                    data: null
                });
            }
        }

        next();
    } catch (error) {
        return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
            status: ResponseStatus.FAILED,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            description: "Validation error occurred",
            data: null
        });
    }
};

export default validateFeaturedHotel;