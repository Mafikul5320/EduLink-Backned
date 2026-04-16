import { NextFunction, Request, Response } from "express";
import { StudentService } from "./student.service";

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user?.id;
        const result = await StudentService.createBookingIntoDB(studentId!, req.body);
        res.status(201).json({
            success: true,
            message: 'Tutor booked successfully!',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StudentService.getMyBookingsFromDB(req.user?.id!);
        res.status(200).json({
            success: true,
            message: 'Bookings fetched successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user?.id;
        const result = await StudentService.createReviewIntoDB(studentId!, req.body);
        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StudentService.getStudentDashboardStats(req.user?.id!);
        res.status(200).json({
            success: true,
            message: 'Student dashboard data fetched',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const result = await StudentService.updateStudentProfileInDB(userId!, req.body);
        res.status(200).json({
            success: true,
            message: 'Student profile updated successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const StudentController = {
    createBooking,
    getMyBookings,
    createReview,
    getDashboardData,
    updateProfile,
};