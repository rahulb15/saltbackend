// // controllers/booking.controller.ts
// import { Request, Response } from "express";
// import bookingManager from "../../services/booking.manager";
// import { bookingResponseData } from "../../utils/bookingResponse/booking-response.utils";
// import { hotelResponseData } from "../../utils/hotelResponse/hotel-response.utils";
// import { IResponseHandler } from "../../interfaces/response-handler.interface";
// import {
//   ResponseStatus,
//   ResponseMessage,
//   ResponseDescription,
//   ResponseCode,
// } from "../../enum/response-message.enum";
// import { UpdateQuery } from "../../interfaces/booking/booking-update.interface";
// import { IBooking } from "../../interfaces/booking/booking.interface";
// export class BookingController {
//   public async create(req: any, res: Response) {
//     try {
//       const booking = req.body;
//       booking.userId = req.user._id;

//       const newBooking = await bookingManager.create(booking);
//       const data = bookingResponseData(newBooking);

//       const response: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.CREATED,
//         description: ResponseDescription.BOOKING_CREATED,
//         data: data,
//       };

//       res.status(ResponseCode.CREATED).json(response);
//     } catch (error) {
//       res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.INTERNAL_SERVER_ERROR,
//         description: ResponseMessage.BOOKING_FAILED,
//         data: null,
//       });
//     }
//   }

//   public async getAllBookings(req: Request, res: Response) {
//     try {
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 10;

//       const { bookings, total } = await bookingManager.getAll({}, page, limit);
//       const data = bookings.map((booking) => bookingResponseData(booking));

//       const response: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         data: {
//           bookings: data,
//           pagination: {
//             page,
//             limit,
//             total,
//             pages: Math.ceil(total / limit),
//           },
//         },
//         description: ResponseDescription.BOOKINGS_RETRIEVED,
//       };

//       res.status(ResponseCode.SUCCESS).json(response);
//     } catch (error) {
//       res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.INTERNAL_SERVER_ERROR,
//         description: ResponseDescription.BOOKINGS_RETRIEVAL_FAILED,
//         data: null,
//       });
//     }
//   }

//   public async getUserBookings(req: any, res: Response) {
//     try {
//       const userId = req.user._id;
//       const bookings = await bookingManager.getUserBookings(userId);
//       const data = bookings.map((booking) => bookingResponseData(booking));

//       const response: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         data: data,
//         description: ResponseDescription.BOOKINGS_RETRIEVED,
//       };

//       res.status(ResponseCode.SUCCESS).json(response);
//     } catch (error) {
//       res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.INTERNAL_SERVER_ERROR,
//         description: ResponseDescription.BOOKINGS_RETRIEVAL_FAILED,
//         data: null,
//       });
//     }
//   }

//   public async getBookingById(req: any, res: Response) {
//     try {
//       const booking = await bookingManager.getById(req.params.id);

//       if (!booking) {
//         return res.status(ResponseCode.NOT_FOUND).json({
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.NOT_FOUND,
//           data: null,
//         });
//       }

//       // Check if user is authorized to view this booking
//       if (
//         !req.user.isAdmin &&
//         booking.userId.toString() !== req.user._id.toString()
//       ) {
//         return res.status(ResponseCode.UNAUTHORIZED).json({
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.UNAUTHORIZED,
//           data: null,
//         });
//       }

//       const data = bookingResponseData(booking);

//       const response: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         data: data,
//         description: ResponseDescription.BOOKING_RETRIEVED,
//       };

//       res.status(ResponseCode.SUCCESS).json(response);
//     } catch (error) {
//       res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.INTERNAL_SERVER_ERROR,
//         description: ResponseDescription.BOOKING_RETRIEVAL_FAILED,
//         data: null,
//       });
//     }
//   }

//   public async cancelBooking(req: any, res: Response) {
//     try {
//       const { reason } = req.body;
//       const booking = await bookingManager.getById(req.params.id);

//       if (!booking) {
//         return res.status(ResponseCode.NOT_FOUND).json({
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.NOT_FOUND,
//           description: ResponseDescription.BOOKING_NOT_FOUND,
//           data: null,
//         });
//       }

