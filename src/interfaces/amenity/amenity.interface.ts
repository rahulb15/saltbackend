
// interfaces/amenity.interface.ts
export interface IAmenity extends Document {
    name: string;
    icon: string;
    category: 'BASIC' | 'PREMIUM' | 'LUXURY';
    description: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}