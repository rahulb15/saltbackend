// import mongoose from "mongoose";
// import { IHotel } from "../interfaces/hotel/hotel.interface";

// const hotelSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     type: { type: String, required: true },
//     hotelCode: { type: String, required: true, unique: true },
//     description: { type: String, required: true },
//     address: {
//       street: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       country: { type: String, required: true },
//       zipCode: { type: String, required: true },
//       coordinates: {
//         latitude: Number,
//         longitude: Number,
//       },
//     },
//     contact: {
//       email: { type: String, required: true },
//       phone: { type: String, required: true },
//       website: String,
//     },
//     // Updated amenities to reference Amenity model
//     amenities: [{ 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: "Amenity"
//     }],
//     images: [{ type: String }],
//     rating: { type: Number, default: 0, min: 0, max: 5 },
//     reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
//     rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
//     policies: {
//       checkInTime: { type: String, required: true },
//       checkOutTime: { type: String, required: true },
//       cancellationPolicy: { type: String, required: true },
//       childrenPolicy: String,
//       petPolicy: String,
//     },
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
// hotelSchema.index({ name: 1 });
// hotelSchema.index({ "address.city": 1 });
// hotelSchema.index({ status: 1 });
// hotelSchema.index({ rating: -1 });
// hotelSchema.index({ amenities: 1 }); // Add index for amenities

// const Hotel = mongoose.model<IHotel>("Hotel", hotelSchema);
// export default Hotel;


// models/hotel.model.ts
import mongoose from "mongoose";
import { IHotel } from "../interfaces/hotel/hotel.interface";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    hotelCode: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      distanceFromLandmark: { type: String, default: "City Center" }
    },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      website: String,
    },
    amenities: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Amenity"
    }],
    images: [{ type: String }],
    mainImage: { type: String }, // Added for primary display image
    thumbnails: [{ type: String }], // Added for gallery thumbnails
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingText: { type: String, default: "Good" }, // Added for rating description
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    pricing: {
      basePrice: { type: Number, default: 0 }, // Lowest room price
      originalPrice: { type: Number }, // For showing discounted rates
      taxesAndFees: { type: Number, default: 0 },
      currency: { type: String, default: "INR" }
    },
    policies: {
      checkInTime: { type: String, required: true },
      checkOutTime: { type: String, required: true },
      cancellationPolicy: { type: String, required: true },
      childrenPolicy: String,
      petPolicy: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    highlightFeatures: [{ type: String }], // Added for key features
    propertyHighlights: String, // Added for property description summary
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// Add indexes for common queries
hotelSchema.index({ name: 1 });
hotelSchema.index({ "address.city": 1 });
hotelSchema.index({ status: 1 });
hotelSchema.index({ rating: -1 });
hotelSchema.index({ amenities: 1 });
hotelSchema.index({ "pricing.basePrice": 1 });

const Hotel = mongoose.model<IHotel>("Hotel", hotelSchema);
export default Hotel;