//       // Check if user is authorized to cancel this booking
//       if (
//         !req.user.isAdmin &&
//         booking.userId.toString() !== req.user._id.toString()
//       ) {
//         return res.status(ResponseCode.UNAUTHORIZED).json({
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.UNAUTHORIZED,
//           description: ResponseDescription.UNAUTHORIZED,
//           data: null,
//         });
//       }

//       const cancelledBooking: any = await bookingManager.cancel(
//         req.params.id,
//         reason
//       );
//       const data = bookingResponseData(cancelledBooking);

//       const response: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.BOOKING_CANCELLED,
//         description: ResponseDescription.BOOKING_CANCELLED,
//         data: data,
//       };

//       res.status(ResponseCode.SUCCESS).json(response);
//     } catch (error) {
//       res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.INTERNAL_SERVER_ERROR,
//         description: ResponseDescription.BOOKING_CANCELLATION_FAILED,
//         data: null,
//       });
//     }
//   }

//   public async processPayment(req: Request, res: Response) {
//     try {
//       const { paymentMethod, amount } = req.body;
//       const booking = await bookingManager.getById(req.params.id);

//       if (!booking) {
//         return res.status(ResponseCode.NOT_FOUND).json({
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.NOT_FOUND,
//           description: ResponseDescription.BOOKING_NOT_FOUND,
//           data: null,
//         });
//       }

//       const updateData: UpdateQuery<IBooking> = {
//         "payment.status": "completed" as const,
//         "payment.method": paymentMethod,
//         "payment.paidAmount": amount,
//         "payment.paidAt": new Date(),
//       };

//       const updatedBooking = (await bookingManager.update(
//         req.params.id,
//         updateData
//       )) as IBooking;

//       const data = bookingResponseData(updatedBooking);

//       const response: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.PAYMENT_COMPLETED,
//         description: ResponseDescription.PAYMENT_COMPLETED,
//         data: data,
//       };

//       res.status(ResponseCode.SUCCESS).json(response);
//     } catch (error) {
//       res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.INTERNAL_SERVER_ERROR,
//         description: ResponseMessage.PAYMENT_FAILED,
//         data: null,
//       });
//     }
//   }
// }

// export default new BookingController();

// controllers/booking.controller.ts
import { Request, Response } from "express";
import axios from "axios";
import bookingManager from "../../services/booking.manager";
import roomManager from "../../services/room.manager";
import hotelManager from "../../services/hotel.manager";
import { ResponseStatus, ResponseMessage, ResponseCode } from "../../enum/response-message.enum";
import { IBooking, IBookingCreateRequest } from "../../interfaces/booking/booking.interface";
import Promocode from "../../models/promocode.model";
import { sendBookingConfirmationMail } from "../../mail/bookingConfirmation.mail";
import bookingSMSService from "../../services/bookingSMS.service";
import { createLogger } from "../../utils/logger";
import { LoggerMessages } from "../../utils/loggerMessages";
import otpService from "../../services/otp.service";

const logger = createLogger('BookingController');


export class BookingController {


