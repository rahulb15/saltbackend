// controllers/eventCategory.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import cloudinary from '../../config/cloudinary.config';
import { IResponseHandler } from '../../interfaces/response-handler.interface';
import BanquetHall from '../../models/banquetHall.model';
import EventCategory, { IEventCategory } from '../../models/eventCategory.model';

import { ResponseStatus, ResponseMessage, ResponseCode,ResponseDescription } from "../../enum/response-message.enum";




export class EventCategoryController {
  private static instance: EventCategoryController;

  public static getInstance(): EventCategoryController {
    if (!EventCategoryController.instance) {
      EventCategoryController.instance = new EventCategoryController();
    }
    return EventCategoryController.instance;
  }

  // Create a new event category
  public async create(req: any, res: Response): Promise<any> {
    try {
      const { name, description } = req.body;
      const bannerImage = req.files?.banner?.[0];

      // Validate required fields
      if (!name || !description) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: "Name and description are required",
          description: ResponseDescription.VALIDATION_ERROR,
          data: null
        });
      }

      // Check if category with same name already exists
      const existingCategory = await EventCategory.findOne({ name });
      if (existingCategory) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: "Category with this name already exists",
          description: ResponseDescription.VALIDATION_ERROR,
          data: null
        });
      }

      let bannerUrl = undefined;
      if (bannerImage) {
        const bannerResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "event-categories",
              use_filename: true,
              unique_filename: true,
            },
            (error:any, result:any) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.write(bannerImage.buffer);
          stream.end();
        });
        bannerUrl = bannerResult.secure_url;
      }

      const category = await EventCategory.create({
        name,
        description,
        banner: bannerUrl,
        eventTypes: [],
        slug: name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
      });

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: category
      };

      return res.status(ResponseCode.CREATED).json(response);
    } catch (error) {
      console.error("Error in create category:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  // Add a new event type to a category
  // public async addEventType(req: any, res: Response): Promise<any> {
  //   try {
  //     const { categoryId } = req.params;
  //     const { 
  //       name, 
  //       description, 
  //       banquetHallIds,
  //       amenities,
  //       maxCapacity,
  //       priceRange 
  //     } = req.body;
  //     const images = req.files?.images;

  //     // Validate required fields
  //     if (!name || !description || !banquetHallIds || !images) {
  //       return res.status(ResponseCode.BAD_REQUEST).json({
  //         status: ResponseStatus.FAILED,
  //         message: "Name, description, banquetHallIds, and images are required",
  //         description: ResponseDescription.VALIDATION_ERROR,
  //         data: null
  //       });
  //     }

  //     // Validate banquet halls exist and are active
  //     const banquetHalls = await BanquetHall.find({
  //       _id: { $in: banquetHallIds },
  //       isActive: true
  //     });

  //     if (banquetHalls.length !== banquetHallIds.length) {
  //       return res.status(ResponseCode.BAD_REQUEST).json({
  //         status: ResponseStatus.FAILED,
  //         message: "One or more banquet halls not found or inactive",
  //         description: ResponseDescription.VALIDATION_ERROR,
  //         data: null
  //       });
  //     }

  //     const category = await EventCategory.findById(categoryId);
  //     if (!category) {
  //       return res.status(ResponseCode.NOT_FOUND).json({
  //         status: ResponseStatus.NOT_FOUND,
  //         message: ResponseMessage.NOT_FOUND,
  //         description: ResponseDescription.NOT_FOUND,
  //         data: null
  //       });
  //     }

  //     // Check if event type with same name exists in category
  //     const eventTypeExists = category.eventTypes.some(et => et.name === name);
  //     if (eventTypeExists) {
  //       return res.status(ResponseCode.BAD_REQUEST).json({
  //         status: ResponseStatus.FAILED,
  //         message: "Event type with this name already exists in the category",
  //         description: ResponseDescription.VALIDATION_ERROR,
  //         data: null
  //       });
  //     }

  //     // Upload all images to Cloudinary
  //     const uploadedUrls = await Promise.all(
  //       images.map((image: any) => 
  //         new Promise((resolve, reject) => {
  //           const stream = cloudinary.uploader.upload_stream(
  //             {
  //               folder: "event-types",
  //               use_filename: true,
  //               unique_filename: true,
  //             },
  //             (error:any, result: any) => {
  //               if (error) reject(error);
  //               else resolve(result.secure_url);
  //             }
  //           );
  //           stream.write(image.buffer);
  //           stream.end();
  //         })
  //       )
  //     );

  //     // Create new event type
  //     const eventType:any = {
  //       name,
  //       description,
  //       images: uploadedUrls,
  //       slug: name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
  //       banquetHalls: banquetHallIds,
  //       amenities: amenities || [],
  //       maxCapacity: maxCapacity || undefined,
  //       priceRange: priceRange || undefined
  //     };

  //     category.eventTypes.push(eventType);
  //     await category.save();

  //     // Populate banquet hall details for response
  //     const populatedCategory = await EventCategory.findById(categoryId)
  //       .populate('eventTypes.banquetHalls');

  //     const response: IResponseHandler = {
  //       status: ResponseStatus.SUCCESS,
  //       message: ResponseMessage.CREATED,
  //       description: ResponseDescription.CREATED,
  //       data: populatedCategory?.eventTypes.slice(-1)[0]
  //     };

  //     return res.status(ResponseCode.CREATED).json(response);
  //   } catch (error) {
  //     console.error("Error in add event type:", error);
  //     return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
  //       status: ResponseStatus.INTERNAL_SERVER_ERROR,
  //       message: ResponseMessage.FAILED,
  //       description: ResponseDescription.INTERNAL_SERVER_ERROR,
  //       data: null
  //     });
  //   }
  // }

  public async addEventType(req: any, res: Response): Promise<any> {
    try {
      const { categoryId } = req.params;
      const { 
        name, 
        description, 
        banquetHallIds, // This is coming as a string array
        amenities,
        maxCapacity,
        priceRange 
      } = req.body;
      const images = req.files?.images;

      // Parse the banquetHallIds if it's a string
      const parsedBanquetHallIds = typeof banquetHallIds === 'string' 
        ? JSON.parse(banquetHallIds)
        : banquetHallIds;

      // Parse priceRange if it's a string
      const parsedPriceRange = typeof priceRange === 'string'
        ? JSON.parse(priceRange)
        : priceRange;

      // Parse amenities if it's a string
      const parsedAmenities = typeof amenities === 'string'
        ? JSON.parse(amenities)
        : amenities;

      // Validate required fields
      if (!name || !description || !parsedBanquetHallIds || !images) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: "Name, description, banquetHallIds, and images are required",
          description: ResponseDescription.VALIDATION_ERROR,
          data: null
        });
      }

      // Validate banquet halls exist and are active
      const banquetHalls = await BanquetHall.find({
        _id: { $in: parsedBanquetHallIds },
        isActive: true
      });

      if (banquetHalls.length !== parsedBanquetHallIds.length) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: "One or more banquet halls not found or inactive",
          description: ResponseDescription.VALIDATION_ERROR,
          data: null
        });
      }

      const category = await EventCategory.findById(categoryId);
      if (!category) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.NOT_FOUND,
          message: ResponseMessage.NOT_FOUND,
          description: ResponseDescription.NOT_FOUND,
          data: null
        });
      }

      // Check if event type with same name exists in category
      const eventTypeExists = category.eventTypes.some(et => et.name === name);
      if (eventTypeExists) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: "Event type with this name already exists in the category",
          description: ResponseDescription.VALIDATION_ERROR,
          data: null
        });
      }

      // Upload all images to Cloudinary
      const uploadedUrls = await Promise.all(
        images.map((image: any) => 
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "event-types",
                use_filename: true,
                unique_filename: true,
              },
              (error:any, result: any) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.write(image.buffer);
            stream.end();
          })
        )
      );

      // Create new event type
      const eventType:any = {
        name,
        description,
        images: uploadedUrls,
        slug: name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
        banquetHalls: parsedBanquetHallIds, // Use the parsed array here
        amenities: parsedAmenities || [],
        maxCapacity: maxCapacity || undefined,
        priceRange: parsedPriceRange || undefined
      };

      category.eventTypes.push(eventType);
      await category.save();

      // Populate banquet hall details for response
      const populatedCategory = await EventCategory.findById(categoryId)
        .populate('eventTypes.banquetHalls');

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: populatedCategory?.eventTypes.slice(-1)[0]
      };

      return res.status(ResponseCode.CREATED).json(response);
    } catch (error) {
      console.error("Error in add event type:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  // Get all event categories with their event types
  public async getAll(req: Request, res: Response): Promise<any> {
    try {
      const categories = await EventCategory.find({ isActive: true })
        .populate({
          path: 'eventTypes.banquetHalls',
          match: { isActive: true }
        })
        .sort({ createdAt: -1 });

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: categories
      };

      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      console.error("Error in getAll categories:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  // Get a single category by slug
  public async getBySlug(req: Request, res: Response): Promise<any> {
    try {
      const { slug } = req.params;
      const category = await EventCategory.findOne({ 
        slug,
        isActive: true 
      }).populate({
        path: 'eventTypes.banquetHalls',
        match: { isActive: true }
      });

      if (!category) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.NOT_FOUND,
          message: ResponseMessage.NOT_FOUND,
          description: ResponseDescription.NOT_FOUND,
          data: null
        });
      }

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: category
      };

      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      console.error("Error in getBySlug category:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  // Update category details
  public async updateCategory(req: any, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const bannerImage = req.files?.banner?.[0];

      const category = await EventCategory.findById(id);
      if (!category) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.NOT_FOUND,
          message: ResponseMessage.NOT_FOUND,
          description: ResponseDescription.NOT_FOUND,
          data: null
        });
      }

      // Check if new name conflicts with existing category
      if (name && name !== category.name) {
        const existingCategory = await EventCategory.findOne({ name });
        if (existingCategory) {
          return res.status(ResponseCode.BAD_REQUEST).json({
            status: ResponseStatus.FAILED,
            message: "Category with this name already exists",
            description: ResponseDescription.VALIDATION_ERROR,
            data: null
          });
        }
      }

      // Upload new banner if provided
      let bannerUrl = category.banner;
      if (bannerImage) {
        const bannerResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "event-categories",
              use_filename: true,
              unique_filename: true,
            },
            (error:any, result:any) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.write(bannerImage.buffer);
          stream.end();
        });
        bannerUrl = bannerResult.secure_url;
      }

      // Update category
      const updatedCategory = await EventCategory.findByIdAndUpdate(
        id,
        {
          name: name || category.name,
          description: description || category.description,
          banner: bannerUrl,
          slug: name ? name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-') : category.slug
        },
        { new: true }
      ).populate('eventTypes.banquetHalls');

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.UPDATED,
        description: ResponseDescription.UPDATED,
        data: updatedCategory
      };

      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      console.error("Error in update category:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }

  // Update event type within a category
  public async updateEventType(req: any, res: Response): Promise<any> {
    try {
      const { categoryId, eventTypeId } = req.params;
      const { 
        name, 
        description,
        banquetHallIds,
        amenities,
        maxCapacity,
        priceRange
      } = req.body;
      const images = req.files?.images;

      // Validate banquet halls if IDs are provided
      if (banquetHallIds) {
        const banquetHalls = await BanquetHall.find({
          _id: { $in: banquetHallIds },
          isActive: true
        });

        if (banquetHalls.length !== banquetHallIds.length) {
          return res.status(ResponseCode.BAD_REQUEST).json({
            status: ResponseStatus.FAILED,
            message: "One or more banquet halls not found or inactive",
            description: ResponseDescription.VALIDATION_ERROR,
            data: null
          });
        }
      }

      const category:any = await EventCategory.findById(categoryId);
      if (!category) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.NOT_FOUND,
          message: "Category not found",
          description: ResponseDescription.NOT_FOUND,
          data: null
        });
      }

      const eventType = category.eventTypes.id(eventTypeId);
      if (!eventType) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.NOT_FOUND,
          message: "Event type not found",
          description: ResponseDescription.NOT_FOUND,
          data: null
        });
      }

      // Check if new name conflicts with existing event type
      if (name && name !== eventType.name) {
        const eventTypeExists = category.eventTypes.some(
          (et:any) => et.name === name && et._id.toString() !== eventTypeId
        );
        if (eventTypeExists) {
          return res.status(ResponseCode.BAD_REQUEST).json({
            status: ResponseStatus.FAILED,
            message: "Event type with this name already exists in the category",
            description: ResponseDescription.VALIDATION_ERROR,
            data: null
          });
        }
      }

      // Update basic info
      if (name) {
        eventType.name = name;
        eventType.slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
      }
      if (description) eventType.description = description;
      if (banquetHallIds) eventType.banquetHalls = banquetHallIds;
      if (amenities) eventType.amenities = amenities;
      if (maxCapacity !== undefined) eventType.maxCapacity = maxCapacity;
      if (priceRange) eventType.priceRange = priceRange;

      // Upload and update images if provided
      if (images && images.length > 0) {
        const uploadedUrls = await Promise.all(
          images.map((image: any) => 
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  {
                    folder: "event-types",
                    use_filename: true,
                    unique_filename: true,
                  },
                  (error:any, result: any) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                  }
                );
                stream.write(image.buffer);
                stream.end();
              })
            )
          );
          eventType.images = uploadedUrls;
        }
  
        await category.save();
  
        // Populate banquet hall details for response
        const updatedCategory:any = await EventCategory.findById(categoryId)
          .populate('eventTypes.banquetHalls');
        const updatedEventType = updatedCategory?.eventTypes.id(eventTypeId);
  
        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.UPDATED,
          description: ResponseDescription.UPDATED,
          data: updatedEventType
        };
  
        return res.status(ResponseCode.SUCCESS).json(response);
      } catch (error) {
        console.error("Error in update event type:", error);
        return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
          status: ResponseStatus.INTERNAL_SERVER_ERROR,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.INTERNAL_SERVER_ERROR,
          data: null
        });
      }
    }
  
    // Delete an event type from a category
    public async deleteEventType(req: Request, res: Response): Promise<any> {
      try {
        const { categoryId, eventTypeId } = req.params;
  
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(eventTypeId)) {
          return res.status(ResponseCode.BAD_REQUEST).json({
            status: ResponseStatus.FAILED,
            message: "Invalid ID format",
            description: ResponseDescription.VALIDATION_ERROR,
            data: null
          });
        }
  
        const category = await EventCategory.findById(categoryId);
        if (!category) {
          return res.status(ResponseCode.NOT_FOUND).json({
            status: ResponseStatus.NOT_FOUND,
            message: "Category not found",
            description: ResponseDescription.NOT_FOUND,
            data: null
          });
        }
  
        const eventTypeIndex = category.eventTypes.findIndex(
          et => et._id.toString() === eventTypeId
        );
  
        if (eventTypeIndex === -1) {
          return res.status(ResponseCode.NOT_FOUND).json({
            status: ResponseStatus.NOT_FOUND,
            message: "Event type not found",
            description: ResponseDescription.NOT_FOUND,
            data: null
          });
        }
  
        // Remove the event type
        category.eventTypes.splice(eventTypeIndex, 1);
        await category.save();
  
        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.DELETED,
          description: ResponseDescription.DELETED,
          data: null
        };
  
        return res.status(ResponseCode.SUCCESS).json(response);
      } catch (error) {
        console.error("Error in delete event type:", error);
        return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
          status: ResponseStatus.INTERNAL_SERVER_ERROR,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.INTERNAL_SERVER_ERROR,
          data: null
        });
      }
    }
  
    // Delete an entire category
    public async deleteCategory(req: Request, res: Response): Promise<any> {
      try {
        const { id } = req.params;
  
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(ResponseCode.BAD_REQUEST).json({
            status: ResponseStatus.FAILED,
            message: "Invalid ID format",
            description: ResponseDescription.VALIDATION_ERROR,
            data: null
          });
        }
  
        // Soft delete by setting isActive to false
        const category = await EventCategory.findByIdAndUpdate(
          id,
          { isActive: false },
          { new: true }
        );
  
        if (!category) {
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
        console.error("Error in delete category:", error);
        return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
          status: ResponseStatus.INTERNAL_SERVER_ERROR,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.INTERNAL_SERVER_ERROR,
          data: null
        });
      }
    }
  
    // Get event types by banquet hall
    public async getEventTypesByBanquetHall(req: Request, res: Response): Promise<any> {
      try {
        const { banquetHallId } = req.params;
  
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(banquetHallId)) {
          return res.status(ResponseCode.BAD_REQUEST).json({
            status: ResponseStatus.FAILED,
            message: "Invalid ID format",
            description: ResponseDescription.VALIDATION_ERROR,
            data: null
          });
        }
  
        // Find all categories with event types that include this banquet hall
        const categories = await EventCategory.find({
          isActive: true,
          'eventTypes.banquetHalls': banquetHallId
        }).populate('eventTypes.banquetHalls');
  
        // Extract matching event types
        const eventTypes = categories.reduce((acc: any[], category) => {
          const matchingEventTypes = category.eventTypes.filter(et =>
            et.banquetHalls.some((bh: any) => bh._id.toString() === banquetHallId)
          );
          return [...acc, ...matchingEventTypes];
        }, []);
  
        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: eventTypes
        };
  
        return res.status(ResponseCode.SUCCESS).json(response);
      } catch (error) {
        console.error("Error in get event types by banquet hall:", error);
        return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
          status: ResponseStatus.INTERNAL_SERVER_ERROR,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.INTERNAL_SERVER_ERROR,
          data: null
        });
      }
    }
  
    // Search event types across all categories
    public async searchEventTypes(req: Request, res: Response): Promise<any> {
      try {
        const { query } = req.query;
  
        if (!query) {
          return res.status(ResponseCode.BAD_REQUEST).json({
            status: ResponseStatus.FAILED,
            message: "Search query is required",
            description: ResponseDescription.VALIDATION_ERROR,
            data: null
          });
        }
  
        const categories = await EventCategory.find({
          isActive: true,
          $or: [
            { 'eventTypes.name': { $regex: query, $options: 'i' } },
            { 'eventTypes.description': { $regex: query, $options: 'i' } }
          ]
        }).populate('eventTypes.banquetHalls');
  
        // Extract matching event types
        const eventTypes = categories.reduce((acc: any[], category) => {
          const matchingEventTypes = category.eventTypes.filter((et:any) =>
            et.name.toLowerCase().includes(query.toString().toLowerCase()) ||
            et.description.toLowerCase().includes(query.toString().toLowerCase())
          );
          return [...acc, ...matchingEventTypes];
        }, []);
  
        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: eventTypes
        };
  
        return res.status(ResponseCode.SUCCESS).json(response);
      } catch (error) {
        console.error("Error in search event types:", error);
        return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
          status: ResponseStatus.INTERNAL_SERVER_ERROR,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.INTERNAL_SERVER_ERROR,
          data: null
        });
      }
    }
  }
  
  export default EventCategoryController.getInstance();