import mongoose from "mongoose";
// interfaces/featured-hotel.interface.ts
export interface ICustomAmenity {
  name: string;
  icon: string;
  description: string;
}

export interface IDisplayPrice {
  basePrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  currency?: string;
}

export interface ISpecialFeature {
  title: string;
  description: string;
  icon: string;
}

export interface IFeaturedHotel {
  hotelId: mongoose.Types.ObjectId;
  position: number;
  sectionType: 'featured' | 'trending' | 'topRated' | 'recommended';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  customTitle?: string;
  customImages?: string[];
  customAmenities?: ICustomAmenity[]; // Changed from string[] to ICustomAmenity[]
  mainImage?: string | null;
  displayPrice?: IDisplayPrice; // Added proper type for displayPrice
  specialFeatures?: ISpecialFeature[]; // Added proper type for specialFeatures
  customDescription?: string;
  highlightTags?: string[];
  promotionalOffer?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}