// controllers/featured-hotel.controller.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import cloudinary from '../../config/cloudinary.config';
import { FeaturedHotelManager } from '../../services/featured-hotel.manager';
import { IResponseHandler } from '../../interfaces/response-handler.interface';
import { ResponseStatus, ResponseMessage, ResponseCode, ResponseDescription } from "../../enum/response-message.enum";
import Hotel from '../../models/hotel.model';
import FeaturedHotel from '../../models/featured-hotel.model';

export class FeaturedHotelController {
    private readonly manager: FeaturedHotelManager;

    constructor() {
        this.manager = FeaturedHotelManager.getInstance();
        // Bind all methods to maintain 'this' context
        this.addFeaturedHotel = this.addFeaturedHotel.bind(this);
        this.getFeaturedHotels = this.getFeaturedHotels.bind(this);
        this.updateImages = this.updateImages.bind(this);
        this.updateDetails = this.updateDetails.bind(this);
        this.delete = this.delete.bind(this);
        this.getById = this.getById.bind(this);
    }

    /**
     * Add a new featured hotel with custom images
     */
    // public async addFeaturedHotel(req: any, res: Response) {
    //     try {
    //         let {
    //             hotelId,
    //             position,
    //             sectionType,
    //             startDate,
    //             endDate,
    //             customTitle,
    //             customDescription,
    //             highlightTags,
    //             promotionalOffer,
    //             customAmenities,
    //             displayPrice,
    //             specialFeatures
    //         } = req.body;
    
    //         // Parse JSON strings back to objects
    //         try {
    //             // Parse customAmenities if it's a string
    //             if (typeof customAmenities === 'string') {
    //                 customAmenities = JSON.parse(customAmenities);
    //             }
    
    //             // Parse specialFeatures if it's a string
    //             if (typeof specialFeatures === 'string') {
    //                 specialFeatures = JSON.parse(specialFeatures);
    //             }
    
    //             // Parse displayPrice if it's a string
    //             if (typeof displayPrice === 'string') {
    //                 displayPrice = JSON.parse(displayPrice);
    //             }
    
    //             // Parse highlightTags if it's a string
    //             if (typeof highlightTags === 'string') {
    //                 highlightTags = JSON.parse(highlightTags);
    //             }
    //         } catch (parseError) {
    //             console.error('Error parsing JSON fields:', parseError);
    //             return res.status(ResponseCode.BAD_REQUEST).json({
    //                 status: ResponseStatus.FAILED,
    //                 message: ResponseMessage.VALIDATION_ERROR,
    //                 description: "Invalid JSON format in request body",
    //                 data: null
    //             });
    //         }
    
    //         // Input validation
    //         if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
    //             return res.status(ResponseCode.BAD_REQUEST).json({
    //                 status: ResponseStatus.FAILED,
    //                 message: ResponseMessage.VALIDATION_ERROR,
    //                 description: "Valid hotel ID is required",
    //                 data: null
    //             });
    //         }

    //         // Verify hotel exists
    //         const hotel = await Hotel.findById(hotelId);
    //         if (!hotel) {
    //             return res.status(ResponseCode.NOT_FOUND).json({
    //                 status: ResponseStatus.FAILED,
    //                 message: ResponseMessage.NOT_FOUND,
    //                 description: "Hotel not found",
    //                 data: null
    //             });
    //         }

    //         // Upload custom images if provided
    //         const customImageUrls: string[] = [];
    //         if (req.files && req.files.customImages) {
    //             const uploadPromises = req.files.customImages.map((file: Express.Multer.File) => {
    //                 return new Promise<string>((resolve, reject) => {
    //                     const stream = new Readable();
    //                     stream.push(file.buffer);
    //                     stream.push(null);

    //                     const uploadStream = cloudinary.uploader.upload_stream(
    //                         {
    //                             folder: "featured-hotels",
    //                             resource_type: "auto",
    //                             transformation: [
    //                                 { quality: "auto:best" },
    //                                 { fetch_format: "auto" }
    //                             ]
    //                         },
    //                         (error: any, result: any) => {
    //                             if (error) {
    //                                 console.error('Cloudinary upload error:', error);
    //                                 reject(error);
    //                             } else {
    //                                 console.log('Cloudinary upload success:', result.secure_url);
    //                                 resolve(result.secure_url);
    //                             }
    //                         }
    //                     );

    //                     stream.pipe(uploadStream);
    //                 });
    //             });

    //             try {
    //                 const uploadedUrls = await Promise.all(uploadPromises);
    //                 customImageUrls.push(...uploadedUrls);
    //             } catch (uploadError) {
    //                 console.error('Error during image upload:', uploadError);
    //                 throw new Error('Failed to upload custom images');
    //             }
    //         }

