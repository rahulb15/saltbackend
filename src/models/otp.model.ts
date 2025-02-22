// models/otp.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IOTP } from '../interfaces/otp.interface';

const OTPSchema = new Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Automatically delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTP & Document>('OTP', OTPSchema);
