// interfaces/hotel/hotel.manager.interface.ts
import { IHotel } from "./hotel.interface";

export interface IHotelManager {
    create(hotel: IHotel): Promise<IHotel>;
    getAll(filters?: any, page?: number, limit?: number): Promise<{ hotels: IHotel[], total: number }>;
    getById(id: string): Promise<IHotel | null>;
    update(id: string, hotel: Partial<IHotel>): Promise<IHotel | null>;
    delete(id: string): Promise<IHotel | null>;
    search(query: any): Promise<IHotel[]>;
    updateStatus(id: string, status: string): Promise<IHotel | null>;
}
