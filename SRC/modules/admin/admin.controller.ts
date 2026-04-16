import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getAdminDashboardStatsFromDB();
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getAllUsersFromDB();
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const changeUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const result = await AdminService.updateUserStatusInDB(userId as string, status);
    res.status(200).json({ success: true, message: `User is now ${status}`, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getAllBookingsFromDB();
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  changeUserStatus,
  getAllBookings
};