// controllers/payment.controller.ts
import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Transaction from "../../models/transaction.model";
// import Booking from "../models/booking.model";
import Booking from "../../models/booking.model";
import { ResponseStatus, ResponseMessage, ResponseCode  } from "../../enum/response-message.enum";
import bookingManager from "../../services/booking.manager";
import { notificationService } from "../../services/notification.service";
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string
});

export class PaymentController {
    public async createOrder(req: any, res: Response) {
        try {
            const { bookingId, amount } = req.body;
            console.log("bookingId00000000000", bookingId);
            console.log("amount000000000000", amount);

            // Validate booking
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: "Booking not found"
                });
            }

            console.log("booking0000000000000000", booking);

            // Create Razorpay order
            const order = await razorpay.orders.create({
                amount: (parseInt(amount) as any) * 100, 
                currency: "INR",
                receipt: `booking_${bookingId}`,
                notes: {
                    bookingId: bookingId.toString(),
                    userId: req.user?._id?.toString()
                }
            });

            // Create transaction record
            const transaction = await Transaction.create({
                bookingId,
                userId: req.user?._id,
                orderId: order.receipt,
                razorpayOrderId: order.id,
                amount: amount,
                currency: "INR",
                status: "created"
            });

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {
                    orderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    receipt: order.receipt,
                    key: process.env.RAZORPAY_KEY_ID
                }
            });

        } catch (error) {
            console.error("Payment order creation error:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async verifyPayment(req: Request, res: Response) {
        try {
            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;

            // Verify signature
            const generatedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            if (generatedSignature !== razorpay_signature) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: "Invalid payment signature"
                });
            }

            // Update transaction and booking
            const transaction:any = await Transaction.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    razorpayPaymentId: razorpay_payment_id,
                    status: "captured"
                },
                { new: true }
            );

            if (!transaction) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: "Transaction not found"
                });
            }

            // // Update booking payment status
            // await Booking.findByIdAndUpdate(transaction.bookingId, {
            //     "payment.status": "paid",
            //     "payment.transactionId": razorpay_payment_id,
            //     "payment.paidAmount": transaction.amount,
            //     "payment.paymentDate": new Date()
            // });

            // res.status(ResponseCode.SUCCESS).json({
            //     status: ResponseStatus.SUCCESS,
            //     message: "Payment verified successfully",
            //     data: transaction
            // });

              // Update booking status and send notifications
    const booking:any = await bookingManager.confirmPayment(
        transaction.bookingId,
        {
          paymentId: razorpay_payment_id,
          amount: transaction.amount
        }
      );
  
      // Now send notifications since payment is confirmed
// Send notifications
await notificationService.sendBookingNotifications(booking);  
      res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: "Payment verified successfully",
        data: { booking, transaction }
      });



        } catch (error) {
            console.error("Payment verification error:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async handleWebhook(req: Request, res: Response) {
        try {
            const signature = req.headers["x-razorpay-signature"] as string;
            const generatedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET as string)
                .update(JSON.stringify(req.body))
                .digest("hex");

            if (generatedSignature !== signature) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: "Invalid webhook signature"
                });
            }

            const event = req.body;

            if(event?.payload?.order?.entity?.id) {
            console.log("event event event", event);
            const transaction = await Transaction.findOne({
                razorpayOrderId: event.payload.order.entity.id
            });

            if (!transaction) {
                return res.status(ResponseCode.NOT_FOUND).json({
                    status: ResponseStatus.FAILED,
                    message: "Transaction not found"
                });
            }

            // Record webhook event
            transaction.webhookEvents.push({
                eventId: event.id,
                eventType: event.event,
                eventData: event.payload,
                receivedAt: new Date()
            });

            console.log("Webhook event received:", event);
            console.log("event.event", event.event);

            // Handle different event types
            switch (event.event) {
                case "payment.captured":
                    transaction.status = "captured";
                    break;
                case "payment.failed":
                    transaction.status = "failed";
                    transaction.error = {
                        code: event.payload.payment.entity.error_code,
                        description: event.payload.payment.entity.error_description,
                        source: event.payload.payment.entity.error_source,
                        reason: event.payload.payment.entity.error_reason
                    };
                    break;
                case "refund.processed":
                    transaction.status = "refunded";
                    transaction.refund = {
                        refundId: event.payload.refund.entity.id,
                        amount: event.payload.refund.entity.amount / 100,
                        status: event.payload.refund.entity.status,
                        processedAt: new Date()
                    };
                    break;
            }

            await transaction.save();
            res.json({ status: "ok" });
        } else {
            console.log("event event event", event);
            res.json({ status: "ok" });
        }

        } catch (error) {
            console.error("Webhook handling error:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
}

export default new PaymentController();