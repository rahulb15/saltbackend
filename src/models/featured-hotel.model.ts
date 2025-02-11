// // models/featured-hotel.model.ts
// import mongoose from "mongoose";

// const featuredHotelSchema = new mongoose.Schema({
//   hotelId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Hotel', 
//     required: true 
//   },
//   position: { 
//     type: Number, 
//     required: true 
//   },
//   sectionType: { 
//     type: String, 
//     enum: ['featured', 'trending', 'topRated', 'recommended'],
//     required: true 
//   },
//   startDate: { 
//     type: Date, 
//     required: true 
//   },
//   endDate: { 
//     type: Date, 
//     required: true 
//   },
//   isActive: { 
//     type: Boolean, 
//     default: true 
//   },
//   customTitle: String,
//   customDescription: String,
//   highlightTags: [String],
//   promotionalOffer: {
//     type: String,
//     default: null
//   },
//   createdBy: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
//   updatedBy: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   }
// }, { timestamps: true });

// // Ensure unique position within same section type
// featuredHotelSchema.index({ sectionType: 1, position: 1 }, { unique: true });

// const FeaturedHotel = mongoose.model('FeaturedHotel', featuredHotelSchema);
// export default FeaturedHotel;



// models/featured-hotel.model.ts
import mongoose from "mongoose";

const featuredHotelSchema = new mongoose.Schema({
  hotelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hotel', 
    required: true 
  },
  position: { 
    type: Number, 
    required: true 
  },
  sectionType: { 
    type: String, 
    enum: ['featured', 'trending', 'topRated', 'recommended', 'latest' , 'premier' , 'select' , 'express' , 'gurugram' , 'delhi' , 'mohali' ],
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  customTitle: String,
  customDescription: String,
  customImages: [String], // Added for featured-specific images
  mainImage: String,      // Added for featured main image
  highlightTags: [String],
  promotionalOffer: String,
  customAmenities: [{     // Added for featured-specific amenities
    name: String,
    icon: String,
    description: String
  }],
  displayPrice: {         // Added for featured-specific pricing
    basePrice: Number,
    discountedPrice: Number,
    discountPercentage: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  specialFeatures: [{     // Added for featured-specific features
    title: String,
    description: String,
    icon: String
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure unique position within same section type
featuredHotelSchema.index({ sectionType: 1, position: 1 }, { unique: true });

// Virtual for calculating days left in feature
featuredHotelSchema.virtual('daysLeft').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const FeaturedHotel = mongoose.model('FeaturedHotel', featuredHotelSchema);
export default FeaturedHotel;
