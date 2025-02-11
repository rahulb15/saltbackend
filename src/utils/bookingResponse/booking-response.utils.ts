// utils/responseData/booking-response.utils.ts
import { IBooking } from "../../interfaces/booking/booking.interface";
export const bookingResponseData = (booking: IBooking) => {
    return {
        _id: booking._id,
        bookingNumber: booking.bookingNumber,
        userId: booking.userId,
        hotelId: booking.hotelId,
        roomId: booking.roomId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        pricing: booking.pricing,
        status: booking.status,
        payment: {
            status: booking.payment.status,
            method: booking.payment.method,
            paidAmount: booking.payment.paidAmount,
            paidAt: booking.payment.paidAt
        },
        createdAt: booking.createdAt
    };
};