import { Request, Response } from 'express';
import { CategoryService } from './tutor.service';

const createCategory = async (req: Request, res: Response) => {
  try {
    if(!req.body){
        return res.status(400).json({
            messgae: "valid Category name"
        })
    }
    const result = await CategoryService.createCategoryIntoDB(req.body);
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
    const result = await CategoryService.getAllCategoriesFromDB();
    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const CategoryController = {
  createCategory,
  getAllCategories,
};