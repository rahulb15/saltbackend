
// // interfaces/room/room.interface.ts
// export interface IRoom {
//     _id?: string;
//     hotelId: string; // Reference to Hotel ID
//     roomNumber: string;
//     type: string;
//     description: string;
//     capacity: {
//       adults: number;
//       children: number;
//     };
//     amenities: string[];
//     images: string[];
//     pricing: {
//       basePrice: number;
//       taxPercentage: number;
//       cleaningFee: number;
//       currency: string;
//     };
//     availability: {
//       status: "available" | "booked" | "maintenance";
//       unavailableDates: Date[];
//     };
//     size: {
//       value: number;
//       unit: "sqft" | "sqm";
//     };
//     bedConfiguration: {
//       type: string;
//       count: number;
//     }[];
//     status: "active" | "inactive" | "maintenance";
//     createdBy: string;
//     updatedBy: string;
//     createdAt?: Date;
//     updatedAt?: Date;
//   }
  




// // interfaces/room/room.interface.ts
// export interface IRoom {
//   _id?: string;
//   hotelId: string;
//   roomNumber: string;
//   name: string;
//   roomName: string;  // Full display name with package
//   roomDescription: string;
//   roomtypeShortCode: string;
//   type: string;
//   packageDescription?: string;
//   specialsDesc?: string;
//   specialConditions?: string;
//   specialHighlightInclusion?: string;
//   roomTypeUnkId?: string;
//   rateTypeUnkId?: string;
//   roomRateUnkId?: string;
//   capacity: {
//       baseAdults: number;
//       maxAdults: number;
//       baseChildren: number;
//       maxChildren: number;
//   };
//   amenities: {
//       id: string;
//       name: string;
//       icon?: string;
//   }[];
//   images: {
//       mainImage: string;
//       additionalImages: string[];
//   };
//   pricing: {
//       basePrice: number;
//       rackRate: number;
//       beforeDiscountInclusiveTaxAdjustment: number;
//       exclusiveTax: number;
//       exclusiveTaxBaseRate: number;
//       tax: number;
//       adjustment: number;
//       inclusiveTaxAdjustment: number;
//       totalPriceRoomOnly: number;
//       totalPriceInclusiveAll: number;
//       avgPerNightBeforeDiscount: number;
//       avgPerNightAfterDiscount: number;
//       avgPerNightWithoutTax: number;
//       dayWiseBaseRackRate: number[];
//       dayWiseBeforeDiscount: string[];
//       currency: string;
//       deals?: {
//           type: string;
//           value: number;
//           unit: string;
//       };
//       extraAdultRates?: {
//           exclusiveTax: number;
//           tax: number;
//           adjustment: number;
//           inclusiveTaxAdjustment: number;
//           rackRate: number;
//       };
//       extraChildRates?: {
//           exclusiveTax: number;
//           tax: number;
//           adjustment: number;
//           inclusiveTaxAdjustment: number;
//           rackRate: number;
//       };
//   };
//   availability: {
//       status: "available" | "booked" | "maintenance";
//       unavailableDates: Date[];
//       availableRooms: { [date: string]: number };
//       minAvailableRooms: number;
//       stopSells?: { [date: string]: string };
//       closeOnArrival?: { [date: string]: string };
//       closeOnDept?: { [date: string]: string };
//   };
//   size: {
//       value: number;
//       unit: "sqft" | "sqm";
//   };
//   bedConfiguration: {
//       type: string;
//       count: number;
//   }[];
//   policies: {
//       checkInTime: string;
//       checkOutTime: string;
//       cancellationPolicy: string;
//       minimumStay: { [date: string]: string };
//       maxNights: string[];
//       avgMinNights: string;
//   };
//   taxes: {
//       [date: string]: {
//           [key: string]: {
//               taxName: string;
//               taxDate: string;
//               exemptAfter: string;
//               postingType: string;
//               postingRule: string;
//               amount: string;
//               slab: string;
//               discountType: string;
//               entryDateTime: string;
//               taxApplyAfter: string;
//               applyOnRackRate: string;
//               applyTaxDate: string;
//               exchangeRate1: string;
//               exchangeRate2: string;
//           }
//       }
//   };
//   showPriceFormat?: string;
//   defaultDisplayCurrency?: string;
//   isPromotion: boolean;
//   promotionDetails?: {
//       code: string | null;
//       description: string | null;
//       name: string | null;
//       id: string | null;
//   };
//   packageDetails?: {
//       name: string;
//       id: string;
//   };
//   localFolder?: string;
//   calDateFormat?: string;
//   showTaxInclusiveExclusiveSettings?: string;
//   hideFromMetaSearch?: string;
//   prepaidNonCancelNonRefundable?: string;
//   cancellationDeadline?: string;
//   digitsAfterDecimal?: string;
//   visibilityNights?: string;
//   bookingEngineURL?: string;
//   hotelAmenities?: any[];
//   status: "active" | "inactive" | "maintenance";
//   createdBy: string;
//   updatedBy: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }




