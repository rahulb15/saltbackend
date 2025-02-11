import jwt from 'jsonwebtoken';
import { JWT_ADMIN_SECRET,JWT_USER_SECRET } from './secrets.util';
import { IUser } from '../interfaces/user/user.interface';

export const jwtSign = (user: IUser, admin?: boolean) => {
  console.log("JWT SIGNING... ", user, admin);
    const token = jwt.sign(
      { id: user._id },
      admin ? (JWT_ADMIN_SECRET as string) : (JWT_USER_SECRET as string),
      {
        expiresIn: "1y",
      }
    );
    return token;
  };

export const jwtVerify = (token: string, admin?: boolean) => {
  console.log("JWT VERIFYING... ", token, admin);
    const decoded = jwt.verify(
      token,
      admin ? (JWT_ADMIN_SECRET as string) : (JWT_USER_SECRET as string)
    );
    return decoded;
  };
  