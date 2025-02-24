// // controllers/room.controller.ts
// import { Request, Response } from "express";
// import roomManager from "../../services/room.manager";
// import { roomResponseData } from "../../utils/roomResponse/room-response.utils";
// import { IResponseHandler } from "../../interfaces/response-handler.interface";
// import { ResponseStatus, ResponseMessage, ResponseCode,ResponseDescription } from "../../enum/response-message.enum";
// import { hotelResponseData } from "../../utils/hotelResponse/hotel-response.utils";


// export class RoomController {
//     public async create(req: any, res: Response) {
//         try {
//             const room = req.body;
//             room.createdBy = req.user._id;
//             room.updatedBy = req.user._id;

//             const newRoom = await roomManager.create(room);
//             const data = roomResponseData(newRoom);

//             const response: IResponseHandler = {
//                 status: ResponseStatus.SUCCESS,
//                 message: ResponseMessage.CREATED,
//                 description: ResponseDescription.ROOM_CREATED,
//                 data: data
//             };

//             res.status(ResponseCode.CREATED).json(response);
//         } catch (error) {
//             res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//                 status: ResponseStatus.FAILED,
//                 message: ResponseMessage.INTERNAL_SERVER_ERROR,
//                 description: ResponseDescription.ROOM_FAILED,
//                 data: null
//             });
//         }
//     }

//     public async getAllRooms(req: Request, res: Response) {
//         try {
//             const page = parseInt(req.query.page as string) || 1;
//             const limit = parseInt(req.query.limit as string) || 10;
            
//             const { rooms, total } = await roomManager.getAll({}, page, limit);
//             const data = rooms.map(room => roomResponseData(room));

//             const response: IResponseHandler = {
//                 status: ResponseStatus.SUCCESS,
//                 message: ResponseMessage.SUCCESS,
//                 description: ResponseDescription.ROOM_FETCHED,
//                 data: {
//                     rooms: data,
//                     pagination: {
//                         page,
//                         limit,
//                         total,
//                         pages: Math.ceil(total / limit)
//                     }
//                 }
//             };

//             res.status(ResponseCode.SUCCESS).json(response);
//         } catch (error) {
//             res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//                 status: ResponseStatus.FAILED,
//                 message: ResponseMessage.INTERNAL_SERVER_ERROR,
//                 description: ResponseDescription.ROOM_FAILED,
//                 data: null
//             });
//         }
//     }

//     public async getRoomById(req: Request, res: Response) {
//         try {
//             const room = await roomManager.getById(req.params.id);
            
//             if (!room) {
//                 return res.status(ResponseCode.NOT_FOUND).json({
//                     status: ResponseStatus.FAILED,
//                     message: ResponseMessage.NOT_FOUND,
//                     data: null
//                 });
//             }

//             const data = roomResponseData(room);
            
//             const response: IResponseHandler = {
//                 status: ResponseStatus.SUCCESS,
//                 message: ResponseMessage.SUCCESS,
//                 description: ResponseDescription.ROOM_FETCHED,
//                 data: data
//             };

//             res.status(ResponseCode.SUCCESS).json(response);
//         } catch (error) {
//             res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//                 status: ResponseStatus.FAILED,
//                 message: ResponseMessage.INTERNAL_SERVER_ERROR,
//                 description: ResponseDescription.ROOM_FAILED,
//                 data: null
//             });
//         }
//     }

//     public async updateRoom(req: any, res: Response) {
//         try {
//             const room = req.body;
//             room.updatedBy = req.user._id;

//             const updatedRoom = await roomManager.update(req.params.id, room);
            
//             if (!updatedRoom) {
//                 return res.status(ResponseCode.NOT_FOUND).json({
//                     status: ResponseStatus.FAILED,
//                     message: ResponseMessage.NOT_FOUND,
//                     description: ResponseDescription.ROOM_NOT_FOUND,
//                     data: null
//                 });
//             }

//             const data = roomResponseData(updatedRoom);
            
//             const response: IResponseHandler = {
//                 status: ResponseStatus.SUCCESS,
//                 message: ResponseMessage.UPDATED,
//                 description: ResponseDescription.ROOM_UPDATED,
//                 data: data
//             };