    private static async verifyPhoneOTP(phone: string, otp: string): Promise<boolean> {
        try {
            logger.info('Verifying OTP', { phone });
            if (!phone || !otp) {
                logger.error('Missing phone or OTP');
                return false;
            }
            const result =  await otpService.verifyOTP(phone, otp);
            console.log("OTP verification result:", result);
            return result;
        } catch (error) {
            logger.error('Error verifying OTP', {
                error,
                phone,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    }


    public async createBooking(req: any, res: Response) {
        try {
            console.log("Creating booking with data:", req.body);
            logger.info(LoggerMessages.BOOKING.CREATE.START, {
                userId: req.user?._id,
                bookingData: req.body
            });
            const { bookingData, hotelId, roomId, roomData, discountedBookings, otp } = req.body;
            console.log("Booking data:", bookingData);

            // isCouponApplied: {
            //     type: Boolean,
            //     default: false
            // },
            // couponCode: {
            //     type: Schema.Types.ObjectId,
            //     ref: "PromoCode"
            // },
            
            // couponDiscount: Number,

            // if ( bookingData) {
            //     return res.status(ResponseCode.BAD_REQUEST).json({
            //         status: ResponseStatus.FAILED,
            //         message: "Invalid booking data"
            //     });
            // }

                // Verify OTP before proceeding with booking
                const isOTPValid = await BookingController.verifyPhoneOTP(bookingData.MobileNo, otp);

                console.log("isOTPValid:", isOTPValid);
            
                if (!isOTPValid) {
                    return res.status(ResponseCode.BAD_REQUEST).json({
                        status: ResponseStatus.FAILED,
                        message: "Invalid or expired OTP. Please verify your phone number first."
                    });
                }
    
                logger.info(LoggerMessages.BOOKING.CREATE.START, {
                    userId: req.user?._id,
                    bookingData: req.body
                });

            // Validate hotel and room
            const hotel = await hotelManager.getById(hotelId);
            console.log("Hotel:", hotel);
            console.log("Room:", roomData);
            // const room = await roomManager.getById(roomId);

            if (!hotel || !roomData) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: "Invalid hotel or room ID"
                });
            }

            // Create IPMS booking
            const formData = new URLSearchParams();
            formData.append("BookingData", JSON.stringify(bookingData));
            formData.append("HotelCode", hotel.hotelCode);
            formData.append("APIKey", process.env.IPMS_API_KEY as string);

            console.log("IPMS request data:", formData);

            // console.log("IPMS API URL:", `${process.env.IPMS_API_URL}/listing.php?request_type=InsertBooking`);
            // https://live.ipms247.com/booking/reservation_api/listing.php?request_type=InsertBooking
            const ipmsResponse = await axios.post(
                `https://live.ipms247.com/booking/reservation_api/listing.php?request_type=InsertBooking`,
                formData,
                {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                }
            );

            console.log("IPMS response.data:", ipmsResponse.data);

            // const data = {
            //   ReservationNo: 'SR18456',
            //   SubReservationNo: [ 'SR18456' ],
            //   Inventory_Mode: 'REGULAR',
            //   lang_key: 'en'
            // }

            // const ipmsResponse = { data };

            // console.log("IPMS response:", ipmsResponse.data);

            if (!ipmsResponse.data.ReservationNo) {
                throw new Error("Failed to get reservation number from IPMS");
            }

            // Calculate stay duration
            const checkIn = new Date(bookingData.check_in_date);
            const checkOut = new Date(bookingData.check_out_date);
            const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            const initialStatus = bookingData.Booking_Payment_Mode === 'pay_on_visit' 
            ? 'confirmed' 
            : 'pending';
            // Prepare local booking data
            const localBookingData: IBookingCreateRequest = {
                userId: req?.user?._id || null,
                hotelId,
                hotelCode: hotel.hotelCode,
                roomId: roomData.roomtypeunkid,
                roomDetails: {
                    roomTypeId: bookingData.Room_Details.Room_1.Roomtype_Id,
                    rateplanId: bookingData.Room_Details.Room_1.Rateplan_Id,
                    ratetypeId: bookingData.Room_Details.Room_1.Ratetype_Id,
                    roomName: roomData.Room_Name,
                    roomType: roomData.Roomtype_Name
                },
                guestDetails: {
                    title: bookingData.Room_Details.Room_1.Title,
                    firstName: bookingData.Room_Details.Room_1.First_Name,
                    lastName: bookingData.Room_Details.Room_1.Last_Name,
                    email: bookingData.Email_Address,
                    phone: bookingData.MobileNo,
                    gender: bookingData.Room_Details.Room_1.Gender,
                    address: {
                        street: bookingData.Address,
                        city: bookingData.City,
                        state: bookingData.State,
                        country: bookingData.Country,
                        zipCode: bookingData.Zipcode
                    }
                },
                checkIn,
                checkOut,
                numberOfNights,
                guests: {
                    adults: parseInt(bookingData.Room_Details.Room_1.number_adults),
                    children: parseInt(bookingData.Room_Details.Room_1.number_children || "0"),
                    extraAdults: 0,
                    extraChildren: 0
                },
                pricing: {
                    baseRate: parseFloat(bookingData.Room_Details.Room_1.baserate),
                    extraAdultRate: parseFloat(bookingData.Room_Details.Room_1.extradultrate || "0"),
                    extraChildRate: parseFloat(bookingData.Room_Details.Room_1.extrachildrate || "0"),
                    taxAmount: Object.values(roomData.room_rates_info.tax).reduce((acc:any, tax:any) => acc + parseFloat(tax), 0) as number,
                    totalAmount: parseFloat(discountedBookings.length > 0 ? discountedBookings[0].discountedPrice : roomData.room_rates_info.totalprice_inclusive_all),
                    currency: "INR"
                },
                status: initialStatus,
                payment: {
                    status: "pending",
                    mode: bookingData.Booking_Payment_Mode,
                    paidAmount: 0
                },
                paymentWindow: {
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes to pay
                  },
                thirdPartyData: {
                    inventoryMode: ipmsResponse.data.Inventory_Mode,
                    languageKey: ipmsResponse.data.lang_key,
                    responseData: bookingData,
                    apiResponse: ipmsResponse.data
                },
                thirdPartyReservationNo: ipmsResponse.data.ReservationNo,
                subReservationNumbers: ipmsResponse.data.SubReservationNo,
                createdBy: req?.user?._id || null,
                updatedBy: req?.user?._id || null
            };

console.log("discountedBookings[0]?.couponCode", discountedBookings[0]?.couponCode);

            if (discountedBookings[0]?.couponCode) {

                const promocode:any = await Promocode.findOne({ 
                    code: discountedBookings[0]?.couponCode.toUpperCase(),
                    // roomType,
                    isActive: true,
                    // validFrom: { $lte: new Date() },
                    // validTo: { $gte: new Date() }
                });
                console.log("Promocode:", promocode);

                // pricing: {
                //     baseRate: {
                //         type: Number,
                //         required: true
                //     },
                //     extraAdultRate: Number,
                //     extraChildRate: Number,
                //     taxAmount: {
                //         type: Number,
                //         required: true
                //     },
                //     discountAmount: Number,
                //     cleaningFee: Number,
                //     promotionCode: String,
                //     totalAmount: {
                //         type: Number,
                //         required: true
                //     },
                //     currency: {
                //         type: String,
                //         default: "INR"
                //     },
                //     isCouponApplied: {
                //         type: Boolean,
                //         default: false
                //     },
                //     couponCode: {
                //         type: Schema.Types.ObjectId,
                //         ref: "PromoCode"
                //     },
                    
                //     couponDiscount: Number,


                if (promocode) {
                    localBookingData.pricing.isCouponApplied = true;
                    localBookingData.pricing.promotionCode = discountedBookings[0].couponCode;
                    localBookingData.pricing.promocodeId = promocode._id;
                    localBookingData.pricing.discountAmount = discountedBookings[0].discount;
                }
            



                
               
            }

            console.log("Local booking data:", localBookingData);




            // Save booking to local database
            const newBooking = await bookingManager.create(localBookingData);
            logger.info(LoggerMessages.BOOKING.CREATE.SUCCESS, {
                bookingNumber: newBooking.bookingNumber,
                userId: req.user?._id
            });
    

            if (bookingData.Booking_Payment_Mode === 'pay_on_visit') {

            // Send notifications
            const notificationPromises = [];
    
            // Send email if email is provided
            if (localBookingData.guestDetails.email) {
                logger.info(LoggerMessages.BOOKING.NOTIFICATION.EMAIL.START, {
                    bookingNumber: newBooking.bookingNumber,
                    email: localBookingData.guestDetails.email
                });
    
                notificationPromises.push(
                    sendBookingConfirmationMail(newBooking)
                        .then(success => {
                            if (success) {
                                logger.info(LoggerMessages.BOOKING.NOTIFICATION.EMAIL.SUCCESS, {
                                    bookingNumber: newBooking.bookingNumber,
                                    email: localBookingData.guestDetails.email
                                });
                            } else {
                                throw new Error('Email sending returned false');
                            }
                        })
                        .catch(error => {
                            logger.error(LoggerMessages.BOOKING.NOTIFICATION.EMAIL.FAIL, {
                                error,
                                bookingNumber: newBooking.bookingNumber,
                                email: localBookingData.guestDetails.email,
                                stack: error.stack
                            });
                        })
                );
            }
    
            // Send SMS if phone is provided
            if (localBookingData.guestDetails.phone) {
                logger.info(LoggerMessages.BOOKING.NOTIFICATION.SMS.START, {
                    bookingNumber: newBooking.bookingNumber,
                    phone: localBookingData.guestDetails.phone
                });
    
                notificationPromises.push(
                    bookingSMSService.sendBookingConfirmation(newBooking)
                        .then(success => {
                            if (success) {
                                logger.info(LoggerMessages.BOOKING.NOTIFICATION.SMS.SUCCESS, {
                                    bookingNumber: newBooking.bookingNumber,
                                    phone: localBookingData.guestDetails.phone
                                });
                            } else {
                                throw new Error('SMS sending returned false');
                            }
                        })
                        .catch((error:any) => {
                            logger.error(LoggerMessages.BOOKING.NOTIFICATION.SMS.FAIL, {
                                error,
                                bookingNumber: newBooking.bookingNumber,
                                phone: localBookingData.guestDetails.phone,
                                stack: error.stack
                            });
                        })
                );
            }
    
            // Wait for notifications but don't block response
            Promise.all(notificationPromises).catch(error => {
                logger.error('Error in notification promises', {
                    error,
                    bookingNumber: newBooking.bookingNumber,
                    stack: error.stack
                });
            });
        }


            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {
                    booking: newBooking,
                    reservationNumber: ipmsResponse.data.ReservationNo,
                    paymentExpiry: newBooking.paymentWindow.expiresAt
                }
            });

        } catch (error) {
            console.error("Booking creation error:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getBookings(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortField = req.query.sortField as string || 'createdAt';
            const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
            const status = req.query.status as string;
            const hotelId = req.query.hotelId as string;
            const search = req.query.search as string;

            // Build filters
            const filters: Record<string, any> = {};

            if (status) {
                filters.status = status;
            }

            if (hotelId) {
                filters.hotelId = hotelId;
            }

            if (search) {
                filters.$or = [
                    { bookingNumber: { $regex: search, $options: 'i' } },
                    { thirdPartyReservationNo: { $regex: search, $options: 'i' } },
                    { 'guestDetails.firstName': { $regex: search, $options: 'i' } },
                    { 'guestDetails.lastName': { $regex: search, $options: 'i' } },
                    { 'guestDetails.email': { $regex: search, $options: 'i' } },
                    { 'guestDetails.phone': { $regex: search, $options: 'i' } }
                ];
            }

            const result = await bookingManager.getAll(filters, page, limit, sortField, sortOrder);

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {
                    bookings: result.bookings,
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        pages: Math.ceil(result.total / limit)
                    }
                }
            });

        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getBookingByNumber(req: Request, res: Response) {
      try {
          const booking = await bookingManager.getByBookingNumber(req.params.bookingNumber);

          if (!booking) {
              return res.status(ResponseCode.NOT_FOUND).json({
                  status: ResponseStatus.FAILED,
                  message: ResponseMessage.NOT_FOUND
              });
          }

          res.status(ResponseCode.SUCCESS).json({
              status: ResponseStatus.SUCCESS,
              message: ResponseMessage.SUCCESS,
              data: booking
          });

      } catch (error) {
          console.error("Error fetching booking:", error);
          res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
              status: ResponseStatus.FAILED,
              message: ResponseMessage.INTERNAL_SERVER_ERROR,
              error: error instanceof Error ? error.message : "Unknown error"
          });
      }
  }

  public async getBookingStatus(req: Request, res: Response) {
      try {
          const { reservationNo } = req.params;
          
          if (!reservationNo) {
              return res.status(ResponseCode.BAD_REQUEST).json({
                  status: ResponseStatus.FAILED,
                  message: "Reservation number is required"
              });
          }

          // Get status from IPMS
          const queryParams = new URLSearchParams({
              request_type: "BookingStatus",
              ReservationNo: reservationNo,
              APIKey: process.env.IPMS_API_KEY as string
          });

          const ipmsResponse = await axios.get(
              `${process.env.IPMS_API_URL}/listing.php?${queryParams}`
          );

          // Get and update local booking if needed
          const localBooking = await bookingManager.getByReservationNo(reservationNo);
          
          if (localBooking && ipmsResponse.data.status && 
              ipmsResponse.data.status !== localBooking.status) {
              await bookingManager.updateStatus(localBooking._id, ipmsResponse.data.status);
          }

          res.status(ResponseCode.SUCCESS).json({
              status: ResponseStatus.SUCCESS,
              message: ResponseMessage.SUCCESS,
              data: {
                  ipmsStatus: ipmsResponse.data,
                  localBooking: localBooking
              }
          });

      } catch (error) {
          console.error("Error fetching booking status:", error);
          res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
              status: ResponseStatus.FAILED,
              message: ResponseMessage.INTERNAL_SERVER_ERROR,
              error: error instanceof Error ? error.message : "Unknown error"
          });
      }
  }

  public async cancelBooking(req: Request, res: Response) {
      try {
          const { reservationNo } = req.params;
          const { reason } = req.body;

          if (!reservationNo || !reason) {
              return res.status(ResponseCode.BAD_REQUEST).json({
                  status: ResponseStatus.FAILED,
                  message: "Reservation number and reason are required"
              });
          }

          // Cancel in IPMS first
          const formData = new URLSearchParams({
              request_type: "CancelBooking",
              ReservationNo: reservationNo,
              APIKey: process.env.IPMS_API_KEY as string,
              CancellationReason: reason
          });

          const ipmsResponse = await axios.post(
              `${process.env.IPMS_API_URL}/listing.php`,
              formData,
              {
                  headers: { "Content-Type": "application/x-www-form-urlencoded" }
              }
          );

          // Update local booking
          const localBooking = await bookingManager.getByReservationNo(reservationNo);
          let updatedBooking = null;
          
          if (localBooking) {
              updatedBooking = await bookingManager.cancel(localBooking._id, reason);
          }

          res.status(ResponseCode.SUCCESS).json({
              status: ResponseStatus.SUCCESS,
              message: ResponseMessage.SUCCESS,
              data: {
                  ipmsResponse: ipmsResponse.data,
                  localBooking: updatedBooking
              }
          });

      } catch (error) {
          console.error("Error cancelling booking:", error);
          res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
              status: ResponseStatus.FAILED,
              message: ResponseMessage.INTERNAL_SERVER_ERROR,
              error: error instanceof Error ? error.message : "Unknown error"
          });
      }
  }

  public async getUserBookings(req: any, res: Response) {
      try {
          const bookings = await bookingManager.getByUserId(req.user._id);

          res.status(ResponseCode.SUCCESS).json({
              status: ResponseStatus.SUCCESS,
              message: ResponseMessage.SUCCESS,
              data: bookings
          });

      } catch (error) {
          console.error("Error fetching user bookings:", error);
          res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
              status: ResponseStatus.FAILED,
              message: ResponseMessage.INTERNAL_SERVER_ERROR,
              error: error instanceof Error ? error.message : "Unknown error"
          });
      }
  }

  public async updatePaymentStatus(req: any, res: Response) {
      try {
          const { bookingNumber } = req.params;
          const { status, transactionId, amount } = req.body;

          if (!bookingNumber || !status || !amount) {
              return res.status(ResponseCode.BAD_REQUEST).json({
                  status: ResponseStatus.FAILED,
                  message: "Booking number, status and amount are required"
              });
          }

          const updatedBooking = await bookingManager.updatePayment(bookingNumber, {
              status,
              transactionId,
              amount,
              paymentDate: new Date()
          });

          if (!updatedBooking) {
              return res.status(ResponseCode.NOT_FOUND).json({
                  status: ResponseStatus.FAILED,
                  message: "Booking not found"
              });
          }

          res.status(ResponseCode.SUCCESS).json({
              status: ResponseStatus.SUCCESS,
              message: ResponseMessage.SUCCESS,
              data: updatedBooking
          });

      } catch (error) {
          console.error("Error updating payment status:", error);
          res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
              status: ResponseStatus.FAILED,
              message: ResponseMessage.INTERNAL_SERVER_ERROR,
              error: error instanceof Error ? error.message : "Unknown error"
          });
      }
  }
  
}

export default new BookingController();