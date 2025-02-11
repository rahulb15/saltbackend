// controllers/dashboard.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Booking from "../../models/booking.model";
import { ResponseStatus, ResponseMessage, ResponseCode } from "../../enum/response-message.enum";

export class DashboardController {
    public async getStats(req: Request, res: Response) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const lastMonth = new Date(today);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            
            const previousMonth = new Date(lastMonth);
            previousMonth.setMonth(previousMonth.getMonth() - 1);

            const stats = await Booking.aggregate([
                {
                    $facet: {
                        // Today's bookings
                        todayBookings: [
                            {
                                $match: {
                                    createdAt: { $gte: today }
                                }
                            },
                            {
                                $count: "count"
                            }
                        ],
                        // Current month bookings
                        currentMonthBookings: [
                            {
                                $match: {
                                    createdAt: { $gte: lastMonth }
                                }
                            },
                            {
                                $count: "count"
                            }
                        ],
                        // Previous month bookings
                        previousMonthBookings: [
                            {
                                $match: {
                                    createdAt: {
                                        $gte: previousMonth,
                                        $lt: lastMonth
                                    }
                                }
                            },
                            {
                                $count: "count"
                            }
                        ],
                        // Total amount stats
                        totalAmount: [
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$pricing.totalAmount" },
                                    previousAmount: {
                                        $sum: {
                                            $cond: [
                                                { $and: [
                                                    { $gte: ["$createdAt", previousMonth] },
                                                    { $lt: ["$createdAt", lastMonth] }
                                                ]},
                                                "$pricing.totalAmount",
                                                0
                                            ]
                                        }
                                    }
                                }
                            }
                        ],
                        // Customer stats
                        customerStats: [
                            {
                                $group: {
                                    _id: "$guestDetails.email",
                                    lastBooking: { $max: "$createdAt" }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalCustomers: { $sum: 1 },
                                    currentPeriodCustomers: {
                                        $sum: {
                                            $cond: [
                                                { $gte: ["$lastBooking", lastMonth] },
                                                1,
                                                0
                                            ]
                                        }
                                    },
                                    previousPeriodCustomers: {
                                        $sum: {
                                            $cond: [
                                                { $and: [
                                                    { $gte: ["$lastBooking", previousMonth] },
                                                    { $lt: ["$lastBooking", lastMonth] }
                                                ]},
                                                1,
                                                0
                                            ]
                                        }
                                    }
                                }
                            }
                        ],
                        // Revenue stats (completed bookings)
                        revenueStats: [
                            {
                                $match: {
                                    status: "completed"
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalRevenue: { $sum: "$pricing.totalAmount" },
                                    currentPeriodRevenue: {
                                        $sum: {
                                            $cond: [
                                                { $gte: ["$createdAt", lastMonth] },
                                                "$pricing.totalAmount",
                                                0
                                            ]
                                        }
                                    },
                                    previousPeriodRevenue: {
                                        $sum: {
                                            $cond: [
                                                { $and: [
                                                    { $gte: ["$createdAt", previousMonth] },
                                                    { $lt: ["$createdAt", lastMonth] }
                                                ]},
                                                "$pricing.totalAmount",
                                                0
                                            ]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ]);

            const calculateGrowthRate = (current: number, previous: number) => {
                if (previous === 0) return 0;
                return ((current - previous) / previous) * 100;
            };

            const dashboardStats = {
                todayBookings: stats[0].todayBookings[0]?.count || 0,
                totalAmount: stats[0].totalAmount[0]?.amount || 0,
                totalCustomers: stats[0].customerStats[0]?.totalCustomers || 0,
                totalRevenue: stats[0].revenueStats[0]?.totalRevenue || 0,
                growthRates: {
                    bookings: calculateGrowthRate(
                        stats[0].currentMonthBookings[0]?.count || 0,
                        stats[0].previousMonthBookings[0]?.count || 0
                    ),
                    amount: calculateGrowthRate(
                        stats[0].totalAmount[0]?.amount || 0,
                        stats[0].totalAmount[0]?.previousAmount || 0
                    ),
                    customers: calculateGrowthRate(
                        stats[0].customerStats[0]?.currentPeriodCustomers || 0,
                        stats[0].customerStats[0]?.previousPeriodCustomers || 0
                    ),
                    revenue: calculateGrowthRate(
                        stats[0].revenueStats[0]?.currentPeriodRevenue || 0,
                        stats[0].revenueStats[0]?.previousPeriodRevenue || 0
                    )
                }
            };

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: dashboardStats
            });

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getBookingTrends(req: Request, res: Response) {
        try {
            const last12Months = Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                return {
                    startDate: new Date(date.getFullYear(), date.getMonth(), 1),
                    endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
                };
            }).reverse();

            const trends = await Booking.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: last12Months[0].startDate,
                            $lte: last12Months[last12Months.length - 1].endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            status: "$status"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                }
            ]);

