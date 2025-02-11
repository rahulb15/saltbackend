// // managers/booking.manager.ts
// import Booking from "../models/booking.model";
// import { IBooking } from "../interfaces/booking/booking.interface";
// import { IBookingManager } from "../interfaces/booking/booking.manager.interface";
// import { UpdateQuery } from "../interfaces/booking/booking-update.interface";

// export class BookingManager implements IBookingManager {
//     private static instance: BookingManager;

//     private constructor() {}

//     public static getInstance(): BookingManager {
//         if (!BookingManager.instance) {
//             BookingManager.instance = new BookingManager();
//         }
//         return BookingManager.instance;
//     }

//     public async create(booking: IBooking): Promise<IBooking> {
//         const newBooking = new Booking({
//             ...booking,
//             bookingNumber: await this.generateBookingNumber()
//         });
//         return await newBooking.save();
//     }

//     private async generateBookingNumber(): Promise<string> {
//         const date = new Date();
//         const year = date.getFullYear().toString().slice(-2);
//         const month = (date.getMonth() + 1).toString().padStart(2, '0');
//         const count = await Booking.countDocuments({
//             createdAt: {
//                 $gte: new Date(date.getFullYear(), date.getMonth(), 1),
//                 $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
//             }
//         });
//         return `BK${year}${month}${(count + 1).toString().padStart(4, '0')}`;
//     }

//     public async getAll(filters: any = {}, page: number = 1, limit: number = 10): Promise<{ bookings: IBooking[], total: number }> {
//         const skip = (page - 1) * limit;
//         const [bookings, total] = await Promise.all([
//             Booking.find(filters)
//                 .skip(skip)
//                 .limit(limit)
//                 .populate('userId', 'name email')
//                 .populate('hotelId', 'name address')
//                 .populate('roomId', 'roomNumber type')
//                 .sort({ createdAt: -1 }),
//             Booking.countDocuments(filters)
//         ]);
//         return { bookings, total };
//     }

//     public async getById(id: string): Promise<IBooking | null> {
//         return await Booking.findById(id)
//             .populate('userId', 'name email')
//             .populate('hotelId', 'name address')
//             .populate('roomId', 'roomNumber type');
//     }

//     public async getUserBookings(userId: string): Promise<IBooking[]> {
//         return await Booking.find({ userId })
//             .populate('hotelId', 'name address')
//             .populate('roomId', 'roomNumber type')
//             .sort({ createdAt: -1 });
//     }

//     public async update(id: string, booking: Partial<IBooking> | UpdateQuery<IBooking>): Promise<IBooking | null> {
//         return await Booking.findByIdAndUpdate(
//             id,
//             { ...booking, updatedAt: new Date() },
//             { new: true }
//         );
//     }

//     public async updateStatus(id: string, status: string): Promise<IBooking | null> {
//         return await Booking.findByIdAndUpdate(
//             id,
//             { status, updatedAt: new Date() },
//             { new: true }
//         );
//     }

//     public async cancel(id: string, reason: string): Promise<IBooking | null> {
//         return await Booking.findByIdAndUpdate(
//             id,
//             {
//                 status: 'cancelled',
//                 'cancellation.cancelledAt': new Date(),
//                 'cancellation.reason': reason,
//                 updatedAt: new Date()
//             },
//             { new: true }
//         );
//     }
// }

// export default BookingManager.getInstance();


// services/booking.manager.ts
import Booking from "../models/booking.model";
import { IBooking, IBookingCreateRequest, IBookingUpdateRequest } from "../interfaces/booking/booking.interface";
import mongoose from "mongoose";

export class BookingManager {
    private static instance: BookingManager;

    private constructor() {}

    public static getInstance(): BookingManager {
        if (!BookingManager.instance) {
            BookingManager.instance = new BookingManager();
        }
        return BookingManager.instance;
    }

