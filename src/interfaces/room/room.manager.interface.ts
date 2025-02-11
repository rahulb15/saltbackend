// // interfaces/room/room.manager.interface.ts
// import { IRoom } from "./room.interface";

// export interface IRoomManager {
//     create(room: IRoom): Promise<IRoom>;
//     getAll(filters?: any, page?: number, limit?: number): Promise<{ rooms: IRoom[], total: number }>;
//     getById(id: string): Promise<IRoom | null>;
//     update(id: string, room: Partial<IRoom>): Promise<IRoom | null>;
//     delete(id: string): Promise<IRoom | null>;
//     getAvailableRooms(
//         hotelId: string,
//         checkIn: Date,
//         checkOut: Date,
//         capacity: { adults: number, children: number }
//     ): Promise<IRoom[]>;
//     updateAvailability(
//         id: string, 
//         availability: { 
//             status: string, 
//             unavailableDates: Date[] 
//         }
//     ): Promise<IRoom | null>;
// }


// interfaces/room/room.manager.interface.ts
import { IRoom } from "./room.interface";

export interface IRoomManager {
    create(room: IRoom): Promise<IRoom>;
    getAll(
        filters?: any,
        page?: number,
        limit?: number,
        sortField?: string,
        sortOrder?: string
    ): Promise<{ rooms: IRoom[]; total: number }>;
    getById(id: string): Promise<IRoom | null>;
    update(id: string, room: Partial<IRoom>): Promise<IRoom | null>;
    delete(id: string): Promise<IRoom | null>;
    updateStatus(id: string, status: string): Promise<IRoom | null>;
    bulkDelete(ids: string[]): Promise<number>;
    getByHotelId(
        hotelId: string,
        filters?: any,
        page?: number,
        limit?: number
    ): Promise<{ rooms: IRoom[]; total: number }>;
    checkAvailability(
        roomId: string,
        startDate: Date,
        endDate: Date
    ): Promise<boolean>;
}