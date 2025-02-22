// controllers/hotel.controller.ts
import { Request, Response } from "express";
import hotelManager from "../../services/hotel.manager";
import { hotelResponseData } from "../../utils/hotelResponse/hotel-response.utils";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { ResponseStatus, ResponseMessage, ResponseCode,ResponseDescription } from "../../enum/response-message.enum";
import cloudinary from "../../config/cloudinary.config";
import { Readable } from 'stream';
import { IHotel } from "../../interfaces/hotel/hotel.interface";
import mongoose, { FilterQuery } from "mongoose";
import Hotel from "../../models/hotel.model";
import { PipelineStage } from 'mongoose';
import Room from "../../models/room.model";
import Amenity from "../../models/amenity.model";
import axios from "axios";
export class HotelController {
    // public async create(req: any, res: Response) {
    //     try {
    //         const imageUrls: string[] = [];

    //         // Upload images to Cloudinary
    //         if (req.files && Array.isArray(req.files)) {
    //             const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
    //                 return new Promise<string>((resolve, reject) => {
    //                     const uploadStream = cloudinary.uploader.upload_stream(
    //                         {
    //                             folder: "hotels",
    //                             resource_type: "auto",
    //                         },
    //                         (error: any, result: any) => {
    //                             if (error) reject(error);
    //                             else resolve(result.secure_url);
    //                         }
    //                     );

    //                     const bufferStream = new Readable();
    //                     bufferStream.push(file.buffer);
    //                     bufferStream.push(null);
                        
    //                     bufferStream.pipe(uploadStream);
    //                 });
    //             });

    //             const uploadedUrls = await Promise.all(uploadPromises);
    //             imageUrls.push(...uploadedUrls);
    //         }

    //         // Parse the form data
    //         let hotelData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    //         console.log('hotelData:', hotelData);

    //         const hotel = {
    //             ...hotelData,
    //             images: imageUrls,
    //             createdBy: req.user._id,
    //             updatedBy: req.user._id
    //         };

    //         // Validate required fields
    //         const requiredFields = ['name', 'type', 'description', 'address', 'contact', 'policies'];
    //         for (const field of requiredFields) {
    //             if (!hotel[field]) {
    //                 return res.status(ResponseCode.BAD_REQUEST).json({
    //                     status: ResponseStatus.FAILED,
    //                     message: ResponseMessage.VALIDATION_ERROR,
    //                     description: `${field} is required`,
    //                     data: null
    //                 });
    //             }
    //         }

    //         const newHotel = await hotelManager.create(hotel);
    //         const response: IResponseHandler = {
    //             status: ResponseStatus.SUCCESS,
    //             message: ResponseMessage.CREATED,
    //             description: ResponseDescription.HOTEL_CREATED,
    //             data: newHotel
    //         };

    //         res.status(ResponseCode.CREATED).json(response);
    //     } catch (error) {
    //         console.error('Error in create hotel:', error);
    //         res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
    //             status: ResponseStatus.FAILED,
    //             message: ResponseMessage.INTERNAL_SERVER_ERROR,
    //             description: ResponseDescription.HOTEL_FAILED,
    //             data: null
    //         });
    //     }
    // }

    // Helper method for uploading multiple images
   
    public async create(req: any, res: Response) {
        try {
            const imageUrls: string[] = [];
            console.log('Starting hotel creation process...');

            // Upload images to Cloudinary if files exist
            if (req.files && req.files.hotelImages && req.files.hotelImages.length > 0) {
                console.log('Processing images for upload...');
                
                const uploadPromises = req.files.hotelImages.map((file: Express.Multer.File) => {
                    return new Promise<string>((resolve, reject) => {
                        // Create a buffer stream
                        const stream = new Readable();
                        stream.push(file.buffer);
                        stream.push(null);

                        // Create upload stream
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: "hotels",
                                resource_type: "auto",
                            },
                            (error: any, result: any) => {
                                if (error) {
                                    console.error('Cloudinary upload error:', error);
                                    reject(error);
                                } else {
                                    console.log('Cloudinary upload success:', result.secure_url);
                                    resolve(result.secure_url);
                                }
                            }
                        );

                        // Pipe the buffer stream to the upload stream
                        stream.pipe(uploadStream);
                    });
                });

                try {
                    console.log('Waiting for all uploads to complete...');
                    const uploadedUrls = await Promise.all(uploadPromises);
                    imageUrls.push(...uploadedUrls);
                    console.log('All images uploaded successfully:', imageUrls);
                } catch (uploadError) {
                    console.error('Error during image upload:', uploadError);
                    throw new Error('Failed to upload images to Cloudinary');
                }
            }

