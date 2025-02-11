// controllers/amenity.controller.ts
import { Request, Response } from "express";
import amenityManager from "../../services/amenity.manager";
import { ResponseStatus,ResponseMessage,ResponseCode,ResponseDescription } from "../../enum/response-message.enum";
import { IResponseHandler } from "../../interfaces/response-handler.interface";

export class AmenityController {
    public async create(req: any, res: Response) {
        try {
            const amenity = {
                ...req.body,
                createdBy: req.user._id,
                updatedBy: req.user._id
            };

            const newAmenity = await amenityManager.create(amenity);
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.CREATED,
                description: ResponseDescription.AMENITY_CREATED,
                data: newAmenity
            };

            res.status(ResponseCode.CREATED).json(response);
        } catch (error) {
            console.error('Error in create amenity:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.AMENITY_NOT_CREATED,
                data: null
            });
        }
    }

    public async getAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const category = req.query.category as string;
            const sortField = req.query.sortField as string || 'name';
            const sortOrder = req.query.sortOrder as string || 'asc';

            const filters: any = {};
            if (search) {
                filters.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            if (category) {
                filters.category = category;
            }

            const { amenities, total } = await amenityManager.getAll(
                filters,
                page,
                limit,
                sortField,
                sortOrder
            );

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.AMENITIES_FETCHED,
                data: {
                    amenities,
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
            console.error('Error in getAll amenities:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.AMENITIES_NOT_FETCHED,
                data: null
            });
        }
    }

    // Add other controller methods (getById, update, etc.)

    //delete
    public async delete(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const amenity = await amenityManager.delete(id);

            if (!amenity) {
                res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: ResponseDescription.AMENITY_NOT_FOUND,
                    data: null
                });
                return;
            }

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.DELETED,
                description: ResponseDescription.AMENITY_DELETED,
                data: amenity
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in delete amenity:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.AMENITY_NOT_DELETED,
                data: null
            });
        }
    }

    //update
    public async update(req: any, res: Response) {
        try {
            const id = req.params.id;
            const amenity = {
                ...req.body,
                updatedBy: req.user._id
            };

            const updatedAmenity = await amenityManager.update(id, amenity);

            if (!updatedAmenity) {
                res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: ResponseDescription.AMENITY_NOT_FOUND,
                    data: null
                });
                return;
            }

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.UPDATED,
                description: ResponseDescription.AMENITY_UPDATED,
                data: updatedAmenity
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in update amenity:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.AMENITY_NOT_UPDATED,
                data: null
            });
        }
    }

    // getById
    public async getById(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const amenity = await amenityManager.getById(id);

            if (!amenity) {
                res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: ResponseDescription.AMENITY_NOT_FOUND,
                    data: null
                });
                return;
            }

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.AMENITY_FETCHED,
                data: amenity
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in get amenity by id:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: ResponseDescription.AMENITY_NOT_FETCHED,
                data: null
            });
        }
    }







}

export default new AmenityController();
