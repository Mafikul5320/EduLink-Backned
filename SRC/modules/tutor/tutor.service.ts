import { prisma } from "../../lib/prisma";

const createCategoryIntoDB = async (payload: { name: string }) => {
  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany();
  return result;
};

export const CategoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
};