// interfaces/room/room.interface.ts
import { Document } from 'mongoose';

export interface IImages {
    mainImage: string;
    additionalImages: string[];
}

export interface ICapacity {
    baseAdults: number;
    maxAdults: number;
    baseChildren: number;
    maxChildren: number;
    maxOccupancy?: string;
}

export interface IPricing {
    basePrice: number;
    rackRate: number;
    currency: string;
    beforeDiscountInclusiveTaxAdjustment?: any;
    exclusiveTax?: any;
    exclusiveTaxBaseRate?: any;
    tax?: any;
    adjustment?: any;
    inclusiveTaxAdjustment?: any;
    totalPriceRoomOnly?: number;
    totalPriceInclusiveAll?: number;
    avgPerNightBeforeDiscount?: number;
    avgPerNightAfterDiscount?: number;
    avgPerNightWithoutTax?: number;
    dayWiseBaseRackRate?: number[];
    dayWiseBeforeDiscount?: string[];
    deals?: any;
    extraAdultRates?: any;
    extraChildRates?: any;
}

export interface ISize {
    value: number;
    unit: 'sqft' | 'sqm';
}

export interface IBedConfiguration {
    type: string;
    count: number;
}

export interface IPolicies {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    minimumStay?: any;
    maxNights?: string[];
    avgMinNights?: string;
    cancellationDeadline?: string;
    prepaidNonCancelNonRefundable?: string;
}

export interface IAvailability {
    status: 'available' | 'booked' | 'maintenance';
    unavailableDates: Date[];
    availableRooms: Record<string, number>;
    minAvailableRooms?: number;
    stopSells?: Record<string, string>;
    closeOnArrival?: Record<string, string>;
    closeOnDept?: Record<string, string>;
}

export interface IAmenity {
    id: string;
    name: string;
    icon?: string;
}

export interface IPromotionDetails {
    code: string | null;
    description: string | null;
    name: string | null;
    id: string | null;
}

export interface IPackageDetails {
    name: string | null;
    id: string | null;
}

export interface IRoom extends Document {
    hotelId: string;
    roomtypeUnkId?: string;
    ratetypeUnkId?: string;
    roomRateUnkId?: string;
    hotelCode?: string;
    roomNumber: string;
    name: string;
    roomName: string;
    roomDescription: string;
    roomtypeShortCode: string;
    type: string;
    packageDescription?: string;
    specialsDesc?: string;
    specialConditions?: string;
    specialHighlightInclusion?: string;
    inclusion?: string;
    capacity: ICapacity;
    pricing: IPricing;
    images: IImages;
    availability: IAvailability;
    size: ISize;
    bedConfiguration: IBedConfiguration[];
    policies: IPolicies;
    taxes?: Record<string, any>;
    showPriceFormat?: string;
    defaultDisplayCurrency?: string;
    calDateFormat?: string;
    showTaxInclusiveExclusiveSettings?: string;
    digitsAfterDecimal?: string;
    visibilityNights?: string;
    hideFromMetaSearch?: string;
    bookingEngineURL?: string;
    localFolder?: string;
    currencyCode?: string;
    currencySign?: string;
    isPromotion: boolean;
    promotionDetails?: IPromotionDetails;
    packageDetails?: IPackageDetails;
    amenities: IAmenity[];
    hotelAmenities?: any[];
    newRoomAmenities?: any[];
    status: 'active' | 'inactive' | 'maintenance';
    createdBy: string;
    updatedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Add a new interface for room updates that includes imagesToDelete
export interface IRoomUpdateRequest extends Partial<IRoom> {
    imagesToDelete?: string[];
}