//             res.status(ResponseCode.SUCCESS).json(response);
//         } catch (error) {
//             res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//                 status: ResponseStatus.FAILED,
//                 message: ResponseMessage.INTERNAL_SERVER_ERROR,
//                 description: ResponseDescription.ROOM_FAILED,
//                 data: null
//             });
//         }
//     }

//     public async deleteRoom(req: Request, res: Response) {
//         try {
//             const room = await roomManager.delete(req.params.id);
            
//             if (!room) {
//                 return res.status(ResponseCode.NOT_FOUND).json({
//                     status: ResponseStatus.FAILED,
//                     message: ResponseMessage.NOT_FOUND,
//                     description: ResponseDescription.ROOM_NOT_FOUND,
//                     data: null
//                 });
//             }
            
//             const response: IResponseHandler = {
//                 status: ResponseStatus.SUCCESS,
//                 message: ResponseMessage.DELETED,
//                 description: ResponseDescription.ROOM_DELETED,
//                 data: null
//             };

//             res.status(ResponseCode.SUCCESS).json(response);
//         } catch (error) {
//             res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//                 status: ResponseStatus.FAILED,
//                 message: ResponseMessage.INTERNAL_SERVER_ERROR,
//                 description: ResponseDescription.ROOM_FAILED,
//                 data: null
//             });
//         }
//     }

//     public async getAvailableRooms(req: Request, res: Response) {
//         try {
//             const { hotelId, checkIn, checkOut, adults, children } = req.query;
            
//             const rooms = await roomManager.getAvailableRooms(
//                 hotelId as string,
//                 new Date(checkIn as string),
//                 new Date(checkOut as string),
//                 { 
//                     adults: parseInt(adults as string), 
//                     children: parseInt(children as string) 
//                 }
//             );

//             const data = rooms.map(room => roomResponseData(room));
            
//             const response: IResponseHandler = {
//                 status: ResponseStatus.SUCCESS,
//                 message: ResponseMessage.SUCCESS,
//                 description: ResponseDescription.ROOM_FETCHED,
//                 data: data
//             };

//             res.status(ResponseCode.SUCCESS).json(response);
//         } catch (error) {
//             res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//                 status: ResponseStatus.FAILED,
//                 message: ResponseMessage.INTERNAL_SERVER_ERROR,
//                 description: ResponseDescription.ROOM_FAILED,
//                 data: null
//             });
//         }
//     }
// }

// export default new RoomController();


// controllers/room.controller.ts
import { Request, Response } from "express";
import { Readable } from 'stream';
import cloudinary from "../../config/cloudinary.config";
import roomManager from "../../services/room.manager";
import { IRoom, IRoomUpdateRequest } from "../../interfaces/room/room.interface";
import { ResponseStatus, ResponseMessage, ResponseCode } from "../../enum/response-message.enum";
import hotelManager from "../../services/hotel.manager";
import axios from "axios";
import mongoose from "mongoose";
import Room from "../../models/room.model";

export class RoomController {


