// services/otp.service.ts
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import OTP from '../models/otp.model';
import { createLogger } from '../utils/logger';
import { IOTP } from '../interfaces/otp.interface';

const logger = createLogger('OTPService');

class OTPService {
  private static instance: OTPService;
  private snsClient: SNSClient;
  private readonly OTP_EXPIRY_MINUTES = 5;

  private constructor() {
    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }

  public static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
    }
    return OTPService.instance;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      
      const params = {
        Message: message,
        PhoneNumber: formattedPhone
      };

      const command = new PublishCommand(params);
      const response = await this.snsClient.send(command);

      logger.info('OTP SMS sent successfully', {
        messageId: response.MessageId,
        phoneNumber: formattedPhone
      });

      return true;
    } catch (error) {
      logger.error('Failed to send OTP SMS', {
        error,
        phoneNumber,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  public async generateAndSendOTP(phone: string): Promise<boolean> {
    try {
      // Delete any existing unverified OTPs for this phone
      await OTP.deleteMany({ phone, verified: false });

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      const otpDoc = new OTP({
        phone,
        otp,
        expiresAt
      });

      await otpDoc.save();

      const message = `Your OTP for booking verification is: ${otp}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`;
      
      return await this.sendSMS(phone, message);
    } catch (error) {
      logger.error('Error in generateAndSendOTP', {
        error,
        phone,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }


  public async verifyOTP(phone: string, otp: string): Promise<boolean> {
    try {
      console.log('Verifying OTP:', { phone, otp });
  
      // First find the OTP document without checking verified status
      const otpDoc = await OTP.findOne({
        phone,
        otp,
        expiresAt: { $gt: new Date() }
      }).exec();
  
      console.log('Found OTP document:', otpDoc);
  
      // If no valid OTP found
      if (!otpDoc) {
        console.log('No valid OTP found');
        return false;
      }
  
      // If OTP is already verified, return true
      if (otpDoc.verified) {
        console.log('OTP already verified');
        return true;
      }
  
      try {
        // Mark OTP as verified
        otpDoc.verified = true;
        await otpDoc.save();
        console.log('OTP marked as verified successfully');
        return true;
      } catch (saveError) {
        console.error('Error saving OTP status:', saveError);
        return false;
      }
    } catch (error) {
      console.error('Error in verifyOTP:', error);
      return false;
    }
  }
  
}

export default OTPService.getInstance();


// import OTP from '../models/otp.model';
// import { createLogger } from '../utils/logger';
// import axios from 'axios';
// import { IOTP } from '../interfaces/otp.interface';

// const logger = createLogger('OTPService');

// class OTPService {
//   private static instance: OTPService;
//   private readonly OTP_EXPIRY_MINUTES = 5;
//   private readonly FAST2SMS_API_KEY = '8VYT5zNlbgAC0JM19qSeZDvWjIuQXLPh4EfiHOnwaUxocGyt6k8gISwrL1CYBxbdN7cuWf5UF4iJq2Oj';

//   private constructor() {
//     logger.info('OTPService initialized');
//   }

//   public static getInstance(): OTPService {
//     if (!OTPService.instance) {
//       OTPService.instance = new OTPService();
//     }
//     return OTPService.instance;
//   }

//   private generateOTP(): string {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   }

//   private async sendSMS(phoneNumber: string, otp: string): Promise<boolean> {
//     try {
//       // Clean the phone number
//       const cleanPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
      
//       logger.info('Sending OTP SMS', { phoneNumber: cleanPhone });

//       const response = await axios({
//         method: 'POST',
//         url: 'https://www.fast2sms.com/dev/bulkV2',
//         headers: {
//           'authorization': '8VYT5zNlbgAC0JM19qSeZDvWjIuQXLPh4EfiHOnwaUxocGyt6k8gISwrL1CYBxbdN7cuWf5UF4iJq2Oj'
//         },
//         data: {
//           route: 'otp',
//           variables_values: otp,
//           numbers: cleanPhone
//         }
//       });

//       logger.info('Fast2SMS Response:', response.data);

//       if (response.data.return === true) {
//         return true;
//       }
      
//       throw new Error(response.data.message || 'Failed to send SMS');
//     } catch (error: any) {
//       logger.error('SMS sending failed', {
//         error: {
//           message: error.message,
//           response: error.response?.data
//         }
//       });
//       return false;
//     }
//   }

//   public async generateAndSendOTP(phone: string): Promise<boolean> {
//     try {
//       await OTP.deleteMany({ phone, verified: false });

//       const otp = this.generateOTP();
//       const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

//       const otpDoc = new OTP({
//         phone,
//         otp,
//         expiresAt
//       });

//       await otpDoc.save();
      
//       const smsSent = await this.sendSMS(phone, otp);
      
//       if (!smsSent) {
//         await otpDoc.deleteOne();
//         return false;
//       }
      
//       return true;
//     } catch (error) {
//       logger.error('Error in generateAndSendOTP', { error });
//       return false;
//     }
//   }

//   public async verifyOTP(phone: string, otp: string): Promise<boolean> {
//     try {
//       const otpDoc = await OTP.findOne({
//         phone,
//         otp,
//         expiresAt: { $gt: new Date() }
//       }).exec();

//       if (!otpDoc) {
//         return false;
//       }

//       if (otpDoc.verified) {
//         return true;
//       }

//       otpDoc.verified = true;
//       await otpDoc.save();
//       return true;
//     } catch (error) {
//       logger.error('Error in verifyOTP', { error });
//       return false;
//     }
//   }
// }

// export default OTPService.getInstance();