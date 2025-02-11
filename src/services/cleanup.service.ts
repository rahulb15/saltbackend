// // services/cleanup.service.ts
// import { CronJob } from 'cron';
// import Booking from '../models/booking.model';
// import { createLogger } from '../utils/logger';

// const logger = createLogger('CleanupService');

// class CleanupService {
//     private pendingBookingsCleanupJob: CronJob;

//     constructor() {
//         // Run every 5 minutes
//         this.pendingBookingsCleanupJob = new CronJob('*/5 * * * *', this.cleanupPendingBookings);
//     }

//     startCleanupJobs() {
//         this.pendingBookingsCleanupJob.start();
//         logger.info('Cleanup jobs started');
//     }

//     stopCleanupJobs() {
//         this.pendingBookingsCleanupJob.stop();
//         logger.info('Cleanup jobs stopped');
//     }

//     private async cleanupPendingBookings() {
//         try {
//             const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

//             const expiredBookings = await Booking.find({
//                 status: 'pending',
//                 'payment.status': 'pending',
//                 createdAt: { $lt: thirtyMinutesAgo }
//             });

//             logger.info(`Found ${expiredBookings.length} expired pending bookings`);

//             for (const booking of expiredBookings) {
//                 await Booking.findByIdAndUpdate(booking._id, {
//                     status: 'cancelled',
//                     cancellation: {
//                         isCancelled: true,
//                         cancellationDate: new Date(),
//                         cancellationReason: 'Payment window expired'
//                     },
//                     updatedAt: new Date()
//                 });

//                 logger.info('Cancelled expired booking', {
//                     bookingNumber: booking.bookingNumber
//                 });
//             }
//         } catch (error) {
//             logger.error('Error in cleanup job', { error });
//         }
//     }
// }

// export const cleanupService = new CleanupService();



// services/cleanup.service.ts
import { CronJob } from 'cron';
import Booking from '../models/booking.model';
import { createLogger } from '../utils/logger';

const logger = createLogger('CleanupService');

class CleanupService {
    private pendingBookingsCleanupJob: CronJob;

    constructor() {
        // Run every 1 minute
        this.pendingBookingsCleanupJob = new CronJob('*/1 * * * *', () => {
            this.cleanupPendingBookings().catch(error => {
                logger.error('Error in cleanup job', { error });
            });
        });
    }

    startCleanupJobs() {
        this.pendingBookingsCleanupJob.start();
        logger.info('Cleanup jobs started');
    }

    stopCleanupJobs() {
        this.pendingBookingsCleanupJob.stop();
        logger.info('Cleanup jobs stopped');
    }

    async cleanupPendingBookings() {
        try {
            const currentTime = new Date();

            const expiredBookings = await Booking.find({
                status: 'pending',
                'payment.status': 'pending',
                'paymentWindow.expiresAt': { $lt: currentTime }
            });

            logger.info(`Found ${expiredBookings.length} expired pending bookings`, {
                currentTime,
                expiredBookingsCount: expiredBookings.length
            });

            for (const booking of expiredBookings) {
                logger.info('Processing expired booking', {
                    bookingNumber: booking.bookingNumber,
                    expiresAt: booking.paymentWindow?.expiresAt,
                    createdAt: booking.createdAt
                });

                await Booking.findByIdAndUpdate(booking._id, {
                    status: 'cancelled',
                    cancellation: {
                        isCancelled: true,
                        cancellationDate: new Date(),
                        cancellationReason: 'Payment window expired'
                    },
                    'payment.status': 'failed',
                    updatedAt: new Date()
                });

                logger.info('Cancelled expired booking', {
                    bookingNumber: booking.bookingNumber
                });
            }
        } catch (error) {
            logger.error('Error in cleanup job', { error });
            throw error;
        }
    }

    // Method for manual testing
    async manualCleanup() {
        logger.info('Starting manual cleanup');
        await this.cleanupPendingBookings();
        logger.info('Manual cleanup completed');
    }
}

export const cleanupService = new CleanupService();