    private uploadImages = async (files: Express.Multer.File[]): Promise<string[]> => {
        if (!Array.isArray(files)) {
            files = [files];
        }
    
        const uploadPromises = files.map(file => {
            return new Promise<string>((resolve, reject) => {
                try {
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
                                console.error('Cloudinary upload error:', error);
                                reject(error);
                            } else {
                                resolve(result!.secure_url);
                            }
                        }
                    );
    
                    stream.pipe(uploadStream);
                } catch (error) {
                    console.error('Stream creation error:', error);
                    reject(error);
                }
            });
        });
    
        try {
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Upload promise error:', error);
            return [];
        }
    }
    
    public async create(req: any, res: Response) {
        try {
            console.log("Creating new room with data:", req.body);
            const uploadedImages: string[] = [];

            // Handle main room image
            if (req.files?.mainImage?.[0]) {
                const mainImageUrl = await this.uploadImages([req.files.mainImage[0]]);
                uploadedImages.push(mainImageUrl[0]);
            }

            // Handle additional room images
            if (req.files?.additionalImages) {
                const additionalImageUrls = await this.uploadImages(req.files.additionalImages);
                uploadedImages.push(...additionalImageUrls);
            }

            // Prepare room data with proper parsing of JSON strings
            const roomData: IRoom = {
                ...req.body,
                images: {
                    mainImage: uploadedImages[0] || '',
                    additionalImages: uploadedImages.slice(1)
                },
                capacity: JSON.parse(req.body.capacity),
                pricing: JSON.parse(req.body.pricing),
                size: JSON.parse(req.body.size),
                bedConfiguration: JSON.parse(req.body.bedConfiguration),
                policies: JSON.parse(req.body.policies),
                availability: JSON.parse(req.body.availability),
                amenities: JSON.parse(req.body.amenities),
                taxes: JSON.parse(req.body.taxes || '{}'),
                createdBy: req.user._id,
                updatedBy: req.user._id
            };

            const newRoom = await roomManager.create(roomData);
            console.log("Room created successfully:", newRoom._id);

            res.status(ResponseCode.CREATED).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.CREATED,
                data: newRoom
            });
        } catch (error) {
            console.error("Error creating room:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }


    // public async update(req: any, res: Response) {
    //     try {
    //         const { id } = req.params;
    //         const existingRoom = await roomManager.getById(id);
    
    //         if (!existingRoom) {
    //             return res.status(ResponseCode.NOT_FOUND).json({
    //                 status: ResponseStatus.FAILED,
    //                 message: ResponseMessage.NOT_FOUND
    //             });
    //         }
    
    //         const uploadedImages: string[] = [];
            
    //         // Handle image deletions
    //         if (req.body.imagesToDelete) {
    //             const imagesToDelete = JSON.parse(req.body.imagesToDelete);
    //             await roomManager.deleteCloudinaryImages(imagesToDelete);
    //         }
    
    //         // Handle new image uploads
    //         if (req.files?.mainImage?.[0]) {
    //             console.log("Main image found:", req.files.mainImage[0]);
    //             const mainImageUrl = await roomManager.uploadImages([req.files.mainImage[0]]);
    //             uploadedImages.push(...mainImageUrl);
    //         }
    
    //         if (req.files?.additionalImages) {
    //             console.log("Additional images found:", req.files.additionalImages);
    //             const additionalImagesArray = Array.isArray(req.files.additionalImages)
    //                 ? req.files.additionalImages
    //                 : [req.files.additionalImages];
    
    //             const additionalImageUrls = await roomManager.uploadImages(additionalImagesArray);
    //             uploadedImages.push(...additionalImageUrls);
    //         }
    
    //         // Process image data
    //         const imagesToDelete = req.body.imagesToDelete ? JSON.parse(req.body.imagesToDelete) : [];
    //         const imageData = uploadedImages.length > 0 || imagesToDelete.length > 0
    //             ? roomManager.processImageUpdateData(existingRoom.images, uploadedImages, imagesToDelete)
    //             : existingRoom.images;
    
    //         // Process update data
    //         const updateData = roomManager.processUpdateData(req.body, req.user._id, imageData);
    //         delete updateData.imagesToDelete;
    //         delete updateData.mainImage;
    //         delete updateData.additionalImages;
    
    //         // Update room
    //         const updatedRoom = await roomManager.update(id, updateData);
    
    //         res.status(ResponseCode.SUCCESS).json({
    //             status: ResponseStatus.SUCCESS,
    //             message: ResponseMessage.UPDATED,
    //             data: updatedRoom
    //         });
    //     } catch (error) {
    //         console.error("Error updating room:", error);
    //         res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
    //             status: ResponseStatus.FAILED,
    //             message: ResponseMessage.INTERNAL_SERVER_ERROR,
    //             error: error instanceof Error ? error.message : "Unknown error"
    //         });
    //     }
    // }


    public async update(req: any, res: Response) {
        try {
            const { id } = req.params;
            const existingRoom = await roomManager.getById(id);
    
            if (!existingRoom) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND
                });
            }
    
            const uploadedImages: string[] = [];
            
            // Parse imagesToDelete array and identify which images to remove
            const imagesToDelete = req.body.imagesToDelete ? JSON.parse(req.body.imagesToDelete) : [];
            const imagesToDeleteMap = new Map(imagesToDelete.map((url: string) => [url, true]));
    
            // Handle main image update separately
            let newMainImage = existingRoom.images.mainImage;
            if (req.files?.mainImage?.[0]) {
                const mainImageUrl = await roomManager.uploadImages([req.files.mainImage[0]]);
                if (mainImageUrl.length > 0) {
                    // Delete old main image if it exists and is different
                    if (existingRoom.images.mainImage) {
                        await roomManager.deleteCloudinaryImages([existingRoom.images.mainImage]);
                    }
                    newMainImage = mainImageUrl[0];
                }
            }
    
            // Handle additional images
            let newAdditionalImages = [...existingRoom.images.additionalImages];
            
            // Remove deleted images
            if (imagesToDelete.length > 0) {
                // Remove from Cloudinary
                await roomManager.deleteCloudinaryImages(imagesToDelete);
                
                // Filter out deleted images from the array
                newAdditionalImages = newAdditionalImages.filter(
                    imgUrl => !imagesToDeleteMap.has(imgUrl)
                );
            }
    
            // Add new additional images
            if (req.files?.additionalImages) {
                const additionalImagesArray = Array.isArray(req.files.additionalImages) 
                    ? req.files.additionalImages 
                    : [req.files.additionalImages];
    
                const newImages = await roomManager.uploadImages(additionalImagesArray);
                uploadedImages.push(...newImages);
                
                // Append new images to the filtered array
                newAdditionalImages = [...newAdditionalImages, ...newImages];
            }
    
            // Prepare the image data structure
            const imageData = {
                mainImage: newMainImage,
                additionalImages: newAdditionalImages
            };
    
            // Process update data
            const updateData = roomManager.processUpdateData(req.body, req.user._id, imageData);
            delete updateData.imagesToDelete;
            delete updateData.mainImage;
            delete updateData.additionalImages;
    
            // Update room
            const updatedRoom = await roomManager.update(id, updateData);
    
            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.UPDATED,
                data: updatedRoom
            });
        } catch (error) {
            console.error("Error updating room:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

  

    public async getAll(req: Request, res: Response) {
        try {
            console.log("Fetching all rooms with query params:", req.query);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortField = req.query.sortField as string || 'createdAt';
            const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
            const searchQuery = req.query.search as string;
            const hotelId = req.query.hotelId as string;
            const status = req.query.status as string;
            const minPrice = parseFloat(req.query.minPrice as string);
            const maxPrice = parseFloat(req.query.maxPrice as string);

            // Build filters
            const filters: any = {};

            // Handle search query
            if (searchQuery) {
                filters.$or = [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { roomName: { $regex: searchQuery, $options: 'i' } },
                    { type: { $regex: searchQuery, $options: 'i' } }
                ];
            }

            // Handle hotelId - only add if it's a valid ObjectId and not "null"
            if (hotelId && hotelId !== 'null' && mongoose.Types.ObjectId.isValid(hotelId)) {
                filters.hotelId = new mongoose.Types.ObjectId(hotelId);
            }

            // Handle status
            if (status) {
                filters.status = status;
            }

            // Handle price range
            if (!isNaN(minPrice) || !isNaN(maxPrice)) {
                filters['pricing.basePrice'] = {};
                if (!isNaN(minPrice)) {
                    filters['pricing.basePrice'].$gte = minPrice;
                }
                if (!isNaN(maxPrice)) {
                    filters['pricing.basePrice'].$lte = maxPrice;
                }
            }

            // Get rooms with pagination
            const { rooms, total } = await roomManager.getAll(
                filters,
                page,
                limit,
                sortField,
                sortOrder
            );

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {
                    rooms,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching rooms:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getById(req: Request, res: Response) {
        try {
            const room = await roomManager.getById(req.params.id);
            
            if (!room) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND
                });
            }

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: room
            });
        } catch (error) {
            console.error("Error fetching room:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const deleted = await roomManager.delete(req.params.id);
            
            if (!deleted) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND
                });
            }

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.DELETED
            });
        } catch (error) {
            console.error("Error deleting room:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!["active", "inactive", "maintenance"].includes(status)) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: "Invalid status value"
                });
            }

            const updatedRoom = await roomManager.updateStatus(id, status);
            
            if (!updatedRoom) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND
                });
            }

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.UPDATED,
                data: updatedRoom
            });
        } catch (error) {
            console.error("Error updating room status:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async bulkDelete(req: Request, res: Response) {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: "Invalid room IDs provided"
                });
            }

            const deletedCount = await roomManager.bulkDelete(ids);

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.DELETED,
                data: { deletedCount }
            });
        } catch (error) {
            console.error("Error in bulk delete:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async checkAvailability(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: "Start date and end date are required"
                });
            }

            const isAvailable = await roomManager.checkAvailability(
                roomId,
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: { isAvailable }
            });
        } catch (error) {
            console.error("Error checking availability:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getRoomsByHotel(req: Request, res: Response) {
        try {
            const { hotelId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { rooms, total } = await roomManager.getByHotelId(hotelId, {}, page, limit);

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {
                    rooms,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching hotel rooms:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getRoomListings(req: Request, res: Response) {
        try {

            console.log("Fetching room listings for hotel ID:", req.params.hotelId);
            // Get hotel details first
            const hotelId = req.params.hotelId;
            console.log("Fetching hotel details for ID:", hotelId);
            const hotel = await hotelManager.getById(hotelId);
            
            if (!hotel) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: "Hotel not found"
                });
            }
    
            // Validate required query parameters
            const { check_in_date, check_out_date, number_adults, number_children } = req.query;
            
            if (!check_in_date || !check_out_date || !number_adults) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Missing required booking details"
                });
            }
    
            // Construct API request
            const queryParams = new URLSearchParams({
                request_type: "RoomList",
                HotelCode: hotel.hotelCode, // Use hotel code from database
                APIKey: process.env.IPMS_API_KEY as string,
                check_in_date: check_in_date as string,
                check_out_date: check_out_date as string,
                number_adults: number_adults as string,
                number_children: number_children as string || "0"
            });

            console.log("Fetching room listings with query params:", queryParams.toString());
    
            // Call external API
            const response = await axios.get(
                `https://live.ipms247.com/booking/reservation_api/listing.php?${queryParams}`
            );
    
            // Return the response
            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {
                    hotel: {
                        id: hotel._id,
                        name: hotel.name,
                        code: hotel.hotelCode
                    },
                    rooms: response.data
                }
            });
        } catch (error) {
            console.error("Error fetching room listings:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Add this method to your RoomController class

    // public async selectRoom(req: any, res: Response) {
    //     try {
    //         const { hotelId } = req.params;
    //         const { roomData } = req.body;

    //         console.log("roomData", roomData);
            
    //         // Prepare room data for database with all required fields
    //         const formattedRoomData: any = {
    //             hotelId,
    //             // Required fields that were missing
    //             roomNumber: roomData.Roomtype_Short_code || `${Date.now()}`, // Fallback to timestamp if no code
    //             roomtypeShortCode: roomData.Roomtype_Short_code || roomData.roomtype_Short_code,
    //             createdBy: req.user._id, // Add user ID from auth
    //             updatedBy: req.user._id, // Add user ID from auth
    //             size: {
    //                 value: 300, // Default value if not provided
    //                 unit: "sqft" // Default unit
    //             },
                
    //             // Existing mappings
    //             name: roomData.Room_Name,
    //             roomName: roomData.Roomtype_Name,
    //             roomDescription: roomData.Room_Description || roomData.Room_Name,
    //             type: roomData.Roomtype_Name,
    
    //             // Required nested objects
    //             bedConfiguration: [{
    //                 type: "Default",
    //                 count: 1
    //             }],
    
    //             capacity: {
    //                 baseAdults: parseInt(roomData.base_adult_occupancy) || 2,
    //                 maxAdults: parseInt(roomData.Room_Max_adult) || 2,
    //                 baseChildren: parseInt(roomData.base_child_occupancy) || 0,
    //                 maxChildren: parseInt(roomData.Room_Max_child) || 0
    //             },
    
    //             pricing: {
    //                 basePrice: parseFloat(roomData.room_rates_info.totalprice_room_only) || 0,
    //                 rackRate: parseFloat(roomData.room_rates_info.rack_rate) || 0,
    //                 exclusiveTax: parseFloat(roomData.room_rates_info.exclusive_tax?.[Object.keys(roomData.room_rates_info.exclusive_tax)[0]] || 0),
    //                 tax: parseFloat(roomData.room_rates_info.tax?.[Object.keys(roomData.room_rates_info.tax)[0]] || 0),
    //                 totalPriceRoomOnly: parseFloat(roomData.room_rates_info.totalprice_room_only) || 0,
    //                 totalPriceInclusiveAll: parseFloat(roomData.room_rates_info.totalprice_inclusive_all) || 0,
    //                 currency: "INR",
    //                 // Add other required pricing fields with defaults
    //                 beforeDiscountInclusiveTaxAdjustment: 0,
    //                 exclusiveTaxBaseRate: 0,
    //                 adjustment: 0,
    //                 inclusiveTaxAdjustment: 0,
    //                 avgPerNightBeforeDiscount: 0,
    //                 avgPerNightAfterDiscount: 0,
    //                 avgPerNightWithoutTax: 0,
    //                 dayWiseBaseRackRate: [],
    //                 dayWiseBeforeDiscount: []
    //             },
    
    //             images: {
    //                 mainImage: roomData.room_main_image || roomData.RoomImages?.[0]?.image || '',
    //                 additionalImages: roomData.RoomImages?.map((img: any) => img.image).filter(Boolean) || []
    //             },
    
    //             availability: {
    //                 status: "available",
    //                 unavailableDates: [],
    //                 availableRooms: new Map(
    //                     Object.entries(roomData.available_rooms || {})
    //                 ),
    //                 minAvailableRooms: parseInt(roomData.min_ava_rooms) || 0,
    //                 stopSells: new Map(),
    //                 closeOnArrival: new Map(),
    //                 closeOnDept: new Map()
    //             },
    
    //             policies: {
    //                 checkInTime: roomData.check_in_time || "14:00",
    //                 checkOutTime: roomData.check_out_time || "12:00",
    //                 cancellationPolicy: roomData.cancellation_deadline || "Standard cancellation policy",
    //                 minimumStay: new Map(
    //                     Object.entries(roomData.min_nights || {})
    //                 ),
    //                 maxNights: [],
    //                 avgMinNights: "1"
    //             },
    
    //             // Add empty/default values for other required fields
    //             amenities: [],
    //             packageDescription: roomData.Package_Description || '',
    //             specialsDesc: roomData.Specials_Desc || '',
    //             specialConditions: roomData.specialconditions || '',
    //             specialHighlightInclusion: roomData.specialhighlightinclusion || '',
    //             taxes: new Map(),
    //             status: "active"
    //         };
    
    //         // Log the formatted data for debugging
    //         console.log('Formatted room data:', JSON.stringify(formattedRoomData, null, 2));
    
    //         // Check if room already exists
    //         const existingRoom = await roomManager.findByRoomTypeCode(
    //             hotelId,
    //             formattedRoomData.roomtypeShortCode
    //         );
    
    //         let savedRoom;
    //         if (existingRoom) {
    //             // Update existing room
    //             savedRoom = await roomManager.update(existingRoom._id as string, formattedRoomData);
    //         } else {
    //             // Create new room
    //             savedRoom = await roomManager.create(formattedRoomData);
    //         }
    
    //         res.status(ResponseCode.SUCCESS).json({
    //             status: ResponseStatus.SUCCESS,
    //             message: ResponseMessage.SUCCESS,
    //             data: savedRoom
    //         });
    
    //     } catch (error) {
    //         console.error("Error selecting room:", error);
    //         res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
    //             status: ResponseStatus.FAILED,
    //             message: ResponseMessage.INTERNAL_SERVER_ERROR,
    //             error: error instanceof Error ? error.message : "Unknown error"
    //         });
    //     }
    // }

    public async selectRoom(req: any, res: Response) {
        try {
            const { hotelId } = req.params;
            const { roomData } = req.body;
            
            // First check if room exists by roomtypeUnkId
            // const existingRoom = await roomManager.findByRoomTypeUnkId(roomData.roomtypeunkid);
            const existingRoom = await roomManager.findByRoomName(roomData.Room_Name);

    
            // Prepare the formatted room data
            const formattedRoomData: any = {
                hotelId,
                roomtypeUnkId: roomData.roomtypeunkid,
                ratetypeUnkId: roomData.ratetypeunkid,
                roomRateUnkId: roomData.roomrateunkid,
                hotelCode: roomData.hotelcode,
    
                // Basic room info
                roomNumber: roomData.Roomtype_Short_code,
                name: roomData.Room_Name,
                roomName: roomData.Roomtype_Name,
                roomDescription: roomData.Room_Description || roomData.Room_Name,
                roomtypeShortCode: roomData.Roomtype_Short_code,
                type: roomData.Roomtype_Name,
    
                // Additional descriptions
                packageDescription: roomData.Package_Description || '',
                specialsDesc: roomData.Specials_Desc || '',
                specialConditions: roomData.specialconditions || '',
                specialHighlightInclusion: roomData.specialhighlightinclusion || '',
                inclusion: roomData.inclusion || '',
    
                // Capacity
                capacity: {
                    baseAdults: parseInt(roomData.base_adult_occupancy) || 2,
                    maxAdults: parseInt(roomData.Room_Max_adult) || 2,
                    baseChildren: parseInt(roomData.base_child_occupancy) || 0,
                    maxChildren: parseInt(roomData.Room_Max_child) || 0,
                    maxOccupancy: roomData.max_occupancy || ''
                },
    
                // Pricing
                pricing: {
                    basePrice: parseFloat(roomData.room_rates_info.totalprice_room_only) || 0,
                    rackRate: parseFloat(roomData.room_rates_info.rack_rate) || 0,
                    beforeDiscountInclusiveTaxAdjustment: roomData.room_rates_info.before_discount_inclusive_tax_adjustment,
                    exclusiveTax: roomData.room_rates_info.exclusive_tax,
                    exclusiveTaxBaseRate: roomData.room_rates_info.exclusivetax_baserate,
                    tax: roomData.room_rates_info.tax,
                    adjustment: roomData.room_rates_info.adjustment,
                    inclusiveTaxAdjustment: roomData.room_rates_info.inclusive_tax_adjustment,
                    totalPriceRoomOnly: parseFloat(roomData.room_rates_info.totalprice_room_only) || 0,
                    totalPriceInclusiveAll: parseFloat(roomData.room_rates_info.totalprice_inclusive_all) || 0,
                    avgPerNightBeforeDiscount: parseFloat(roomData.room_rates_info.avg_per_night_before_discount) || 0,
                    avgPerNightAfterDiscount: parseFloat(roomData.room_rates_info.avg_per_night_after_discount) || 0,
                    avgPerNightWithoutTax: parseFloat(roomData.room_rates_info.avg_per_night_without_tax) || 0,
                    dayWiseBaseRackRate: roomData.room_rates_info.day_wise_baserackrate || [],
                    dayWiseBeforeDiscount: roomData.room_rates_info.day_wise_beforediscount || [],
                    currency: "INR",
                    deals: roomData.deals,
                    extraAdultRates: roomData.extra_adult_rates_info,
                    extraChildRates: roomData.extra_child_rates_info
                },
    
                // Images
                images: {
                    mainImage: roomData.room_main_image || roomData.RoomImages?.[0]?.image || '',
                    additionalImages: roomData.RoomImages?.map((img: any) => img.image).filter(Boolean) || []
                },
    
                // Availability
                availability: {
                    status: "available",
                    unavailableDates: [],
                    // availableRooms: roomData.available_rooms,
                    minAvailableRooms: parseInt(roomData.min_ava_rooms) || 0,
                    // stopSells: roomData.stopsells,
                    // closeOnArrival: roomData.close_on_arrival,
                    // closeOnDept: roomData.close_on_dept
                },
    
                // Room specifications
                size: {
                    value: 300,
                    unit: "sqft"
                },
    
                // Configuration
                bedConfiguration: [{
                    type: "Default",
                    count: 1
                }],
    
                // Policies
                policies: {
                    checkInTime: roomData.check_in_time || "14:00",
                    checkOutTime: roomData.check_out_time || "12:00",
                    cancellationPolicy: "Standard cancellation policy",
                    // minimumStay: roomData.min_nights,
                    // maxNights: roomData.max_nights || [],
                    avgMinNights: roomData.Avg_min_nights || "1",
                    cancellationDeadline: roomData.cancellation_deadline,
                    prepaidNonCancelNonRefundable: roomData.prepaid_noncancel_nonrefundable
                },
    
                // Taxes
                taxes: roomData.TaxName,
    
                // Display settings
                showPriceFormat: roomData.ShowPriceFormat,
                defaultDisplayCurrency: roomData.DefaultDisplyCurrencyCode,
                calDateFormat: roomData.CalDateFormat,
                showTaxInclusiveExclusiveSettings: roomData.ShowTaxInclusiveExclusiveSettings,
                digitsAfterDecimal: roomData.digits_after_decimal,
                visibilityNights: roomData.visiblity_nights,
                hideFromMetaSearch: roomData.hidefrommetasearch,
                bookingEngineURL: roomData.BookingEngineURL,
                localFolder: roomData.localfolder,
                currencyCode: roomData.currency_code,
                currencySign: roomData.currency_sign,
    
                // Promotions
                isPromotion: roomData.IsPromotion || false,
                promotionDetails: {
                    code: roomData.Promotion_Code,
                    description: roomData.Promotion_Description,
                    name: roomData.Promotion_Name,
                    id: roomData.Promotion_Id
                },
                packageDetails: {
                    name: roomData.Package_Name,
                    id: roomData.Package_Id
                },
    
                // Amenities
                amenities: [],
                hotelAmenities: roomData.Hotel_amenities || [],
                newRoomAmenities: roomData.NewRoomAmenities || [],
    
                // Metadata
                status: "active",
                createdBy: req.user._id,
                updatedBy: req.user._id
            };
    
            let savedRoom;
            if (existingRoom) {
                // Update existing room
                // savedRoom = await roomManager.update(existingRoom._id as string, formattedRoomData);

                //return res.status(ResponseCode.BAD_REQUEST).json({

                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: "Room already exists",
                    data: existingRoom
                });
                


            } else {
                // Create new room
                savedRoom = await roomManager.create(formattedRoomData);
            }
    
            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: savedRoom
            });
    
        } catch (error) {
            console.error("Error selecting room:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }



   public async compareRoomListings(req: Request, res: Response) {
    try {
        const hotelId = req.params.hotelId;
        console.log("Comparing room listings for hotel ID:", hotelId);
        const { check_in_date, check_out_date, number_adults, number_children,promotion_code } = req.query;

        // Validate required parameters
        if (!check_in_date || !check_out_date || !number_adults) {
            return res.status(ResponseCode.BAD_REQUEST).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.VALIDATION_ERROR,
                description: "Missing required booking details"
            });
        }

        // Get hotel details
        const hotel = await hotelManager.getById(hotelId);
        if (!hotel) {
            return res.status(ResponseCode.NOT_FOUND).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.NOT_FOUND,
                description: "Hotel not found"
            });
        }

        console.log("Hotel details:", hotel);

        // 1. Fetch rooms from API
        const queryParams = new URLSearchParams({
            request_type: "RoomList",
            HotelCode: hotel.hotelCode,
            APIKey: process.env.IPMS_API_KEY as string,
            check_in_date: check_in_date as string,
            check_out_date: check_out_date as string,
            number_adults: number_adults as string,
            number_children: number_children as string || "0",
            promotion_code: promotion_code as string || ""
        });

        const apiResponse = await axios.get(
            `https://live.ipms247.com/booking/reservation_api/listing.php?${queryParams}`
        );

        console.log("API response data:", apiResponse.data);

        // 2. Get all rooms from database for this hotel
        const dbRooms = await Room.find({ hotelId: hotelId });

        // 3. Compare rooms using manager method
        const comparisonResult = await roomManager.compareRoomListingsData(apiResponse.data, dbRooms);

        // 4. Send response
        res.status(ResponseCode.SUCCESS).json({
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.SUCCESS,
            data: {
                hotel: {
                    id: hotel._id,
                    name: hotel.name,
                    code: hotel.hotelCode
                },
                // summary: {
                //     total: comparisonResult.data.rooms.length,
                //     new: comparisonResult.data.summary.new,
                //     modified: comparisonResult.data.summary.modified,
                //     unchanged: comparisonResult.data.summary.unchanged
                // },
                rooms: comparisonResult.data.rooms
            }
        });

    } catch (error) {
        console.error("Error comparing room listings:", error);
        res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
            status: ResponseStatus.FAILED,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}



    





}

export default new RoomController();