import { Request, Response } from "express";
import { StudentService } from "./student.service";


const createBooking = async (req: Request, res: Response) => {
    try {
        const studentId = req.user?.id;
        const result = await StudentService.createBookingIntoDB(studentId!, req.body);
        res.status(201).json({
            success: true,
            message: 'Tutor booked successfully!',
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMyBookings = async (req: Request, res: Response) => {
    try {
        const result = await StudentService.getMyBookingsFromDB(req.user?.id!);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const createReview = async (req: Request, res: Response) => {
    try {
        const studentId = req.user?.id;
        const result = await StudentService.createReviewIntoDB(studentId!, req.body);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to submit review',
        });
    }
};

const getDashboardData = async (req: Request, res: Response) => {
    try {
        const result = await StudentService.getStudentDashboardStats(req.user?.id!);
        res.status(200).json({
            success: true,
            message: 'Student dashboard data fetched',
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const StudentController = {
    createBooking,
    getMyBookings,
    createReview,
    getDashboardData
};