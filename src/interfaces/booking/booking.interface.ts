// // interfaces/booking/booking.interface.ts
// export interface IBooking {
//     _id?: string;
//     bookingNumber: string;
//     userId: string; // Reference to User ID
//     hotelId: string; // Reference to Hotel ID
//     roomId: string; // Reference to Room ID
//     checkIn: Date;
//     checkOut: Date;
//     guests: {
//       adults: number;
//       children: number;
//       childrenAges?: number[];
//     };
//     pricing: {
//       basePrice: number;
//       taxAmount: number;
//       cleaningFee: number;
//       totalAmount: number;
//       currency: string;
//     };
//     payment: {
//       status: "pending" | "completed" | "failed" | "refunded";
//       method?: string;
//       transactionId?: string;
//       paidAmount?: number;
//       paidAt?: Date;
//     };
//     status: "confirmed" | "cancelled" | "completed" | "no-show";
//     specialRequests?: string;
//     cancellation?: {
//       cancelledAt: Date;
//       reason: string;
//       refundAmount: number;
//       refundStatus: "pending" | "completed" | "rejected";
//     };
//     createdAt?: Date;
//     updatedAt?: Date;
//   }
  



// interfaces/booking/booking.interface.ts
import { Document, ObjectId } from 'mongoose';

export interface IBookingGuests {
    adults: number;
    children: number;
    childrenAges?: number[];
    extraAdults?: number;
    extraChildren?: number;
}

export interface IBookingPricing {
    baseRate: number;
    extraAdultRate?: number;
    extraChildRate?: number;
    taxAmount: number;
    discountAmount?: number;
    cleaningFee?: number;
    totalAmount: number;
    currency: string;
    promotionCode?: string;
    promocodeId?: ObjectId;
    isCouponApplied?: boolean;
    priceBreakdown?: {
        roomCharges: number;
        taxes: Array<{
            name: string;
            amount: number;
            percentage: number;
        }>;
        addOns: Array<{
            name: string;
            amount: number;
        }>;
    };
}

export interface IBookingPayment {
    status: "pending" | "partially_paid" | "paid" | "failed" | "refunded";
    mode: "pay_on_visit" | "online_payment";
    method?: string;
    transactionId?: string;
    paidAmount: number;
    paymentDate?: Date;
    refundStatus: "none" | "partial" | "full";
    refundAmount?: number;
    refundDate?: Date;
}

export interface IBookingCancellation {
    isCancelled: boolean;
    cancellationDate?: Date;
    cancellationReason?: string;
    cancelledBy?: ObjectId;
    refundAmount?: number;
    cancellationCharges?: number;
    cancellationPolicy?: string;
}

export interface IBookingGuest {
    title?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
}

export interface IRoomDetails {
    roomTypeId: string;
    rateplanId: string;
    ratetypeId: string;
    roomName: string;
    roomType: string;
}

export interface IBooking extends Document {
    bookingNumber: string;
    thirdPartyReservationNo?: string;
    subReservationNumbers?: string[];
    
    // Core Relations
    userId: ObjectId;
    hotelId: ObjectId;
    hotelCode: string;
    roomId: ObjectId;
    roomDetails: IRoomDetails;

    // Main Guest & Additional Guests
    guestDetails: IBookingGuest;
    additionalGuests?: IBookingGuest[];

    // Stay Information
    checkIn: Date;
    checkOut: Date;
    numberOfNights: number;
    guests: IBookingGuests;

    // Financial Details
    pricing: IBookingPricing;
    payment: IBookingPayment;
    paymentWindow: {
        expiresAt: Date;
        lastPaymentAttemptAt?: Date;
    };

    // Status and Requests
    status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
    specialRequests?: string[];
    adminNotes?: string[];

    // Third Party Data
    thirdPartyData?: {
        inventoryMode?: string;
        languageKey?: string;
        responseData?: any;
        apiResponse?: any;
    };

    // Cancellation
    cancellation?: IBookingCancellation;

    // Modification History
    modifications?: Array<{
        modifiedDate: Date;
        modifiedBy: ObjectId;
        changes: any;
        reason?: string;
    }>;

    // Metadata
    createdBy: ObjectId;
    updatedBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Types
export interface IBookingCreateRequest {
  userId?: string;
  hotelId: string;
  hotelCode: string;
  roomId: string;
  roomDetails: IRoomDetails;
  guestDetails: IBookingGuest;
  checkIn: Date;
  checkOut: Date;
  numberOfNights: number;
  guests: IBookingGuests;
  pricing: IBookingPricing;
  payment: {
      status: IBookingPayment['status'];
      mode: IBookingPayment['mode'];
      paidAmount: number;
  };
  paymentWindow: {
    expiresAt : Date;
    lastPaymentAttemptAt?: Date;
    };

  status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  thirdPartyData?: {
      inventoryMode?: string;
      languageKey?: string;
      responseData?: any;
      apiResponse?: any;
  };
  thirdPartyReservationNo?: string;
  subReservationNumbers?: string[];
  createdBy: string | ObjectId;
  updatedBy: string | ObjectId;
}

export interface IBookingUpdateRequest {
    checkIn?: Date;
    checkOut?: Date;
    guests?: Partial<IBookingGuests>;
    specialRequests?: string[];
    status?: string;
}

export interface IBookingResponse {
    booking: IBooking;
    reservationNumber?: string;
}