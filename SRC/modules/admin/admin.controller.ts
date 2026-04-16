import { NextFunction, Request, Response } from "express";
import { AdminService } from "./admin.service";

const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getAdminDashboardStatsFromDB();
    res.status(200).json({ success: true, message: 'Admin dashboard data fetched', data: result });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getAllUsersFromDB();
    res.status(200).json({ success: true, message: 'Users fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

const changeUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const result = await AdminService.updateUserStatusInDB(userId as string, status);
    res.status(200).json({ success: true, message: `User status updated to ${status}`, data: result });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getAllBookingsFromDB();
    res.status(200).json({ success: true, message: 'Bookings fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  changeUserStatus,
  getAllBookings,
};