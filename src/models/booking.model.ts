
// // models/booking.model.ts
// import mongoose from "mongoose";
// import { IBooking } from "../interfaces/booking/booking.interface";

// const bookingSchema = new mongoose.Schema(
//   {
//     bookingNumber: { type: String, required: true, unique: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
//     roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
//     checkIn: { type: Date, required: true },
//     checkOut: { type: Date, required: true },
//     guests: {
//       adults: { type: Number, required: true },
//       children: { type: Number, required: true },
//       childrenAges: [{ type: Number }],
//     },
//     pricing: {
//       basePrice: { type: Number, required: true },
//       taxAmount: { type: Number, required: true },
//       cleaningFee: { type: Number, required: true },
//       totalAmount: { type: Number, required: true },
//       currency: { type: String, required: true, default: "USD" },
//     },
//     payment: {
//       status: {
//         type: String,
//         enum: ["pending", "completed", "failed", "refunded"],
//         default: "pending",
//       },
//       method: String,
//       transactionId: String,
//       paidAmount: Number,
//       paidAt: Date,
//     },
//     status: {
//       type: String,
//       enum: ["confirmed", "cancelled", "completed", "no-show"],
//       default: "confirmed",
//     },
//     specialRequests: String,
//     cancellation: {
//       cancelledAt: Date,
//       reason: String,
//       refundAmount: Number,
//       refundStatus: {
//         type: String,
//         enum: ["pending", "completed", "rejected"],
//       },
//     },
//   },
//   { timestamps: true }
// );

// // Add indexes for common queries
// bookingSchema.index({ bookingNumber: 1 });
// bookingSchema.index({ userId: 1 });
// bookingSchema.index({ hotelId: 1 });
// bookingSchema.index({ status: 1 });
// bookingSchema.index({ checkIn: 1, checkOut: 1 });

// const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
// export default Booking;


// models/booking.model.ts
import mongoose, { Schema } from "mongoose";
import { IBooking } from "../interfaces/booking/booking.interface";

const bookingGuestSchema = new Schema({
    title: String,
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    gender: String,
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    }
}, { _id: false });

const bookingSchema = new Schema({
    // Booking Reference Numbers
    bookingNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    thirdPartyReservationNo: {
        type: String,
        sparse: true,
        unique: true
    },
    subReservationNumbers: [String],

    // Core Relations
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
        index: true
    },
    hotelId: {
        type: Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
        index: true
    },
    hotelCode: {
        type: String,
        required: true
    },
    // roomId: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Room",
    //     required: true
    // },

    roomId: {
      type: String,  // Changed from ObjectId to String
      required: true,
      index: true
  },
    
    roomDetails: {
        roomTypeId: String,
        rateplanId: String,
        ratetypeId: String,
        roomName: String,
        roomType: String
    },
    roomMongoId: {    // Add this new field for MongoDB ObjectId reference if needed
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: false
  },

    // Guest Information
    guestDetails: bookingGuestSchema,
    additionalGuests: [bookingGuestSchema],

    // Stay Information
    checkIn: {
        type: Date,
        required: true,
        index: true
    },
    checkOut: {
        type: Date,
        required: true,
        index: true
    },
    numberOfNights: {
        type: Number,
        required: true
    },
    guests: {
        adults: {
            type: Number,
            required: true
        },
        children: {
            type: Number,
            default: 0
        },
        childrenAges: [Number],
        extraAdults: {
            type: Number,
            default: 0
        },
        extraChildren: {
            type: Number,
            default: 0
        }
    },

    // Pricing Details
    pricing: {
        baseRate: {
            type: Number,
            required: true
        },
        extraAdultRate: Number,
        extraChildRate: Number,
        taxAmount: {
            type: Number,
            required: true
        },
        discountAmount: Number,
        cleaningFee: Number,
        promotionCode: String,
        totalAmount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "INR"
        },
        isCouponApplied: {
            type: Boolean,
            default: false
        },
        promocodeId: {
            type: Schema.Types.ObjectId,
            ref: "PromoCode"
        },
        priceBreakdown: {
            roomCharges: Number,
            taxes: [{
                name: String,
                amount: Number,
                percentage: Number
            }],
            addOns: [{
                name: String,
                amount: Number
            }]
        }
    },

    // Payment Information
    payment: {
        status: {
            type: String,
            enum: ["pending", "partially_paid", "paid", "failed", "refunded"],
            default: "pending",
            index: true
        },
        mode: {
            type: String,
            enum: ["pay_on_visit", "online_payment"],
            required: true
        },
        method: String,
        transactionId: String,
        paidAmount: {
            type: Number,
            default: 0
        },
        paymentDate: Date,
        refundStatus: {
            type: String,
            enum: ["none", "partial", "full"],
            default: "none"
        },
        refundAmount: Number,
        refundDate: Date
    },

    paymentWindow: {
        expiresAt: {
          type: Date,
          required: true,
          index: true  // For efficient cleanup queries
        },
        lastPaymentAttemptAt: Date
      },

    // Booking Status
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
        default: "pending",
        index: true
    },

    // Special Requests and Notes
    specialRequests: [String],
    adminNotes: [String],

    // Third Party Integration Data
    thirdPartyData: {
        inventoryMode: String,
        languageKey: String,
        responseData: Schema.Types.Mixed,
        apiResponse: Schema.Types.Mixed
    },

    // Cancellation Details
    cancellation: {
        isCancelled: {
            type: Boolean,
            default: false
        },
        cancellationDate: Date,
        cancellationReason: String,
        cancelledBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        refundAmount: Number,
        cancellationCharges: Number,
        cancellationPolicy: String
    },

    // Modification Tracking
    modifications: [{
        modifiedDate: Date,
        modifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        changes: Schema.Types.Mixed,
        reason: String
    }],

    // Created/Updated By
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false
    }
}, {
    timestamps: true
});

// Add compound indexes
bookingSchema.index({ hotelId: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ hotelId: 1, status: 1 });
bookingSchema.index({ "payment.status": 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
export default Booking;