// interfaces/otp.interface.ts
export interface IOTP {
    phone: string;
    otp: string;
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }