
// // managers/room.manager.ts
// import Room from "../models/room.model";
// import { IRoom } from "../interfaces/room/room.interface";
// import { IRoomManager } from "../interfaces/room/room.manager.interface";

// export class RoomManager implements IRoomManager {
//     private static instance: RoomManager;

//     private constructor() {}

//     public static getInstance(): RoomManager {
//         if (!RoomManager.instance) {
//             RoomManager.instance = new RoomManager();
//         }
//         return RoomManager.instance;
//     }

//     public async create(room: IRoom): Promise<IRoom> {
//         const newRoom = new Room(room);
//         return await newRoom.save();
//     }

//     public async getAll(filters: any = {}, page: number = 1, limit: number = 10): Promise<{ rooms: IRoom[], total: number }> {
//         const skip = (page - 1) * limit;
//         const [rooms, total] = await Promise.all([
//             Room.find(filters)
//                 .skip(skip)
//                 .limit(limit)
//                 .populate('hotelId', 'name address')
//                 .sort({ createdAt: -1 }),
//             Room.countDocuments(filters)
//         ]);
//         return { rooms, total };
//     }

//     public async getById(id: string): Promise<IRoom | null> {
//         return await Room.findById(id).populate('hotelId', 'name address');
//     }

//     public async update(id: string, room: Partial<IRoom>): Promise<IRoom | null> {
//         return await Room.findByIdAndUpdate(
//             id,
//             { ...room, updatedAt: new Date() },
//             { new: true }
//         );
//     }

//     public async delete(id: string): Promise<IRoom | null> {
//         return await Room.findByIdAndDelete(id);
//     }

//     public async getAvailableRooms(
//         hotelId: string,
//         checkIn: Date,
//         checkOut: Date,
//         capacity: { adults: number, children: number }
//     ): Promise<IRoom[]> {
//         return await Room.find({
//             hotelId,
//             'availability.status': 'available',
//             'capacity.adults': { $gte: capacity.adults },
//             'capacity.children': { $gte: capacity.children },
//             'availability.unavailableDates': {
//                 $not: {
//                     $elemMatch: {
//                         $gte: new Date(checkIn),
//                         $lte: new Date(checkOut)
//                     }
//                 }
//             }
//         });
//     }

//     public async updateAvailability(
//         id: string,
//         availability: { status: string, unavailableDates: Date[] }
//     ): Promise<IRoom | null> {
//         return await Room.findByIdAndUpdate(
//             id,
//             { availability, updatedAt: new Date() },
//             { new: true }
//         );
//     }
// }

// export default RoomManager.getInstance();



// services/room.manager.ts
import Room from "../models/room.model";
import { IRoom, IRoomUpdateRequest } from "../interfaces/room/room.interface";
import { IRoomManager } from "../interfaces/room/room.manager.interface";
import { Readable } from 'stream';
import cloudinary from "../config/cloudinary.config";
export class RoomManager implements IRoomManager {
    private static instance: RoomManager;

    private constructor() {}

    public static getInstance(): RoomManager {
        if (!RoomManager.instance) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }



    async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
        if (!Array.isArray(files)) {
            files = [files];
        }

        const uploadPromises = files.map(file => {
            return new Promise<string>((resolve, reject) => {
                try {
                    if (!file.buffer) {
                        reject(new Error('Invalid file buffer'));
                        return;
                    }

                    const stream = new Readable();
                    stream.push(file.buffer);
                    stream.push(null);

                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: "hotel-rooms",
                            resource_type: "auto",
                        },
                        (error: any, result: any) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result!.secure_url);
                            }
                        }
                    );

