
// // models/room.model.ts
// import mongoose from "mongoose";
// import { IRoom } from "../interfaces/room/room.interface";

// const roomSchema = new mongoose.Schema(
//   {
//     hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
//     roomNumber: { type: String, required: true },
//     type: { type: String, required: true },
//     description: { type: String, required: true },
//     capacity: {
//       adults: { type: Number, required: true },
//       children: { type: Number, required: true },
//     },
//     amenities: [{ type: String }],
//     images: [{ type: String }],
//     pricing: {
//       basePrice: { type: Number, required: true },
//       taxPercentage: { type: Number, required: true },
//       cleaningFee: { type: Number, required: true },
//       currency: { type: String, required: true, default: "USD" },
//     },
//     availability: {
//       status: {
//         type: String,
//         enum: ["available", "booked", "maintenance"],
//         default: "available",
//       },
//       unavailableDates: [{ type: Date }],
//     },
//     size: {
//       value: { type: Number, required: true },
//       unit: { type: String, enum: ["sqft", "sqm"], required: true },
//     },
//     bedConfiguration: [
//       {
//         type: { type: String, required: true },
//         count: { type: Number, required: true },
//       },
//     ],
//     status: {
//       type: String,
//       enum: ["active", "inactive", "maintenance"],
//       default: "active",
//     },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   },
//   { timestamps: true }
// );

// // Add indexes for common queries
// roomSchema.index({ hotelId: 1 });
// roomSchema.index({ "availability.status": 1 });
// roomSchema.index({ "pricing.basePrice": 1 });
// roomSchema.index({ status: 1 });

// const Room = mongoose.model<IRoom>("Room", roomSchema);
// export default Room;





// // models/room.model.ts
// import mongoose, { Schema, Document } from "mongoose";
// import { IRoom } from "../interfaces/room/room.interface";

