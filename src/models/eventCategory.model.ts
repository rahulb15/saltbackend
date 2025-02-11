
// models/eventCategory.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEventType extends Document {
  name: string;
  description?: string;
  images: string[];
  slug: string;
  banquetHalls: mongoose.Types.ObjectId[]; // Array of banquet hall IDs
  amenities?: string[];
  maxCapacity?: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

const eventTypeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  images: [{ type: String, required: true }],
  slug: { type: String, required: true },
  banquetHalls: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'BanquetHall',
    required: true 
  }],
  amenities: [{ type: String }],
  maxCapacity: { type: Number },
  priceRange: {
    min: { type: Number },
    max: { type: Number }
  }
});

export interface IEventCategory extends Document {
  name: string;
  description: string;
  slug: string;
  banner?: string;
  eventTypes: IEventType[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  banner: { type: String },
  eventTypes: [eventTypeSchema],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Create slug from name for both category and event types
eventCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }
  
  // Also update slugs for event types if they're modified
  if (this.isModified('eventTypes')) {
    this.eventTypes.forEach(eventType => {
      if (!eventType.slug) {
        eventType.slug = eventType.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
      }
    });
  }
  
  next();
});

const EventCategory = mongoose.model<IEventCategory>('EventCategory', eventCategorySchema);
export default EventCategory;
