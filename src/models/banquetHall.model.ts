// // models/banquetHall.model.ts
// import mongoose, { Schema, Document } from 'mongoose';

// export interface IBanquetHall extends Document {
//   name: string;
//   description: string;
//   capacity: number;
//   price: number;
//   images: string[];
//   address: string;
//   amenities: string[];
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const banquetHallSchema = new Schema({
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   capacity: { type: Number, required: true },
//   price: { type: Number, required: true },
//   images: [{ type: String, required: true }],
//   address: { type: String, required: true },
//   amenities: [{ type: String }],
//   isActive: { type: Boolean, default: true }
// }, {
//   timestamps: true
// });

// const BanquetHall = mongoose.model<IBanquetHall>('BanquetHall', banquetHallSchema);
// export default BanquetHall;



// models/banquetHall.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBanquetHall extends Document {
  name: string;
  description: string;
  images: string[];
  capacity: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  amenities: string[];
  pricing: {
    basePrice: number;
    cleaningFee?: number;
    securityDeposit?: number;
  };
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  rules?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const banquetHallSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  capacity: { type: Number, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  amenities: [{ type: String }],
  pricing: {
    basePrice: { type: Number, required: true },
    cleaningFee: Number,
    securityDeposit: Number
  },
  availability: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: true },
    sunday: { type: Boolean, default: true }
  },
  rules: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IBanquetHall>('BanquetHall', banquetHallSchema);