import { NextFunction, Request, Response } from 'express';
import { TutorService } from './tutor.service';

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: 'Valid category name is required' });
    }
    const result = await TutorService.createCategoryIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TutorService.getAllCategoriesFromDB();
    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const setupProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const tutorData = req.body;
    const result = await TutorService.setupTutorProfileIntoDB(userId as string, tutorData);
    res.status(201).json({
      success: true,
      message: 'Tutor profile setup completed and role updated to TUTOR',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const manageAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const result = await TutorService.setAvailabilityIntoDB(userId!, req.body.slots);
    res.status(201).json({
      success: true,
      message: 'Availability slots updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TutorService.getTutorDashboardDataFromDB(req.user?.id!);
    res.status(200).json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TutorService.updateTutorProfileInDB(req.user?.id!, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTutors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TutorService.getAllTutorsFromDB(req.query);
    res.status(200).json({
      success: true,
      message: 'Tutors fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await TutorService.getSingleTutorFromDB(id as string);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Tutor details fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTutorProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TutorService.getAllTutorProfilesFromDB();
    res.status(200).json({
      success: true,
      message: 'All tutor profiles fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createTutorProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const tutorData = req.body;
    const result = await TutorService.createTutorProfileInDB(userId as string, tutorData);
    res.status(201).json({
      success: true,
      message: 'Tutor profile created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const TutorController = {
  createCategory,
  getAllCategories,
  setupProfile,
  manageAvailability,
  getDashboardData,
  updateProfile,
  getAllTutors,
  getSingleTutor,
  getAllTutorProfiles,
  createTutorProfile,
};