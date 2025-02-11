// utils/responseData/hotel-response.utils.ts
import { IHotel } from "../../interfaces/hotel/hotel.interface";
export const hotelResponseData = (hotel: IHotel) => {
    return {
        _id: hotel._id,
        name: hotel.name,
        hotelCode: hotel.hotelCode,
        type: hotel.type,
        description: hotel.description,
        address: hotel.address,
        contact: hotel.contact,
        amenities: hotel.amenities,
        images: hotel.images,
        rating: hotel.rating,
        status: hotel.status,
        createdAt: hotel.createdAt
    };
};
