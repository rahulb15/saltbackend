
// controllers/banquetHall.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import cloudinary from '../../config/cloudinary.config';
import { IResponseHandler } from '../../interfaces/response-handler.interface';
import BanquetHall from '../../models/banquetHall.model';
import { ResponseStatus, ResponseMessage, ResponseCode, ResponseDescription } from "../../enum/response-message.enum";

export class BanquetHallController {
  private static instance: BanquetHallController;

  public static getInstance(): BanquetHallController {
    if (!BanquetHallController.instance) {
      BanquetHallController.instance = new BanquetHallController();
    }
    return BanquetHallController.instance;
  }

  // Create a new banquet hall
//   public async create(req: any, res: Response): Promise<any> {
//     try {
//       const { name, description, capacity, location, amenities, pricing, availability, rules } = req.body;
//       console.log(req.body);
//       const images = req.files?.images;

//       // Validate required fields
//       if (!name || !description || !capacity || !location || !pricing || !images) {
//         return res.status(ResponseCode.BAD_REQUEST).json({
//           status: ResponseStatus.FAILED,
//           message: "Missing required fields",
//           description: ResponseDescription.VALIDATION_ERROR,
//           data: null
//         });
//       }

//       // Upload images to Cloudinary
//       const uploadedUrls = await Promise.all(
//         images.map((image: any) =>
//           new Promise((resolve, reject) => {
//             const stream = cloudinary.uploader.upload_stream(
//               {
//                 folder: "banquet-halls",
//                 use_filename: true,
//                 unique_filename: true,
//               },
//               (error: any, result: any) => {
//                 if (error) reject(error);
//                 else resolve(result.secure_url);
//               }
//             );
//             stream.write(image.buffer);
//             stream.end();
//           })
//         )
//       );

//       const banquetHall = await BanquetHall.create({
//         name,
//         description,
//         images: uploadedUrls,
//         capacity,
//         location,
//         amenities: amenities || [],
//         pricing,
//         availability: availability || {},
//         rules: rules || []
//       });

//       const response: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.CREATED,
//         description: ResponseDescription.CREATED,
//         data: banquetHall
//       };

//       return res.status(ResponseCode.CREATED).json(response);
//     } catch (error) {
//       console.error("Error in create banquet hall:", error);
//       return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//         status: ResponseStatus.INTERNAL_SERVER_ERROR,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.INTERNAL_SERVER_ERROR,
//         data: null
//       });
//     }
//   }

public async create(req: any, res: Response): Promise<any> {
    try {
      const { name, description, capacity, location, amenities, pricing, availability, rules } = req.body;
      console.log("Raw request body:", req.body);
      const images = req.files?.images;

      // Parse JSON strings into objects
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      const parsedPricing = typeof pricing === 'string' ? JSON.parse(pricing) : pricing;
      const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
      const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
      const parsedRules = typeof rules === 'string' ? JSON.parse(rules) : rules;

      // Validate required fields
      if (!name || !description || !capacity || !parsedLocation || !parsedPricing || !images) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: "Missing required fields",
          description: ResponseDescription.VALIDATION_ERROR,
          data: null
        });
      }

      // Upload images to Cloudinary
      const uploadedUrls = await Promise.all(
        images.map((image: any) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "banquet-halls",
                use_filename: true,
                unique_filename: true,
              },
              (error: any, result: any) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.write(image.buffer);
            stream.end();
          })
        )
      );

      // Create banquet hall with parsed data
      const banquetHall = await BanquetHall.create({
        name,
        description,
        images: uploadedUrls,
        capacity: Number(capacity), // Convert to number
        location: parsedLocation,
        amenities: parsedAmenities || [],
        pricing: {
          ...parsedPricing,
          basePrice: Number(parsedPricing.basePrice), // Convert to number
          cleaningFee: parsedPricing.cleaningFee ? Number(parsedPricing.cleaningFee) : undefined,
          securityDeposit: parsedPricing.securityDeposit ? Number(parsedPricing.securityDeposit) : undefined
        },
        availability: parsedAvailability || {},
        rules: parsedRules || []
      });

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: banquetHall
      };

      return res.status(ResponseCode.CREATED).json(response);
    } catch (error) {
      console.error("Error in create banquet hall:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  // Get all banquet halls
  public async getAll(req: Request, res: Response): Promise<any> {
    try {
      const banquetHalls = await BanquetHall.find({ isActive: true });

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: banquetHalls
      };

      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      console.error("Error in get all banquet halls:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  // Update banquet hall
  public async update(req: any, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const images = req.files?.images;

      const banquetHall = await BanquetHall.findById(id);
      if (!banquetHall) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.NOT_FOUND,
          message: ResponseMessage.NOT_FOUND,
          description: ResponseDescription.NOT_FOUND,
          data: null
        });
      }

      // Upload new images if provided
      if (images && images.length > 0) {
        const uploadedUrls = await Promise.all(
          images.map((image: any) =>
            new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                {
                  folder: "banquet-halls",
                  use_filename: true,
                  unique_filename: true,
                },
                (error: any, result: any) => {
                  if (error) reject(error);
                  else resolve(result.secure_url);
                }
              );
              stream.write(image.buffer);
              stream.end();
            })
          )
        );
        updateData.images = uploadedUrls;
      }

      const updatedBanquetHall = await BanquetHall.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.UPDATED,
        description: ResponseDescription.UPDATED,
        data: updatedBanquetHall
      };

      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      console.error("Error in update banquet hall:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  // Delete banquet hall (soft delete)
  public async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      const banquetHall = await BanquetHall.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!banquetHall) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.NOT_FOUND,
          message: ResponseMessage.NOT_FOUND,
          description: ResponseDescription.NOT_FOUND,
          data: null
        });
      }

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.DELETED,
        description: ResponseDescription.DELETED,
        data: null
      };

      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      console.error("Error in delete banquet hall:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }
}

export default BanquetHallController.getInstance();
