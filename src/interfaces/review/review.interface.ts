// interfaces/review/review.interface.ts
export interface IReview {
    _id?: string;
    userId: string; // Reference to User ID
    hotelId: string; // Reference to Hotel ID
    bookingId: string; // Reference to Booking ID
    rating: number;
    title: string;
    comment: string;
    images?: string[];
    categories: {
      cleanliness: number;
      service: number;
      amenities: number;
      location: number;
      value: number;
    };
    status: "pending" | "approved" | "rejected";
    response?: {
      comment: string;
      respondedBy: string;
      respondedAt: Date;
    };
    createdAt?: Date;
    updatedAt?: Date;
  }