    public async generateBookingNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const count = await Booking.countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        });
        return `BK${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    }

    public async create(bookingData: IBookingCreateRequest): Promise<IBooking> {
        try {
            const newBooking = new Booking({
                ...bookingData,
                bookingNumber: await this.generateBookingNumber()
            });
            const savedBooking = await newBooking.save();
            return savedBooking.toObject();
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    public async getAll(
        filters: Record<string, any> = {},
        page: number = 1,
        limit: number = 10,
        sortField: string = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc'
    ): Promise<{ bookings: IBooking[]; total: number }> {
        try {
            const skip = (page - 1) * limit;
            const sortOptions: any = {};
            sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

            const [bookings, total] = await Promise.all([
                Booking.find(filters)
                    .populate('hotelId', 'name hotelCode')
                    .populate('roomId', 'name type')
                    .populate('userId', 'name email')
                    .populate('createdBy', 'name email')
                    .skip(skip)
                    .limit(limit)
                    .sort(sortOptions)
                    .lean(),
                Booking.countDocuments(filters)
            ]);

            return { 
                bookings: bookings as IBooking[], 
                total 
            };
        } catch (error) {
            console.error('Error getting bookings:', error);
            throw error;
        }
    }

    public async getById(id: string): Promise<IBooking | null> {
        try {
            const booking = await Booking.findById(id)
                .populate('hotelId', 'name hotelCode')
                .populate('roomId', 'name type')
                .populate('userId', 'name email')
                .populate('createdBy', 'name email')
                .lean();
            return booking as IBooking;
        } catch (error) {
            console.error('Error getting booking by id:', error);
            throw error;
        }
    }

    public async getByBookingNumber(bookingNumber: string): Promise<IBooking | null> {
        try {
            const booking = await Booking.findOne({ bookingNumber })
                .populate('hotelId', 'name hotelCode')
                .populate('roomId', 'name type')
                .populate('userId', 'name email')
                .populate('createdBy', 'name email')
                .lean();
            return booking as IBooking;
        } catch (error) {
            console.error('Error getting booking by number:', error);
            throw error;
        }
    }

    public async getByReservationNo(reservationNo: string): Promise<IBooking | null> {
        try {
            const booking = await Booking.findOne({ thirdPartyReservationNo: reservationNo })
                .populate('hotelId', 'name hotelCode')
                .populate('roomId', 'name type')
                .populate('userId', 'name email')
                .populate('createdBy', 'name email')
                .lean();
            return booking as IBooking;
        } catch (error) {
            console.error('Error getting booking by reservation number:', error);
            throw error;
        }
    }

    public async getByUserId(userId: string): Promise<IBooking[]> {
        try {
            const bookings = await Booking.find({ userId: new mongoose.Types.ObjectId(userId) })
                .populate('hotelId', 'name hotelCode')
                .populate('roomId', 'name type')
                .sort({ createdAt: -1 })
                .lean();
            return bookings as IBooking[];
        } catch (error) {
            console.error('Error getting user bookings:', error);
            throw error;
        }
    }

    public async updateStatus(id: string, status: IBooking['status']): Promise<IBooking | null> {
        if (!id) throw new Error('Booking ID is required');
        
        try {
            const booking = await Booking.findByIdAndUpdate(
                id,
                {
                    status,
                    updatedAt: new Date()
                },
                { new: true }
            )
            .populate('hotelId', 'name hotelCode')
            .populate('roomId', 'name type')
            .populate('userId', 'name email')
            .lean();

            return booking as IBooking;
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }

    public async cancel(id: string, reason: string, cancelledBy?: string): Promise<IBooking | null> {
        if (!id || !reason) throw new Error('Booking ID and reason are required');

        try {
            const updateData: any = {
                status: "cancelled" as const,
                cancellation: {
                    isCancelled: true,
                    cancellationDate: new Date(),
                    cancellationReason: reason
                },
                updatedAt: new Date()
            };

            if (cancelledBy) {
                updateData.cancellation.cancelledBy = new mongoose.Types.ObjectId(cancelledBy);
            }

            const booking = await Booking.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            )
            .populate('hotelId', 'name hotelCode')
            .populate('roomId', 'name type')
            .populate('userId', 'name email')
            .lean();

            return booking as IBooking;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    }

    public async updatePayment(bookingNumber: string, paymentData: {
        status: IBooking['payment']['status'];
        transactionId?: string;
        amount: number;
        paymentDate: Date;
    }): Promise<IBooking | null> {
        try {
            const updateData:any = {
                'payment.status': paymentData.status,
                'payment.transactionId': paymentData.transactionId,
                'payment.paidAmount': paymentData.amount,
                'payment.paymentDate': paymentData.paymentDate,
                updatedAt: new Date()
            };

            if (paymentData.status === 'paid') {
                updateData['status'] = 'confirmed' as const;
            }

            const booking = await Booking.findOneAndUpdate(
                { bookingNumber },
                updateData,
                { new: true }
            )
            .populate('hotelId', 'name hotelCode')
            .populate('roomId', 'name type')
            .populate('userId', 'name email')
            .lean();

            return booking as IBooking;
        } catch (error) {
            console.error('Error updating payment:', error);
            throw error;
        }
    }

    public async addModification(id: string, modification: {
        modifiedBy: string;
        changes: any;
        reason?: string;
    }): Promise<IBooking | null> {
        try {
            const booking = await Booking.findByIdAndUpdate(
                id,
                {
                    $push: {
                        modifications: {
                            ...modification,
                            modifiedDate: new Date(),
                            modifiedBy: new mongoose.Types.ObjectId(modification.modifiedBy)
                        }
                    },
                    updatedAt: new Date()
                },
                { new: true }
            )
            .populate('hotelId', 'name hotelCode')
            .populate('roomId', 'name type')
            .populate('userId', 'name email')
            .lean();

            return booking as IBooking;
        } catch (error) {
            console.error('Error adding modification:', error);
            throw error;
        }
    }

    // In BookingManager class
public async confirmPayment(bookingId: string, paymentInfo: {
    paymentId: string;
    amount: number;
}): Promise<IBooking | null> {
    try {
        const updateData = {
            status: 'confirmed' as const,
            'payment.status': 'paid' as const,
            'payment.transactionId': paymentInfo.paymentId,
            'payment.paidAmount': paymentInfo.amount,
            'payment.paymentDate': new Date(),
            updatedAt: new Date()
        };

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            updateData,
            { new: true }
        )
        .populate('hotelId', 'name hotelCode')
        .populate('roomId', 'name type')
        .populate('userId', 'name email')
        .lean();

        if (!booking) {
            throw new Error('Booking not found');
        }

        return booking as IBooking;
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
}

}

export default BookingManager.getInstance();