// controllers/otp.controller.ts
import { Request, Response } from 'express';
// import OTPService from '../services/otp.service';
import otpService from '../../services/otp.service';
import { createLogger } from '../../utils/logger';
import { ResponseStatus, ResponseMessage, ResponseCode,ResponseDescription } from "../../enum/response-message.enum";


const logger = createLogger('OTPController');

export class OTPController {
  public async sendOTP(req: Request, res: Response) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: 'Phone number is required'
        });
      }

      const success = await otpService.generateAndSendOTP(phone);

      if (!success) {
        return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
          status: ResponseStatus.FAILED,
          message: 'Failed to send OTP'
        });
      }

      res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      logger.error('Error in sendOTP', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.FAILED,
        message: ResponseMessage.INTERNAL_SERVER_ERROR
      });
    }
  }

  public async verifyOTP(req: Request, res: Response) {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: 'Phone number and OTP are required'
        });
      }

      const isValid = await otpService.verifyOTP(phone, otp);

      if (!isValid) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: 'Invalid or expired OTP'
        });
      }

      res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: 'OTP verified successfully'
      });
    } catch (error) {
      logger.error('Error in verifyOTP', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.FAILED,
        message: ResponseMessage.INTERNAL_SERVER_ERROR
      });
    }
  }
}

export default new OTPController();