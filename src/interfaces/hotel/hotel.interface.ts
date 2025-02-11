// // interfaces/hotel/hotel.interface.ts
// import { IReview } from "../review/review.interface";

// export interface IHotel {
//     _id?: string;
//     name: string;
//     type: string;
//     description: string;
//     address: {
//       street: string;
//       city: string;
//       state: string;
//       country: string;
//       zipCode: string;
//       coordinates?: {
//         latitude: number;
//         longitude: number;
//       };
//     };
//     contact: {
//       email: string;
//       phone: string;
//       website?: string;
//     };
//     amenities: string[];
//     images: string[];
//     rating: number;
//     reviews: IReview[];
//     rooms: string[]; // Reference to Room IDs
//     policies: {
//       checkInTime: string;
//       checkOutTime: string;
//       cancellationPolicy: string;
//       childrenPolicy: string;
//       petPolicy: string;
//     };
//     status: "active" | "inactive" | "maintenance";
//     createdBy: string; // Reference to User ID
//     updatedBy: string; // Reference to User ID
//     createdAt?: Date;
//     updatedAt?: Date;
//   }
  


import { Document, Types } from 'mongoose';
import { IAmenity } from '../amenity/amenity.interface';

export interface IHotel extends Document {
  name: string;
  hotelCode: string;
  type: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  // Updated amenities type to reference IAmenity
  amenities: Types.ObjectId[] | IAmenity[];
  images: string[];
  rating: number;
  reviews: Types.ObjectId[];
  rooms: Types.ObjectId[];
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    childrenPolicy?: string;
    petPolicy?: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}