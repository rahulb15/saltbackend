// interfaces/booking/booking.manager.interface.ts
import { IBooking } from "./booking.interface";
import { UpdateQuery } from "./booking-update.interface";


export interface IBookingManager {
    create(booking: IBooking): Promise<IBooking>;
    getAll(filters?: any, page?: number, limit?: number): Promise<{ bookings: IBooking[], total: number }>;
    getById(id: string): Promise<IBooking | null>;
    getUserBookings(userId: string): Promise<IBooking[]>;
    update(id: string, booking: Partial<IBooking> | UpdateQuery<IBooking>): Promise<IBooking | null>;
    updateStatus(id: string, status: string): Promise<IBooking | null>;
    cancel(id: string, reason: string): Promise<IBooking | null>;
}
