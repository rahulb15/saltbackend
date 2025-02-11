// models/amenity.model.ts
import mongoose from "mongoose";
import { IAmenity } from "../interfaces/amenity/amenity.interface";

const amenitySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true,
        unique: true 
    },
    icon: { 
        type: String,
        required: false, 
    },
    category: {
        type: String,
        required: true,
        enum: ['BASIC', 'PREMIUM', 'LUXURY']
    },
    description: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }
}, { timestamps: true });

// Add indexes
amenitySchema.index({ name: 1 });
amenitySchema.index({ category: 1 });
amenitySchema.index({ isActive: 1 });

const Amenity = mongoose.model<IAmenity>("Amenity", amenitySchema);
export default Amenity;