                    stream.pipe(uploadStream);
                } catch (error) {
                    reject(error);
                }
            });
        });

        try {
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Upload error:', error);
            return [];
        }
    }

    async deleteCloudinaryImages(imageUrls: string[]): Promise<void> {
        for (const url of imageUrls) {
            try {
                if (!url || !url.includes('cloudinary.com')) continue;

                const urlParts = url.split('/');
                const fileNameWithExt = urlParts[urlParts.length - 1];
                const publicId = fileNameWithExt.split('.')[0];

                if (!publicId) continue;

                const folderPath = `hotel-rooms/${publicId}`;
                await cloudinary.uploader.destroy(folderPath);
            } catch (error) {
                console.error(`Error deleting image ${url}:`, error);
            }
        }
    }

    processImageUpdateData(
        existingImages: { mainImage: string; additionalImages: string[] },
        uploadedImages: string[],
        imagesToDelete: string[]
    ) {
        const currentAdditionalImages = existingImages.additionalImages
            .filter(img => !imagesToDelete.includes(img));

        return {
            mainImage: uploadedImages[0] || existingImages.mainImage,
            additionalImages: [
                ...currentAdditionalImages,
                ...(uploadedImages.slice(uploadedImages[0] === undefined ? 0 : 1))
            ]
        };
    }

    safeJSONParse(value: any, defaultValue: any = {}) {
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        } catch (error) {
            console.error('JSON parse error:', error);
            return defaultValue;
        }
    }

    processUpdateData(body: any, userId: string, imageData: any) {
        return {
            ...body,
            updatedBy: userId,
            images: imageData,
            capacity: this.safeJSONParse(body.capacity),
            pricing: this.safeJSONParse(body.pricing),
            size: this.safeJSONParse(body.size),
            bedConfiguration: this.safeJSONParse(body.bedConfiguration),
            policies: this.safeJSONParse(body.policies),
            availability: this.safeJSONParse(body.availability),
            amenities: this.safeJSONParse(body.amenities),
            taxes: this.safeJSONParse(body.taxes),
            promotionDetails: this.safeJSONParse(body.promotionDetails),
            packageDetails: this.safeJSONParse(body.packageDetails),
            hotelAmenities: this.safeJSONParse(body.hotelAmenities),
            newRoomAmenities: this.safeJSONParse(body.newRoomAmenities)
        };
    }
    

    // public async create(room: IRoom): Promise<IRoom> {
    //     const newRoom = new Room(room);
    //     return await newRoom.save();
    // }

    public async create(room: IRoom): Promise<IRoom> {
        // Convert any Map objects to plain objects for MongoDB storage
        const processedRoom = this.processRoomDataForStorage(room);
        const newRoom = new Room(processedRoom);
        return await newRoom.save();
    }

    public async getAll(
        filters: any = {},
        page: number = 1,
        limit: number = 10,
        sortField: string = 'createdAt',
        sortOrder: string = 'desc'
    ): Promise<{ rooms: IRoom[]; total: number }> {
        const skip = (page - 1) * limit;
        const sortOptions: any = {};
        sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

        const [rooms, total] = await Promise.all([
            Room.find(filters)
                .skip(skip)
                .limit(limit)
                .sort(sortOptions)
                .populate('hotelId', 'name'),
            Room.countDocuments(filters)
        ]);

        return { rooms, total };
    }

    public async getById(id: string): Promise<IRoom | null> {
        return await Room.findById(id).populate('hotelId', 'name');
    }

    // public async update(id: string, room: Partial<IRoom>): Promise<IRoom | null> {
    //     return await Room.findByIdAndUpdate(
    //         id,
    //         { 
    //             $set: {
    //                 ...room,
    //                 updatedAt: new Date()
    //             }
    //         },
    //         { new: true }
    //     );
    // }

    // public async update(id: string, room: Partial<IRoom>): Promise<IRoom | null> {
    //     // Convert any Map objects to plain objects for MongoDB storage
    //     const processedRoom = this.processRoomDataForStorage(room);
    //     return await Room.findByIdAndUpdate(
    //         id,
    //         { 
    //             $set: {
    //                 ...processedRoom,
    //                 updatedAt: new Date()
    //             }
    //         },
    //         { new: true }
    //     );
    // }

    public async update(id: string, room: IRoomUpdateRequest): Promise<IRoom | null> {
        const processedRoom = this.processRoomDataForStorage(room);
        return await Room.findByIdAndUpdate(
            id,
            { 
                $set: {
                    ...processedRoom,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
    }


    private processRoomDataForStorage(roomData: any) {
        const processed = { ...roomData };

        // Convert Map objects to plain objects
        if (processed.availability?.availableRooms instanceof Map) {
            processed.availability.availableRooms = Object.fromEntries(processed.availability.availableRooms);
        }
        if (processed.availability?.stopSells instanceof Map) {
            processed.availability.stopSells = Object.fromEntries(processed.availability.stopSells);
        }
        if (processed.availability?.closeOnArrival instanceof Map) {
            processed.availability.closeOnArrival = Object.fromEntries(processed.availability.closeOnArrival);
        }
        if (processed.availability?.closeOnDept instanceof Map) {
            processed.availability.closeOnDept = Object.fromEntries(processed.availability.closeOnDept);
        }
        if (processed.policies?.minimumStay instanceof Map) {
            processed.policies.minimumStay = Object.fromEntries(processed.policies.minimumStay);
        }
        if (processed.taxes instanceof Map) {
            processed.taxes = Object.fromEntries(processed.taxes);
        }

        return processed;
    }

    public async delete(id: string): Promise<IRoom | null> {
        return await Room.findByIdAndDelete(id);
    }

    public async updateStatus(id: string, status: string): Promise<IRoom | null> {
        return await Room.findByIdAndUpdate(
            id,
            {
                $set: {
                    status,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
    }

    public async bulkDelete(ids: string[]): Promise<number> {
        const result = await Room.deleteMany({ _id: { $in: ids } });
        return result.deletedCount;
    }

    public async getByHotelId(
        hotelId: string,
        filters: any = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{ rooms: IRoom[]; total: number }> {
        const skip = (page - 1) * limit;
        const queryFilters = { ...filters, hotelId };

        const [rooms, total] = await Promise.all([
            Room.find(queryFilters)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Room.countDocuments(queryFilters)
        ]);

        return { rooms, total };
    }

    public async checkAvailability(
        roomId: string,
        startDate: Date,
        endDate: Date
    ): Promise<boolean> {
        const room = await Room.findById(roomId);
        if (!room) return false;

        // Check if room is active and available
        if (room.status !== 'active' || room.availability.status !== 'available') {
            return false;
        }

        // Check unavailable dates
        const unavailableDates = room.availability.unavailableDates.some(date => 
            date >= startDate && date <= endDate
        );
        if (unavailableDates) return false;

        // Check available rooms for each date
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            
            // Access availableRooms as an object instead of using Map methods
            const availableRooms = room.availability.availableRooms[dateString];
            
            if (typeof availableRooms !== 'number' || availableRooms < 1) {
                return false;
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return true;
    }

    public async findByRoomTypeCode(hotelId: string, roomTypeCode: string): Promise<IRoom | null> {
        return await Room.findOne({ 
            hotelId, 
            roomtypeShortCode: roomTypeCode 
        });
    }

    public async findByRoomTypeUnkId(roomTypeUnkId: string): Promise<IRoom | null> {
        return await Room.findOne({ roomtypeUnkId: roomTypeUnkId });
    }

    // findByRoomName
    public async findByRoomName(roomName: string): Promise<IRoom | null> {
        return await Room.findOne({ name: roomName });
    }



public async compareRoomListingsData(apiRooms: any[], dbRooms: any[]) {
    // Process each room from API and compare with DB
    const processedRooms = apiRooms.map(apiRoom => {
        // const dbRoom = dbRooms.find(room => room.roomtypeUnkId === apiRoom.roomtypeunkid);
        const dbRoom = dbRooms.find(room => room.name === apiRoom.Room_Name);

        
        // If no DB record exists, return original API room unchanged
        if (!dbRoom) {
            return {
                ...apiRoom,
                changeStatus: 'new',
                changes: []
            };
        }

        // Create a copy of API room to modify
        let modifiedRoom = { ...apiRoom };

        // Compare and update images if different
        if (JSON.stringify(apiRoom.RoomImages?.map((img:any) => img.image)) !== 
            JSON.stringify(dbRoom.images.additionalImages)) {
            modifiedRoom = {
                ...modifiedRoom,
                room_main_image: dbRoom.images.mainImage,
                RoomImages: dbRoom.images.additionalImages.map((image:any) => ({
                    image: image
                }))
            };
        }

        // Compare and update pricing if different
        if (modifiedRoom.room_rates_info.totalprice_room_only !== dbRoom.pricing.basePrice ||
            modifiedRoom.room_rates_info.totalprice_inclusive_all !== dbRoom.pricing.totalPriceInclusiveAll) {
            modifiedRoom.room_rates_info = {
                ...modifiedRoom.room_rates_info,
                totalprice_room_only: dbRoom.pricing.basePrice,
                totalprice_inclusive_all: dbRoom.pricing.totalPriceInclusiveAll,
                rack_rate: dbRoom.pricing.rackRate.toString(),
                exclusive_tax: dbRoom.pricing.exclusiveTax,
                tax: dbRoom.pricing.tax
            };
        }

        // Compare and update availability if different
        if (JSON.stringify(modifiedRoom.available_rooms) !== 
            JSON.stringify(dbRoom.availability.availableRooms)) {
            modifiedRoom = {
                ...modifiedRoom,
                available_rooms: dbRoom.availability.availableRooms,
                min_ava_rooms: dbRoom.availability.minAvailableRooms
            };
        }

        // Compare and update room details if different
        if (modifiedRoom.Room_Name !== dbRoom.name) {
            modifiedRoom.Room_Name = dbRoom.name;
        }

        if (modifiedRoom.Room_Description !== dbRoom.roomDescription) {
            modifiedRoom.Room_Description = dbRoom.roomDescription;
        }

        // Check what fields were modified
        const changes = this.getChangedFields(apiRoom, modifiedRoom);

        return {
            ...modifiedRoom,
            changeStatus: changes.length > 0 ? 'modified' : 'unchanged',
            changes
        };
    });

    return {
        data: {
            rooms: processedRooms,
            summary: {
                total: processedRooms.length,
                new: processedRooms.filter(r => r.changeStatus === 'new').length,
                modified: processedRooms.filter(r => r.changeStatus === 'modified').length,
                unchanged: processedRooms.filter(r => r.changeStatus === 'unchanged').length
            }
        }
    };
}

private getChangedFields(originalRoom: any, modifiedRoom: any): string[] {
    const changes: string[] = [];

    // Check images
    if (JSON.stringify(originalRoom.RoomImages) !== JSON.stringify(modifiedRoom.RoomImages)) {
        changes.push('images');
    }

    // Check pricing
    if (JSON.stringify(originalRoom.room_rates_info) !== JSON.stringify(modifiedRoom.room_rates_info)) {
        changes.push('pricing');
    }

    // Check availability
    if (JSON.stringify(originalRoom.available_rooms) !== JSON.stringify(modifiedRoom.available_rooms)) {
        changes.push('availability');
    }

    // Check basic details
    if (originalRoom.Room_Name !== modifiedRoom.Room_Name) {
        changes.push('name');
    }

    if (originalRoom.Room_Description !== modifiedRoom.Room_Description) {
        changes.push('description');
    }

    return changes;
}

}

export default RoomManager.getInstance();
