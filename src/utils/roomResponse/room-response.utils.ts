
// utils/responseData/room-response.utils.ts
import { IRoom } from "../../interfaces/room/room.interface";
export const roomResponseData = (room: IRoom) => {
    return {
        _id: room._id,
        hotelId: room.hotelId,
        roomNumber: room.roomNumber,
        type: room.type,
        description: room.description,
        capacity: room.capacity,
        amenities: room.amenities,
        images: room.images,
        pricing: room.pricing,
        availability: room.availability,
        status: room.status,
        createdAt: room.createdAt
    };
};