    //         // Create featured hotel
    //         const featuredHotel = await this.manager.create({
    //             hotelId,
    //             position: position || await this.manager.getNextPosition(sectionType),
    //             sectionType,
    //             startDate: new Date(startDate),
    //             endDate: new Date(endDate),
    //             customTitle,
    //             customDescription,
    //             customImages: customImageUrls,
    //             mainImage: customImageUrls[0] || null,
    //             highlightTags,
    //             promotionalOffer,
    //             customAmenities,
    //             displayPrice,
    //             specialFeatures,
    //             isActive: true,
    //             createdBy: req.user._id,
    //             updatedBy: req.user._id
    //         });

    //         const response: IResponseHandler = {
    //             status: ResponseStatus.SUCCESS,
    //             message: ResponseMessage.CREATED,
    //             description: ResponseDescription.FEATURED_HOTEL_ADDED,
    //             data: featuredHotel
    //         };

    //         res.status(ResponseCode.CREATED).json(response);
    //     } catch (error) {
    //         console.error('Error in addFeaturedHotel:', error);
    //         res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
    //             status: ResponseStatus.FAILED,
    //             message: ResponseMessage.INTERNAL_SERVER_ERROR,
    //             description: error instanceof Error ? error.message : "Failed to add featured hotel",
    //             data: null
    //         });
    //     }
    // }

    public async addFeaturedHotel(req: any, res: Response) {
        try {
            let {
                hotelId,
                position,
                sectionType,
                startDate,
                endDate,
                customTitle,
                customDescription,
                highlightTags,
                promotionalOffer,
                customAmenities,
                displayPrice,
                specialFeatures,
                selectedHotelImages
            } = req.body;
    
            // Parse JSON strings
            try {
                if (typeof customAmenities === 'string') customAmenities = JSON.parse(customAmenities);
                if (typeof specialFeatures === 'string') specialFeatures = JSON.parse(specialFeatures);
                if (typeof displayPrice === 'string') displayPrice = JSON.parse(displayPrice);
                if (typeof highlightTags === 'string') highlightTags = JSON.parse(highlightTags);
                if (typeof selectedHotelImages === 'string') selectedHotelImages = JSON.parse(selectedHotelImages);
            } catch (parseError) {
                console.error('Error parsing JSON fields:', parseError);
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.VALIDATION_ERROR,
                    description: "Invalid JSON format in request body",
                    data: null
                });
            }
    
            // Basic validation...
    
            // Handle both existing URLs and new file uploads
            let allImages: string[] = [];
    
            // First, add all existing URLs
            if (Array.isArray(selectedHotelImages)) {
                allImages = [...selectedHotelImages];
            }
    
            // Then handle file uploads
            if (req.files) {
                const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
                const uploadPromises = files.map((file:any) => {
                    return new Promise<string>((resolve, reject) => {
                        const stream = new Readable();
                        stream.push(file.buffer);
                        stream.push(null);
    
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: "featured-hotels",
                                resource_type: "auto",
                                transformation: [
                                    { quality: "auto:best" },
                                    { fetch_format: "auto" }
                                ]
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
    
                        stream.pipe(uploadStream);
                    });
                });
    
                try {
                    const uploadedUrls = await Promise.all(uploadPromises);
                    
                    // Determine where to insert new images based on position
                    uploadedUrls.forEach((url, index) => {
                        const position = parseInt(files[index].fieldname.split('_')[1] || '0');
                        if (position >= 0 && position <= allImages.length) {
                            allImages.splice(position, 0, url);
                        } else {
                            allImages.push(url);
                        }
                    });
                } catch (uploadError) {
                    console.error('Error during image upload:', uploadError);
                    throw new Error('Failed to upload custom images');
                }
            }
    