            const chartData = last12Months.map(({ startDate }) => {
                const year = startDate.getFullYear();
                const month = startDate.getMonth() + 1;
                
                const confirmedCount = trends.find((t:any) => 
                    t._id.year === year && 
                    t._id.month === month && 
                    t._id.status === 'confirmed'
                )?.count || 0;

                const pendingCount = trends.find((t:any) => 
                    t._id.year === year && 
                    t._id.month === month && 
                    t._id.status === 'pending'
                )?.count || 0;

                return {
                    date: startDate.toISOString(),
                    confirmed: confirmedCount,
                    pending: pendingCount
                };
            });

            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: chartData
            });

        } catch (error) {
            console.error("Error fetching booking trends:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getRevenueStats(req: Request, res: Response) {
        try {
            // Implementation for revenue statistics
            // Similar aggregation pipeline for revenue analysis
            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {}
            });
        } catch (error) {
            console.error("Error fetching revenue stats:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getCustomerStats(req: Request, res: Response) {
        try {
            // Implementation for customer statistics
            // Similar aggregation pipeline for customer analysis
            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {}
            });
        } catch (error) {
            console.error("Error fetching customer stats:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getTodayBookings(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            const sortField = req.query.sortField as string || 'createdAt';
            const sortOrder = (req.query.sortOrder as string || 'desc') === 'desc' ? -1 : 1;
    
            // Get today's date range
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
    
            // Build search filter
            const searchFilter = search ? {
                $or: [
                    { 'guestDetails.firstName': { $regex: search, $options: 'i' } },
                    { 'guestDetails.lastName': { $regex: search, $options: 'i' } },
                    { 'roomDetails.roomType': { $regex: search, $options: 'i' } }
                ]
            } : {};
    
            // Build complete filter
            const filter = {
                $and: [
                    { createdAt: { $gte: today, $lt: tomorrow } },
                    searchFilter
                ]
            };
    
            // Build sort options
            const sortOptions: any = {};
            sortOptions[sortField] = sortOrder;
    
            // Execute queries
            const [bookings, total] = await Promise.all([
                Booking.find(filter)
                    .sort(sortOptions)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('hotelId', 'name hotelCode')
                    .lean(),
                Booking.countDocuments(filter)
            ]);
    
            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {
                    bookings,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
    
        } catch (error) {
            console.error("Error fetching today's bookings:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    public async getRoomBookings(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            const sortField = req.query.sortField as string || 'createdAt';
            const sortOrder = (req.query.sortOrder as string || 'desc') === 'desc' ? -1 : 1;
            const roomId = req.query.roomId as string;
    
            // Build search filter
            const searchFilter = search ? {
                $or: [
                    { 'guestDetails.firstName': { $regex: search, $options: 'i' } },
                    { 'guestDetails.lastName': { $regex: search, $options: 'i' } },
                    { 'roomDetails.roomType': { $regex: search, $options: 'i' } },
                    { bookingNumber: { $regex: search, $options: 'i' } }
                ]
            } : {};
    
            // Build room filter
            const roomFilter = roomId ? { roomId } : {};
    
            // Combine filters
            const filter = {
                ...searchFilter,
                ...roomFilter
            };
    
            // Build sort options
            const sortOptions: any = {};
            sortOptions[sortField] = sortOrder;
    
            // Execute queries
            const [bookings, total] = await Promise.all([
                Booking.find(filter)
                    .sort(sortOptions)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('hotelId', 'name hotelCode')
                    .lean(),
                Booking.countDocuments(filter)
            ]);
    
            res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                data: {
                    bookings,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
    
        } catch (error) {
            console.error("Error fetching room bookings:", error);
            res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
}

export default new DashboardController();