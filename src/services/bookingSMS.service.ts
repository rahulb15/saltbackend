// services/bookingSMS.service.ts
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { IBooking } from '../interfaces/booking/booking.interface';
import { createLogger } from '../utils/logger';

const logger = createLogger('BookingSMSService');

class BookingSMSService {
    private static instance: BookingSMSService;
    private snsClient: SNSClient;

    private constructor() {
        this.snsClient = new SNSClient({
            region: process.env.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        });
    }

    public static getInstance(): BookingSMSService {
        if (!BookingSMSService.instance) {
            BookingSMSService.instance = new BookingSMSService();
        }
        return BookingSMSService.instance;
    }

    private formatDate(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    private async sendSMS(phoneNumber: string, message: string, retryCount = 0): Promise<boolean> {
        try {
            // Simple format for phone number - just add +91 if not present
            const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;

            const params = {
                Message: message,
                PhoneNumber: formattedPhone
            };

            const command = new PublishCommand(params);
            const response = await this.snsClient.send(command);

            logger.info('SMS sent successfully', {
                messageId: response.MessageId,
                phoneNumber: formattedPhone,
                retryCount
            });

            return true;
        } catch (error) {
            logger.error('Failed to send SMS', { 
                error, 
                phoneNumber, 
                retryCount,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            });

            if (retryCount < 2) {
                const backoffDelay = Math.pow(2, retryCount) * 1000;
                logger.info(`Retrying SMS after ${backoffDelay}ms delay`, { retryCount });
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                return this.sendSMS(phoneNumber, message, retryCount + 1);
            }

            return false;
        }
    }

    public async sendBookingConfirmation(booking: IBooking): Promise<boolean> {
        try {
            if (!booking.guestDetails.phone) {
                logger.warn('No phone number provided for booking confirmation', {
                    bookingNumber: booking.bookingNumber
                });
                return false;
            }

            const message = `Your booking is confirmed!
Booking #: ${booking.bookingNumber}
Guest: ${booking.guestDetails.title} ${booking.guestDetails.firstName} ${booking.guestDetails.lastName}
Check-in: ${this.formatDate(booking.checkIn)}
Check-out: ${this.formatDate(booking.checkOut)}
Room: ${booking.roomDetails.roomName}
Amount: INR ${booking.pricing.totalAmount.toFixed(2)}
${booking.pricing.isCouponApplied ? `\nDiscount Applied: ${booking.pricing.promotionCode}` : ''}

Need help? Contact our support team.`;

            logger.info('Preparing to send booking confirmation SMS', {
                bookingNumber: booking.bookingNumber,
                phone: booking.guestDetails.phone,
                messageLength: message.length
            });

            const success = await this.sendSMS(booking.guestDetails.phone, message);

            if (success) {
                logger.info('Booking confirmation SMS sent successfully', {
                    bookingNumber: booking.bookingNumber,
                    phone: booking.guestDetails.phone
                });
            }

            return success;
        } catch (error) {
            logger.error('Error in sendBookingConfirmation', {
                error,
                bookingNumber: booking.bookingNumber,
                phone: booking.guestDetails.phone,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    }
}

const bookingSMSService = BookingSMSService.getInstance();
export default bookingSMSService;