            // Parse strings back to objects if needed (should already be done by validation middleware)
            const hotel:any = {
                name: req.body.name,
                hotelCode: req.body.hotelCode,
                type: req.body.type,
                description: req.body.description,
                address: typeof req.body.address === 'string' ? JSON.parse(req.body.address) : req.body.address,
                contact: typeof req.body.contact === 'string' ? JSON.parse(req.body.contact) : req.body.contact,
                policies: typeof req.body.policies === 'string' ? JSON.parse(req.body.policies) : req.body.policies,
                amenities: typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities,
                images: imageUrls,
                createdBy: req.user._id,
                updatedBy: req.user._id,
                status: 'active'
            };

            console.log('Prepared hotel data:', hotel);

            // Create hotel in database
            const newHotel = await hotelManager.create(hotel);
            console.log('Hotel created successfully:', newHotel);

            const response = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.CREATED,
                description: ResponseDescription.HOTEL_CREATED,
                data: newHotel
            };

            res.status(ResponseCode.CREATED).json(response);
        } catch (error) {
            console.error('Error in create hotel:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: error instanceof Error ? error.message : ResponseDescription.HOTEL_FAILED,
                data: null
            });
        }
    }
   
    private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "hotels",
                    resource_type: "auto",
                },
                (error: any, result: any) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                }
            );

            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null);
            
            bufferStream.pipe(uploadStream);
        });
    }


    public async getAllHotels(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const status = req.query.status as string;
            const sortField = req.query.sortField as string || 'createdAt';
            const sortOrder = req.query.sortOrder as string || 'desc';

            // Build filter object
            const filters: any = {};
            if (search) {
                filters.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { 'address.city': { $regex: search, $options: 'i' } },
                    { type: { $regex: search, $options: 'i' } }
                ];
            }
            if (status && status !== 'all') {
                filters.status = status;
            }

            const { hotels, total } = await hotelManager.getAll(
                filters,
                page,
                limit,
                sortField,
                sortOrder
            );

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.HOTEL_FETCHED,
                data: {
                    hotels: hotels.map(hotel => ({
                        _id: hotel._id,
                        name: hotel.name,
                        hotelCode: hotel.hotelCode,
                        type: hotel.type,
                        address: hotel.address,
                        rating: hotel.rating,
                        status: hotel.status,
                        images: hotel.images,
                        amenities: hotel.amenities,
                        contact: hotel.contact,
                        description: hotel.description,
                    })),
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in getAllHotels:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.HOTEL_FAILED,
                data: null
            });
        }
    }


    public async getHotelById(req: Request, res: Response) {
        try {
          console.log('Starting hotel fetch process...');
            const hotel = await hotelManager.getById(req.params.id);
            
            if (!hotel) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    data: null
                });
            }

            const data = hotelResponseData(hotel);
            
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.HOTEL_FETCHED,
                data: data
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.HOTEL_FAILED,
                data: null
            });
        }
    }

    // public async updateHotel(req: any, res: Response) {
    //     try {
    //         const hotel = {
    //             ...req.body,
    //             updatedBy: req.user._id
    //         };

    //         const updatedHotel = await hotelManager.update(req.params.id, hotel);
            
    //         if (!updatedHotel) {
    //             return res.status(ResponseCode.NOT_FOUND).json({
    //                 status: ResponseStatus.FAILED,
    //                 message: ResponseMessage.NOT_FOUND,
    //                 description: ResponseDescription.HOTEL_NOT_FOUND,
    //                 data: null
    //             });
    //         }

    //         const response: IResponseHandler = {
    //             status: ResponseStatus.SUCCESS,
    //             message: ResponseMessage.UPDATED,
    //             description: ResponseDescription.HOTEL_UPDATED,
    //             data: updatedHotel
    //         };

    //         res.status(ResponseCode.SUCCESS).json(response);
    //     } catch (error) {
    //         console.error('Error in update hotel:', error);
    //         res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
    //             status: ResponseStatus.FAILED,
    //             message: ResponseMessage.INTERNAL_SERVER_ERROR,
    //             description: ResponseDescription.HOTEL_FAILED,
    //             data: null
    //         });
    //     }
    // }


    public async updateHotel(req: any, res: Response) {
        try {
            const imageUrls: string[] = [];
            console.log('Starting hotel update process...');

            // Upload new images to Cloudinary if files exist
            if (req.files && req.files.hotelImages && req.files.hotelImages.length > 0) {
                console.log('Processing new images for upload...');
                
                const uploadPromises = req.files.hotelImages.map((file: Express.Multer.File) => {
                    return new Promise<string>((resolve, reject) => {
                        // Create a buffer stream
                        const stream = new Readable();
                        stream.push(file.buffer);
                        stream.push(null);

                        // Create upload stream
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: "hotels",
                                resource_type: "auto",
                            },
                            (error: any, result: any) => {
                                if (error) {
                                    console.error('Cloudinary upload error:', error);
                                    reject(error);
                                } else {
                                    console.log('Cloudinary upload success:', result.secure_url);
                                    resolve(result.secure_url);
                                }
                            }
                        );

                        // Pipe the buffer stream to the upload stream
                        stream.pipe(uploadStream);
                    });
                });

                try {
                    console.log('Waiting for all uploads to complete...');
                    const uploadedUrls = await Promise.all(uploadPromises);
                    imageUrls.push(...uploadedUrls);
                    console.log('All new images uploaded successfully:', imageUrls);
                } catch (uploadError) {
                    console.error('Error during image upload:', uploadError);
                    throw new Error('Failed to upload images to Cloudinary');
                }
            }

            // Get existing hotel data
            const existingHotel = await hotelManager.getById(req.params.id);
            if (!existingHotel) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: ResponseDescription.HOTEL_NOT_FOUND,
                    data: null
                });
            }

            // Combine existing images with new ones if specified
            const existingImages = req.body.keepExistingImages === 'false' ? [] : (existingHotel.images || []);
            const finalImageUrls = [...existingImages, ...imageUrls];

            // Prepare update data
            const hotelUpdateData = {
                name: req.body.name,
                hotelCode: req.body.hotelCode,
                type: req.body.type,
                description: req.body.description,
                address: typeof req.body.address === 'string' ? JSON.parse(req.body.address) : req.body.address,
                contact: typeof req.body.contact === 'string' ? JSON.parse(req.body.contact) : req.body.contact,
                policies: typeof req.body.policies === 'string' ? JSON.parse(req.body.policies) : req.body.policies,
                amenities: typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities,
                images: finalImageUrls,
                updatedBy: req.user._id
            };

            console.log('Prepared hotel update data:', hotelUpdateData);

            // Update hotel in database
            const updatedHotel = await hotelManager.update(req.params.id, hotelUpdateData);
            
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.UPDATED,
                description: ResponseDescription.HOTEL_UPDATED,
                data: updatedHotel
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in update hotel:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: error instanceof Error ? error.message : ResponseDescription.HOTEL_FAILED,
                data: null
            });
        }
    }

    public async deleteHotel(req: Request, res: Response) {
        try {
            const hotel = await hotelManager.delete(req.params.id);
            
            if (!hotel) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: ResponseDescription.HOTEL_NOT_FOUND,
                    data: null
                });
            }

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.DELETED,
                description: ResponseDescription.HOTEL_DELETED,
                data: null
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in delete hotel:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.HOTEL_FAILED,
                data: null
            });
        }
    }

    public async updateHotelStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const updatedHotel = await hotelManager.updateStatus(req.params.id, status);
            
            if (!updatedHotel) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: ResponseDescription.HOTEL_NOT_FOUND,
                    data: null
                });
            }

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.UPDATED,
                description: ResponseDescription.HOTEL_STATUS_UPDATED,
                data: updatedHotel
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in update hotel status:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.HOTEL_FAILED,
                data: null
            });
        }
    }


    // async searchHotels(req: Request, res: Response) {
    //     try {
    //       const {
    //         page = 1,
    //         limit = 12,
    //         search,
    //         status = 'active',
    //         sortField = 'createdAt',
    //         sortOrder = 'desc',
    //         minPrice,
    //         maxPrice,
    //         amenities,
    //         city,
    //         checkIn,
    //         checkOut,
    //         adults,
    //         children
    //       } = req.query;
          
    //       console.log('Starting hotel search process...');
    //       console.log('Query parameters:', req.query);
      
    //       // Initial match stage for hotels
    //       const initialMatch: any = { status };
      
    //       // Text search for hotels
    //       if (search) {
    //         initialMatch.$or = [
    //           { name: { $regex: search, $options: 'i' } },
    //           { 'address.city': { $regex: search, $options: 'i' } },
    //           { type: { $regex: search, $options: 'i' } }
    //         ];
    //       }
      
    //       // Location filter - only add if city is not 'All'
    //       if (city && city !== 'All') {
    //         initialMatch['address.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    //       }
      
    //       // Amenities filter with ObjectId conversion
    //       if (amenities) {
    //         const amenityList = (amenities as string).split(',').map(id => new mongoose.Types.ObjectId(id));
    //         initialMatch.amenities = { $in: amenityList };
    //       }
      
    //       // Create the aggregation pipeline
    //       const pipeline: PipelineStage[] = [
    //         // Initial match for hotels
    //         { $match: initialMatch },
      
    //         // Populate amenities
    //         {
    //           $lookup: {
    //             from: 'amenities',
    //             localField: 'amenities',
    //             foreignField: '_id',
    //             as: 'amenitiesData'
    //           }
    //         },
      
    //         // Lookup rooms for each hotel
    //         {
    //           $lookup: {
    //             from: 'rooms',
    //             let: { hotelId: '$_id' },
    //             pipeline: [
    //               {
    //                 $match: {
    //                   $expr: { $eq: ['$hotelId', '$$hotelId'] },
    //                   status: 'active'
    //                 }
    //               },
    //               ...(minPrice || maxPrice ? [{
    //                 $match: {
    //                   $and: [
    //                     ...(minPrice ? [{ 'pricing.basePrice': { $gte: Number(minPrice) } }] : []),
    //                     ...(maxPrice ? [{ 'pricing.basePrice': { $lte: Number(maxPrice) } }] : [])
    //                   ]
    //                 }
    //               }] : [])
    //             ],
    //             as: 'availableRooms'
    //           }
    //         },
      
    //         // Add fields for room prices and format amenities
    //         {
    //           $addFields: {
    //             minRoomPrice: {
    //               $cond: {
    //                 if: { $gt: [{ $size: '$availableRooms' }, 0] },
    //                 then: { $min: '$availableRooms.pricing.basePrice' },
    //                 else: 0
    //               }
    //             },
    //             maxRoomPrice: {
    //               $cond: {
    //                 if: { $gt: [{ $size: '$availableRooms' }, 0] },
    //                 then: { $max: '$availableRooms.pricing.basePrice' },
    //                 else: 0
    //               }
    //             },
    //             amenities: {
    //               $map: {
    //                 input: '$amenitiesData',
    //                 as: 'amenity',
    //                 in: {
    //                   _id: '$$amenity._id',
    //                   name: '$$amenity.name',
    //                   icon: '$$amenity.icon',
    //                   category: '$$amenity.category'
    //                 }
    //               }
    //             }
    //           }
    //         },
      
    //         // Remove the amenitiesData array since we've transformed it
    //         {
    //           $project: {
    //             amenitiesData: 0
    //           }
    //         },
      
    //         // Sort hotels
    //         {
    //           $sort: {
    //             [(sortField as string)]: sortOrder === 'asc' ? 1 : -1
    //           }
    //         }
    //       ];
      
    //       // Debug log to check the pipeline
    //       console.log('Pipeline match stage:', JSON.stringify(initialMatch, null, 2));
      
    //       // Execute aggregation with pagination
    //       const paginatedPipeline: PipelineStage[] = [
    //         ...pipeline,
    //         { $skip: (Number(page) - 1) * Number(limit) },
    //         { $limit: Number(limit) }
    //       ];
      
    //       const countPipeline: PipelineStage[] = [
    //         ...pipeline,
    //         { $count: 'total' }
    //       ];
      
    //       const [hotels, totalResults] = await Promise.all([
    //         Hotel.aggregate(paginatedPipeline),
    //         Hotel.aggregate(countPipeline)
    //       ]);
      
    //       // Get all available amenities for filters
    //       const availableAmenities = await Amenity.find(
    //         { isActive: true },
    //         { name: 1, icon: 1, category: 1 }
    //       ).sort({ name: 1 });
      
    //       // Get all unique cities
    //       const cities = await Hotel.distinct('address.city', { status: 'active' });
      
    //       // Get price range stats from rooms collection
    //       const priceStats = await Room.aggregate([
    //         {
    //           $match: {
    //             status: 'active'
    //           }
    //         },
    //         {
    //           $group: {
    //             _id: null,
    //             minPrice: { $min: '$pricing.basePrice' },
    //             maxPrice: { $max: '$pricing.basePrice' }
    //           }
    //         }
    //       ]);
      
    //       // Format the response
    //       const response = {
    //         status: 'success',
    //         message: 'Hotels fetched successfully',
    //         description: 'List of hotels matching the criteria',
    //         data: {
    //           hotels: hotels.map(hotel => ({
    //             ...hotel,
    //             minRoomPrice: hotel.minRoomPrice,
    //             maxRoomPrice: hotel.maxRoomPrice,
    //             availableRooms: hotel.availableRooms.length,
    //           })),
    //           pagination: {
    //             page: Number(page),
    //             limit: Number(limit),
    //             total: totalResults[0]?.total || 0,
    //             pages: Math.ceil((totalResults[0]?.total || 0) / Number(limit))
    //           },
    //           filters: {
    //             priceRange: priceStats[0] ? {
    //               min: priceStats[0].minPrice,
    //               max: priceStats[0].maxPrice
    //             } : { min: 0, max: 0 },
    //             availableAmenities,
    //             locations: ['All', ...cities]
    //           }
    //         }
    //       };
      
    //       res.status(200).json(response);
    //     } catch (error) {
    //       console.error('Error in searchHotels:', error);
    //       res.status(500).json({
    //         status: 'error',
    //         message: 'Internal server error',
    //         description: error instanceof Error ? error.message : 'Unknown error occurred',
    //         data: null
    //       });
    //     }
    //   }

    async searchHotels(req: Request, res: Response) {
      try {
        const {
          page = 1,
          limit = 12,
          search,
          status = 'active',
          sortField = 'createdAt',
          sortOrder = 'desc',
          minPrice,
          maxPrice,
          amenities,
          city,
          checkIn,
          checkOut,
          adults,
          children
        } = req.query;
        
        console.log('Starting hotel search process...');
    
        // Initial match stage for hotels
        const initialMatch: any = { status };
    
        // Text search for hotels
        if (search) {
          initialMatch.$or = [
            { name: { $regex: search, $options: 'i' } },
            { 'address.city': { $regex: search, $options: 'i' } },
            { type: { $regex: search, $options: 'i' } }
          ];
        }
    
        // Location filter
        if (city && city !== 'All') {
          initialMatch['address.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
        }
    
        // Amenities filter
        if (amenities) {
          const amenityList = (amenities as string).split(',').map(id => new mongoose.Types.ObjectId(id));
          initialMatch.amenities = { $in: amenityList };
        }
    
        // Get hotels from database
        const hotels = await Hotel.find(initialMatch)
          .populate('amenities')
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit))
          .sort({ [sortField as string]: sortOrder === 'asc' ? 1 : -1 });
    
        // For each hotel, fetch room data from third-party API
        const hotelsWithRoomData = await Promise.all(hotels.map(async (hotel:any) => {
          if (checkIn && checkOut && adults) {
            try {
              // Prepare API parameters
              const queryParams = new URLSearchParams({
                request_type: "RoomList",
                HotelCode: hotel.hotelCode,
                APIKey: process.env.IPMS_API_KEY as string,
                check_in_date: checkIn as string,
                check_out_date: checkOut as string,
                number_adults: adults as string,
                number_children: children as string || "0"
              });
    
              // Call third-party API
              const response = await axios.get(
                `https://live.ipms247.com/booking/reservation_api/listing.php?${queryParams}`
              );
    
              // Process room data
              if (response.data && Array.isArray(response.data)) {
                // Filter out invalid rooms (zero price or no images)
                const validRooms = response.data.filter(room => {
                  const hasPrice = parseFloat(room.room_rates_info?.totalprice_room_only || '0') > 0;
                  const hasImages = room.room_main_image || (room.RoomImages && room.RoomImages.length > 0);
                  return hasPrice && hasImages;
                });
    
                if (validRooms.length === 0) {
                  console.log(`No valid rooms found for hotel ${hotel.hotelCode}`);
                  return null; // Skip this hotel if no valid rooms
                }

                console.log(`Valid Rooms for hotel ${hotel.hotelCode}:`, validRooms);
                
                // Find lowest price room among valid rooms
                const lowestPriceRoom = validRooms.reduce((min, room) => {
                  const currentPrice = parseFloat(room.room_rates_info?.totalprice_room_only || '0');
                  return currentPrice < min.price ? { 
                    price: currentPrice,
                    images: room.RoomImages?.map((img: any) => img.image).filter(Boolean) || [],
                    mainImage: room.room_main_image,
                    name: room.Room_Name,
                    description: room.Room_Description,
                    specialHighlights: room.specialhighlightinclusion,
                    maxAdults: parseInt(room.Room_Max_adult) || 2,
                    maxChildren: parseInt(room.Room_Max_child) || 0,
                    deals: room.deals || '',
                    inclusivePriceWithTax: parseFloat(room.room_rates_info?.totalprice_inclusive_all || '0')
                  } : min;
                }, { 
                  price: Infinity, 
                  images: [], 
                  mainImage: '',
                  name: '',
                  description: '',
                  specialHighlights: '',
                  maxAdults: 2,
                  maxChildren: 0,
                  deals: '',
                  inclusivePriceWithTax: 0
                });

                console.log('Lowest price room:', lowestPriceRoom);
    
                // Calculate tax amount
                const taxAmount = lowestPriceRoom.inclusivePriceWithTax - lowestPriceRoom.price;
                console.log('Tax amount:', taxAmount);
    
                // Update hotel with room data
                return {
                  _id: hotel._id,
                  name: hotel.name,
                  roomName: lowestPriceRoom.name,
                  type: hotel.type,
                  description: hotel.description || lowestPriceRoom.description,
                  address: {
                    ...hotel.address,
                    distanceFromLandmark: hotel.address.distanceFromLandmark || "City Center"
                  },
                  rating: hotel.rating || 4,
                  amenities: hotel.amenities,
                  images: lowestPriceRoom.images.length > 0 ? lowestPriceRoom.images : hotel.images,
                  mainImage: lowestPriceRoom.mainImage || hotel.mainImage || hotel.images[0],
                  pricing: {
                    basePrice: lowestPriceRoom.price,
                    taxesAndFees: taxAmount,
                    totalPrice: lowestPriceRoom.inclusivePriceWithTax,
                    currency: "INR"
                  },
                  propertyHighlights: lowestPriceRoom.specialHighlights || hotel.description?.substring(0, 100) + '...',
                  deals: lowestPriceRoom.deals,
                  capacity: {
                    maxAdults: lowestPriceRoom.maxAdults,
                    maxChildren: lowestPriceRoom.maxChildren
                  },
                  status: hotel.status
                };
              }
            } catch (error) {
              console.error(`Error fetching room data for hotel ${hotel.hotelCode}:`, error);
            }
          }
    
          // Return original hotel data if API call fails or dates not provided
          return hotel;
        }));
    
        // Filter out null values (hotels with no valid rooms)
        const validHotels = hotelsWithRoomData.filter(hotel => hotel !== null);
    
        // Get total count for pagination
        const total = await Hotel.countDocuments(initialMatch);
    
        // Format response
        const response = {
          status: 'success',
          message: 'Hotels fetched successfully',
          data: {
            hotels: validHotels,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total,
              pages: Math.ceil(total / Number(limit))
            }
          }
        };
    
        res.status(200).json(response);
      } catch (error) {
        console.error('Error in searchHotels:', error);
        res.status(500).json({
          status: 'error',
          message: 'Internal server error',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          data: null
        });
      }
    }



      
    public async getHotelStats(req: Request, res: Response) {
        try {
            const stats = await hotelManager.getHotelStats();
    
            const formattedStats :any = {
                totalHotels: 0,
                byStatus: {},
                averageRating: 0
            };
    
            let totalHotels = 0;
            let totalRating = 0;
    
            stats.forEach((stat: any) => {
                totalHotels += stat.count;
                totalRating += (stat.averageRating * stat.count);
                formattedStats.byStatus[stat._id] = {
                    count: stat.count,
                    averageRating: Number(stat.averageRating.toFixed(2))
                };
            });
    
            formattedStats.totalHotels = totalHotels;
            formattedStats.averageRating = totalHotels > 0 
                ? Number((totalRating / totalHotels).toFixed(2))
                : 0;
    
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.HOTEL_STATS_FETCHED,
                data: formattedStats
            };
    
            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in getHotelStats:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.HOTEL_FAILED,
                data: null
            });
        }
    }
    
    public async bulkDeleteHotels(req: Request, res: Response) {
        try {
            const { hotelIds } = req.body;
    
            if (!Array.isArray(hotelIds) || hotelIds.length === 0) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: 'hotelIds must be a non-empty array',
                    data: null
                });
            }
    
            const result = await hotelManager.bulkDelete(hotelIds);
    
            if (!result) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: ResponseDescription.HOTEL_NOT_FOUND,
                    data: null
                });
            }
    
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.DELETED,
                description: ResponseDescription.HOTELS_BULK_DELETED,
                data: null
            };
    
            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in bulkDeleteHotels:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.HOTEL_FAILED,
                data: null
            });
        }
    }
}

export default new HotelController();
