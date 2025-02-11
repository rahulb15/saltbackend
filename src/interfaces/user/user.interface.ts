export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
