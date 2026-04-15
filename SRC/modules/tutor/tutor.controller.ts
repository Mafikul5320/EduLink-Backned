import { Request, Response } from 'express';
import { TutorService } from './tutor.service';

const createCategory = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        messgae: "valid Category name"
      })
    }
    const result = await TutorService.createCategoryIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: 'Category created successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await TutorService.getAllCategoriesFromDB();
    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setupProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const tutorData = req.body;
    console.log(userId, tutorData)

    const result = await TutorService.setupTutorProfileIntoDB(userId as string, tutorData);

    res.status(200).json({
      success: true,
      message: 'Tutor profile setup completed and role updated to TUTOR',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to setup tutor profile',
    });
  }
};

const manageAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await TutorService.setAvailabilityIntoDB(userId!, req.body.slots);

    res.status(200).json({
      success: true,
      message: 'Availability slots updated successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getDashboardData = async (req: Request, res: Response) => {
  try {
    const result = await TutorService.getTutorDashboardDataFromDB(req.user?.id!);
    res.status(200).json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const result = await TutorService.updateTutorProfileInDB(req.user?.id!, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const TutorController = {
  createCategory,
  getAllCategories,
  setupProfile,
  manageAvailability,
  getDashboardData,
  updateProfile
};