// const roomSchema = new Schema({
//     hotelId: {
//         type: Schema.Types.ObjectId,
//         ref: "Hotel",
//         required: true,
//         index: true
//     },
//     roomNumber: {
//         type: String,
//         required: true
//     },
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     roomName: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     roomDescription: {
//         type: String,
//         required: true
//     },
//     roomtypeShortCode: {
//         type: String,
//         required: true
//     },
//     type: {
//         type: String,
//         required: true,
//         index: true
//     },
//     packageDescription: String,
//     specialsDesc: String,
//     specialConditions: String,
//     specialHighlightInclusion: String,
//     roomTypeUnkId: String,
//     rateTypeUnkId: String,
//     roomRateUnkId: String,
//     capacity: {
//         baseAdults: {
//             type: Number,
//             required: true,
//             min: 1
//         },
//         maxAdults: {
//             type: Number,
//             required: true,
//             min: 1
//         },
//         baseChildren: {
//             type: Number,
//             default: 0
//         },
//         maxChildren: {
//             type: Number,
//             default: 0
//         }
//     },
//     amenities: [{
//         id: String,
//         name: String,
//         icon: String
//     }],
//     images: {
//         mainImage: {
//             type: String,
//             required: true
//         },
//         additionalImages: [String]
//     },
//     pricing: {
//         basePrice: {
//             type: Number,
//             required: true,
//             min: 0
//         },
//         rackRate: {
//             type: Number,
//             required: true
//         },
//         beforeDiscountInclusiveTaxAdjustment: Number,
//         exclusiveTax: Number,
//         exclusiveTaxBaseRate: Number,
//         tax: Number,
//         adjustment: Number,
//         inclusiveTaxAdjustment: Number,
//         totalPriceRoomOnly: Number,
//         totalPriceInclusiveAll: Number,
//         avgPerNightBeforeDiscount: Number,
//         avgPerNightAfterDiscount: Number,
//         avgPerNightWithoutTax: Number,
//         dayWiseBaseRackRate: [Number],
//         dayWiseBeforeDiscount: [String],
//         currency: {
//             type: String,
//             default: "INR"
//         },
//         deals: {
//             type: {
//                 type: String
//             },
//             value: Number,
//             unit: String
//         },
//         extraAdultRates: {
//             exclusiveTax: Number,
//             tax: Number,
//             adjustment: Number,
//             inclusiveTaxAdjustment: Number,
//             rackRate: Number
//         },
//         extraChildRates: {
//             exclusiveTax: Number,
//             tax: Number,
//             adjustment: Number,
//             inclusiveTaxAdjustment: Number,
//             rackRate: Number
//         }
//     },
//     availability: {
//         status: {
//             type: String,
//             enum: ["available", "booked", "maintenance"],
//             default: "available"
//         },
//         unavailableDates: [{
//             type: Date
//         }],
//         availableRooms: {
//             type: Map,
//             of: Number
//         },
//         minAvailableRooms: Number,
//         stopSells: {
//             type: Map,
//             of: String
//         },
//         closeOnArrival: {
//             type: Map,
//             of: String
//         },
//         closeOnDept: {
//             type: Map,
//             of: String
//         }
//     },
//     size: {
//         value: {
//             type: Number,
//             required: true
//         },
//         unit: {
//             type: String,
//             enum: ["sqft", "sqm"],
//             required: true
//         }
//     },
//     bedConfiguration: [{
//         type: {
//             type: String,
//             required: true
//         },
//         count: {
//             type: Number,
//             required: true,
//             min: 1
//         }
//     }],
//     policies: {
//         checkInTime: {
//             type: String,
//             required: true
//         },
//         checkOutTime: {
//             type: String,
//             required: true
//         },
//         cancellationPolicy: {
//             type: String,
//             required: true
//         },
//         minimumStay: {
//             type: Map,
//             of: String
//         },
//         maxNights: [String],
//         avgMinNights: String
//     },
//     taxes: {
//         type: Map,
//         of: new Schema({
//             taxName: String,
//             taxDate: String,
//             exemptAfter: String,
//             postingType: String,
//             postingRule: String,
//             amount: String,
//             slab: String,
//             discountType: String,
//             entryDateTime: String,
//             taxApplyAfter: String,
//             applyOnRackRate: String,
//             applyTaxDate: String,
//             exchangeRate1: String,
//             exchangeRate2: String
//         }, { _id: false })
//     },
//     showPriceFormat: String,
//     defaultDisplayCurrency: String,
//     isPromotion: {
//         type: Boolean,
//         default: false
//     },
//     promotionDetails: {
//         code: String,
//         description: String,
//         name: String,
//         id: String
//     },
//     packageDetails: {
//         name: String,
//         id: String
//     },
//     localFolder: String,
//     calDateFormat: String,
//     showTaxInclusiveExclusiveSettings: String,
//     hideFromMetaSearch: String,
//     prepaidNonCancelNonRefundable: String,
//     cancellationDeadline: String,
//     digitsAfterDecimal: String,
//     visibilityNights: String,
//     bookingEngineURL: String,
//     hotelAmenities: [Schema.Types.Mixed],
//     status: {
//         type: String,
//         enum: ["active", "inactive", "maintenance"],
//         default: "active",
//         index: true
//     },
//     createdBy: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     updatedBy: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     }
// }, {
//     timestamps: true
// });

// // Add indexes for common queries
// roomSchema.index({ "pricing.basePrice": 1 });
// roomSchema.index({ "pricing.rackRate": 1 });
// roomSchema.index({ "availability.status": 1 });
// roomSchema.index({ "availability.availableRooms": 1 });
// roomSchema.index({ createdAt: -1 });

// const Room = mongoose.model<IRoom & Document>("Room", roomSchema);
// export default Room;




import mongoose, { Schema, Document } from "mongoose";
import { IRoom } from "../interfaces/room/room.interface";

const roomSchema = new Schema({
    // Existing core fields
    hotelId: {
        type: Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
        index: true
    },
    roomtypeUnkId: { // Add this for uniqueness check
        type: String,
        required: true,
        // unique: true,
        sparse: true
    },
    ratetypeUnkId: String,
    roomRateUnkId: String,
    hotelCode: String,
    
    // Basic room info
    roomNumber: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    roomName: {
        type: String,
        required: true,
        // unique: true,
        trim: true
    },
    roomDescription: {
        type: String,
        required: true
    },
    roomtypeShortCode: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },

    // Additional descriptions
    packageDescription: String,
    specialsDesc: String,
    specialConditions: String,
    specialHighlightInclusion: String,
    inclusion: String,

    // Capacity
    capacity: {
        baseAdults: {
            type: Number,
            required: true,
            min: 1
        },
        maxAdults: {
            type: Number,
            required: true,
            min: 1
        },
        baseChildren: {
            type: Number,
            default: 0
        },
        maxChildren: {
            type: Number,
            default: 0
        },
        maxOccupancy: String
    },

    // Pricing structure
    pricing: {
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        rackRate: {
            type: Number,
            required: true
        },
        beforeDiscountInclusiveTaxAdjustment: Schema.Types.Mixed,
        exclusiveTax: Schema.Types.Mixed,
        exclusiveTaxBaseRate: Schema.Types.Mixed,
        tax: Schema.Types.Mixed,
        adjustment: Schema.Types.Mixed,
        inclusiveTaxAdjustment: Schema.Types.Mixed,
        totalPriceRoomOnly: Number,
        totalPriceInclusiveAll: Number,
        avgPerNightBeforeDiscount: Number,
        avgPerNightAfterDiscount: Number,
        avgPerNightWithoutTax: Number,
        dayWiseBaseRackRate: [Number],
        dayWiseBeforeDiscount: [String],
        currency: {
            type: String,
            default: "INR"
        },
        deals: {
            type: String,
            value: Number,
            unit: String
        },
        extraAdultRates: {
            exclusiveTax: Schema.Types.Mixed,
            tax: Schema.Types.Mixed,
            adjustment: Schema.Types.Mixed,
            inclusiveTaxAdjustment: Schema.Types.Mixed,
            rackRate: String
        },
        extraChildRates: {
            exclusiveTax: Schema.Types.Mixed,
            tax: Schema.Types.Mixed,
            adjustment: Schema.Types.Mixed,
            inclusiveTaxAdjustment: Schema.Types.Mixed,
            rackRate: String
        }
    },

    // Images
    images: {
        mainImage: {
            type: String,
            required: true
        },
        additionalImages: [String]
    },

    // Availability
    availability: {
        status: {
            type: String,
            enum: ["available", "booked", "maintenance"],
            default: "available"
        },
        unavailableDates: [{
            type: Date
        }],
        availableRooms: {
            type: Map,
            of: Schema.Types.Mixed
        },
        minAvailableRooms: Number,
        stopSells: {
            type: Map,
            of: String
        },
        closeOnArrival: {
            type: Map,
            of: String
        },
        closeOnDept: {
            type: Map,
            of: String
        }
    },

    // Room specifications
    size: {
        value: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ["sqft", "sqm"],
            required: true
        }
    },

    // Configuration and policies
    bedConfiguration: [{
        type: {
            type: String,
            required: true
        },
        count: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    
    policies: {
        checkInTime: {
            type: String,
            required: true
        },
        checkOutTime: {
            type: String,
            required: true
        },
        cancellationPolicy: {
            type: String,
            required: true
        },
        minimumStay: {
            type: Map,
            of: String
        },
        maxNights: [String],
        avgMinNights: String,
        cancellationDeadline: String,
        prepaidNonCancelNonRefundable: String
    },

    // Taxes
    taxes: {
        type: Map,
        of: new Schema({
            Taxname: String,
            taxdate: String,
            exemptafter: String,
            postingtype: String,
            postingrule: String,
            amount: String,
            slab: String,
            discounttype: String,
            entrydatetime: String,
            taxapplyafter: String,
            applyonrackrate: String,
            applytaxdate: String,
            exchange_rate1: String,
            exchange_rate2: String
        }, { _id: false })
    },

    // Display and formatting
    showPriceFormat: String,
    defaultDisplayCurrency: String,
    calDateFormat: String,
    showTaxInclusiveExclusiveSettings: String,
    digitsAfterDecimal: String,
    visibilityNights: String,
    hideFromMetaSearch: String,
    bookingEngineURL: String,
    localFolder: String,
    currencyCode: String,
    currencySign: String,

    // Promotions and packages
    isPromotion: {
        type: Boolean,
        default: false
    },
    promotionDetails: {
        code: String,
        description: String,
        name: String,
        id: String
    },
    packageDetails: {
        name: String,
        id: String
    },

    // Amenities
    amenities: [{
        id: String,
        name: String,
        icon: String
    }],
    hotelAmenities: [Schema.Types.Mixed],
    newRoomAmenities: [Schema.Types.Mixed],

    // Status and metadata
    status: {
        type: String,
        enum: ["active", "inactive", "maintenance"],
        default: "active",
        index: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true,
    strict: false // Allow for additional fields not explicitly defined
});

// Add indexes
roomSchema.index({ "pricing.basePrice": 1 });
roomSchema.index({ "pricing.rackRate": 1 });
roomSchema.index({ "availability.status": 1 });
roomSchema.index({ "availability.availableRooms": 1 });
roomSchema.index({ createdAt: -1 });

const Room = mongoose.model<IRoom & Document>("Room", roomSchema);
export default Room;
