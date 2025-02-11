import express from "express";
import userRouter from "./routes/user.route";
import hotelRouter from "./routes/hotel.routes";
import roomRouter from "./routes/room.routes";
import reviewRouter from "./routes/review.routes";
import bookingRouter from "./routes/booking.routes";
import amenityRouter from "./routes/amenity.routes";
import promocodeRouter from "./routes/promocode.routes";
import dashboardRouter from "./routes/dashboard.routes";
import paymentRouter from "./routes/payment.routes";
import blogRouter from "./routes/blog.routes";
import eventCategoryRouter from "./routes/eventCategory.routes";
import banquetHallRouter from "./routes/banquetHall.routes";
import headerRoutes from './routes/header.routes';
import featureHotelRouter from './routes/featured-hotel.routes';

const router = express.Router();

router.use("/user", userRouter);
router.use("/hotels", hotelRouter);
router.use("/room", roomRouter);
router.use("/review", reviewRouter);
router.use("/bookings", bookingRouter);
router.use("/amenities", amenityRouter);
router.use("/promocodes", promocodeRouter);
router.use("/dashboard", dashboardRouter);
router.use("/payments", paymentRouter);
router.use("/blog", blogRouter);
router.use("/events", eventCategoryRouter);
router.use("/banquet-halls", banquetHallRouter);
router.use("/header", headerRoutes);
router.use("/featured-hotels", featureHotelRouter);


export default router;
