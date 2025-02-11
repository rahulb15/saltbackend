// services/notification.service.ts
import { IBooking } from '../interfaces/booking/booking.interface';
import { sendBookingConfirmationMail } from '../mail/bookingConfirmation.mail';
import bookingSMSService from './bookingSMS.service';
import { createLogger } from '../utils/logger';

const logger = createLogger('NotificationService');

class NotificationService {
    async sendBookingNotifications(booking: IBooking): Promise<void> {
        const notificationPromises = [];

        // Send email if email exists
        if (booking.guestDetails.email) {
            logger.info('Sending booking confirmation email', {
                bookingNumber: booking.bookingNumber,
                email: booking.guestDetails.email
            });

            notificationPromises.push(
                sendBookingConfirmationMail(booking)
                    .catch(error => {
                        logger.error('Failed to send confirmation email', {
                            error,
                            bookingNumber: booking.bookingNumber,
                            email: booking.guestDetails.email
                        });
                    })
            );
        }

        // Send SMS if phone exists
        if (booking.guestDetails.phone) {
            logger.info('Sending booking confirmation SMS', {
                bookingNumber: booking.bookingNumber,
                phone: booking.guestDetails.phone
            });

            notificationPromises.push(
                bookingSMSService.sendBookingConfirmation(booking)
                    .catch(error => {
                        logger.error('Failed to send confirmation SMS', {
                            error,
                            bookingNumber: booking.bookingNumber,
                            phone: booking.guestDetails.phone
                        });
                    })
            );
        }

        await Promise.all(notificationPromises);
    }
}

export const notificationService = new NotificationService();