            // Create featured hotel with all images
            const featuredHotel = await this.manager.create({
                hotelId,
                position: position || await this.manager.getNextPosition(sectionType),
                sectionType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                customTitle,
                customDescription,
                customImages: allImages,
                mainImage: allImages[0] || null,
                highlightTags,
                promotionalOffer,
                customAmenities,
                displayPrice,
                specialFeatures,
                isActive: true,
                createdBy: req.user._id,
                updatedBy: req.user._id
            });
    
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.CREATED,
                description: ResponseDescription.FEATURED_HOTEL_ADDED,
                data: featuredHotel
            };
    
            res.status(ResponseCode.CREATED).json(response);
        } catch (error) {
            console.error('Error in addFeaturedHotel:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: error instanceof Error ? error.message : "Failed to add featured hotel",
                data: null
            });
        }
    }

    /**
     * Get all featured hotels
     */
    public async getFeaturedHotels(req: Request, res: Response) {
        try {
            const { 
                sectionType, 
                page = 1,
                limit = 10,
                sortField = 'position',
                sortOrder = 'asc',
                status,
                search
            } = req.query;
    
            // Build filter object
            const filters: any = {};
    
            if (sectionType) {
                filters.sectionType = sectionType;
            }
    
            if (status !== 'all') {
                filters.isActive = true;
                // filters.startDate = { $lte: new Date() };
                // filters.endDate = { $gte: new Date() };
            }
    
            if (search) {
                filters.$or = [
                    { customTitle: { $regex: search, $options: 'i' } },
                    { customDescription: { $regex: search, $options: 'i' } }
                ];
            }
    
            // Get featured hotels - pass parameters as an object
            const { hotels, total } = await this.manager.getAll({
                filters,
                page: Number(page),
                limit: Number(limit),
                sortField: sortField as string,
                sortOrder: sortOrder as 'asc' | 'desc'
            });
    
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.FEATURED_HOTELS_FETCHED,
                data: {
                    hotels,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit))
                    }
                }
            };
    
            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in getFeaturedHotels:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: error instanceof Error ? error.message : "Failed to fetch featured hotels",
                data: null
            });
        }
    }

    /**
     * Update featured hotel images
     */
    public async updateImages(req: any, res: Response) {
        try {
            const { id } = req.params;
            const { keepExistingImages = 'true' } = req.body;

            // Validate featured hotel exists
            const featuredHotel = await FeaturedHotel.findById(id);
            if (!featuredHotel) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: "Featured hotel not found",
                    data: null
                });
            }

            // Upload new images if provided
            const newImageUrls: string[] = [];
            if (req.files && req.files.customImages) {
                const uploadPromises = req.files.customImages.map((file: Express.Multer.File) => {
                    return new Promise<string>((resolve, reject) => {
                        const stream = new Readable();
                        stream.push(file.buffer);
                        stream.push(null);

                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: "featured-hotels",
                                resource_type: "auto",
                                transformation: [
                                    { quality: "auto:best" },
                                    { fetch_format: "auto" }
                                ]
                            },
                            (error: any, result: any) => {
                                if (error) reject(error);
                                else resolve(result.secure_url);
                            }
                        );

                        stream.pipe(uploadStream);
                    });
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                newImageUrls.push(...uploadedUrls);
            }

            // Combine existing images with new ones based on keepExistingImages flag
            const existingImages = keepExistingImages === 'true' ? 
                (featuredHotel.customImages || []) : [];
            const finalImageUrls = [...existingImages, ...newImageUrls];

            // Update featured hotel with new images
            const updatedFeaturedHotel = await this.manager.update(id, {
                customImages: finalImageUrls,
                mainImage: finalImageUrls[0] || null,
                updatedBy: req.user._id
            }, req.user._id);

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.UPDATED,
                description: ResponseDescription.FEATURED_HOTEL_IMAGES_UPDATED,
                data: updatedFeaturedHotel
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in updateImages:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: error instanceof Error ? error.message : "Failed to update images",
                data: null
            });
        }
    }

    /**
     * Update featured hotel details
     */
    public async updateDetails(req: any, res: Response) {
        try {
            const { id } = req.params;
            const {
                customTitle,
                customDescription,
                highlightTags,
                promotionalOffer,
                customAmenities,
                displayPrice,
                specialFeatures,
                position,
                sectionType,
                startDate,
                endDate,
                isActive
            } = req.body;

            // Validate featured hotel exists
            const featuredHotel = await FeaturedHotel.findById(id);
            if (!featuredHotel) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: "Featured hotel not found",
                    data: null
                });
            }

            // Prepare update data
            const updateData = {
                ...(customTitle && { customTitle }),
                ...(customDescription && { customDescription }),
                ...(highlightTags && { highlightTags }),
                ...(promotionalOffer && { promotionalOffer }),
                ...(customAmenities && { customAmenities }),
                ...(displayPrice && { displayPrice }),
                ...(specialFeatures && { specialFeatures }),
                ...(position && { position }),
                ...(sectionType && { sectionType }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(typeof isActive === 'boolean' && { isActive }),
                updatedBy: req.user._id
            };

            // Update featured hotel
            const updatedFeaturedHotel = await this.manager.update(id, updateData, req.user._id);

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.UPDATED,
                description: ResponseDescription.FEATURED_HOTEL_DETAILS_UPDATED,
                data: updatedFeaturedHotel
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in updateDetails:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: error instanceof Error ? error.message : "Failed to update details",
                data: null
            });
        }
    }

    /**
     * Delete featured hotel
     */
    public async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const deletedHotel = await this.manager.delete(id);
            if (!deletedHotel) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: "Featured hotel not found",
                    data: null
                });
            }

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.DELETED,
                description: ResponseDescription.FEATURED_HOTEL_DELETED,
                data: null
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in delete:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: error instanceof Error ? error.message : "Failed to delete featured hotel",
                data: null
            });
        }
    }

    /**
     * Get featured hotel by ID
     */
    public async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const featuredHotel = await this.manager.getById(id);
            if (!featuredHotel) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: "Featured hotel not found",
                    data: null
                });
            }

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.FEATURED_HOTEL_FETCHED,
                data: featuredHotel
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in getById:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: error instanceof Error ? error.message : "Failed to fetch featured hotel",
                data: null
            });
        }
    }
}

export default new FeaturedHotelController();