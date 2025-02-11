// middlewares/hotel.validation.ts
import { Request, Response, NextFunction } from "express";
import { ResponseStatus, ResponseMessage, ResponseCode } from "../enum/response-message.enum";

export const validateHotel = (req: Request, res: Response, next: NextFunction) => {
    const hotel = req.body;
    const errors = [];

    // Required fields validation
    const requiredFields = [
        'name',
        'type',
        'description',
        'address',
        'contact',
        'policies'
    ];

    requiredFields.forEach(field => {
        if (!hotel[field]) {
            errors.push(`${field} is required`);
        }
    });

    // Address validation
    if (hotel.address) {
        const requiredAddressFields = ['street', 'city', 'state', 'country', 'zipCode'];
        requiredAddressFields.forEach(field => {
            if (!hotel.address[field]) {
                errors.push(`address.${field} is required`);
            }
        });
    }

    // Contact validation
    if (hotel.contact) {
        if (!hotel.contact.email) errors.push('contact.email is required');
        if (!hotel.contact.phone) errors.push('contact.phone is required');
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (hotel.contact.email && !emailRegex.test(hotel.contact.email)) {
            errors.push('Invalid email format');
        }
    }

    // Policies validation
    if (hotel.policies) {
        const requiredPolicyFields = ['checkInTime', 'checkOutTime', 'cancellationPolicy'];
        requiredPolicyFields.forEach(field => {
            if (!hotel.policies[field]) {
                errors.push(`policies.${field} is required`);
            }
        });
    }

    if (errors.length > 0) {
        return res.status(ResponseCode.BAD_REQUEST).json({
            status: ResponseStatus.FAILED,
            message: ResponseMessage.VALIDATION_ERROR,
            description: errors.join(', '),
            data: null
        });
    }

    next();
};