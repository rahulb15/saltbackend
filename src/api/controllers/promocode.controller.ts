
// controllers/promocode.controller.ts
import { Request, Response } from "express";
import promocodeManager from "../../services/promocode.manager";
import { ResponseStatus, ResponseMessage, ResponseCode, ResponseDescription } from "../../enum/response-message.enum";
import { IResponseHandler } from "../../interfaces/response-handler.interface";

export class PromocodeController {
    public async create(req: any, res: Response) {
        try {
            const promocode = {
                ...req.body,
                createdBy: req.user._id,
                updatedBy: req.user._id
            };

            const newPromocode = await promocodeManager.create(promocode);
            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.CREATED,
                description: ResponseDescription.PROMOCODE_CREATED,
                data: newPromocode
            };

            res.status(ResponseCode.CREATED).json(response);
        } catch (error) {
            console.error('Error in create promocode:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: "Promocode creation failed",
                data: null
            });
        }
    }

    public async getAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const roomType = req.query.roomType as string;
            const sortField = req.query.sortField as string || 'createdAt';
            const sortOrder = req.query.sortOrder as string || 'desc';

            const filters: any = {};
            if (search) {
                filters.code = { $regex: search, $options: 'i' };
            }
            if (roomType) {
                filters.roomType = roomType;
            }

            const { promocodes, total } = await promocodeManager.getAll(
                filters,
                page,
                limit,
                sortField,
                sortOrder
            );

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.PROMOCODES_FETCHED,
                data: {
                    promocodes,
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
            console.error('Error in getAll promocodes:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: "Failed to fetch promocodes",
                data: null
            });
        }
    }

    public async validatePromocode(req: Request, res: Response) {
        try {
            const { code, roomType, bookingAmount } = req.body;

            const result = await promocodeManager.validatePromocode(
                code,
                roomType,
                bookingAmount
            );

            const response: IResponseHandler = {
                status: result.valid ? ResponseStatus.SUCCESS : ResponseStatus.FAILED,
                message: result.valid ? ResponseMessage.SUCCESS : ResponseMessage.FAILED,
                description: ResponseDescription.PROMOCODE_VALIDATION_FAILED,
                data: result.valid ? { discountAmount: result.discountAmount } : null
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in validate promocode:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: "Failed to validate promocode",
                data: null
            });
        }
    }
    public async update(req: any, res: Response) {
        try {
            const id = req.params.id;
            const promocode = {
                ...req.body,
                updatedBy: req.user._id
            };

            const updatedPromocode = await promocodeManager.update(id, promocode);

            if (!updatedPromocode) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: "Promocode not found",
                    data: null
                });
            }

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.UPDATED,
                description: ResponseDescription.PROMOCODE_UPDATED,
                data: updatedPromocode
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in update promocode:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: "Failed to update promocode",
                data: null
            });
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const deletedPromocode = await promocodeManager.delete(id);

            if (!deletedPromocode) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.NOT_FOUND,
                    description: "Promocode not found",
                    data: null
                });
            }

            const response: IResponseHandler = {
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.DELETED,
                description: ResponseDescription.PROMOCODE_DELETED,
                data: deletedPromocode
            };

            res.status(ResponseCode.SUCCESS).json(response);
        } catch (error) {
            console.error('Error in delete promocode:', error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                description: "Failed to delete promocode",
                data: null
            });
        }
    }





}

export default new PromocodeController();