import { prisma } from "../../lib/prisma";

const getAdminDashboardStatsFromDB = async () => {
  const totalUsers = await prisma.user.count();
  const totalTutors = await prisma.tutorProfile.count();
  const totalBookings = await prisma.booking.count();
  const activeCategories = await prisma.category.count();

  return {
    totalUsers,
    totalTutors,
    totalStudents: totalUsers - totalTutors,
    totalBookings,
    activeCategories,
  };
};

const getAllUsersFromDB = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,

    }
  });
};

const updateUserStatusInDB = async (userId: string, status: any) => {

  return await prisma.user.update({
    where: { id: userId },
    data: { status: status as any }
  });
};

const getAllBookingsFromDB = async () => {
  return await prisma.booking.findMany({
    include: {
      student: { select: { name: true, email: true } },
      tutor: { include: { user: { select: { name: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateCategoryInDB = async (categoryId: string, name: string) => {
  return await prisma.category.update({
    where: { id: categoryId },
    data: { name }
  });
};

const deleteCategoryFromDB = async (categoryId: string) => {
  return await prisma.category.delete({
    where: { id: categoryId }
  });
};

export const AdminService = {
  getAdminDashboardStatsFromDB,
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllBookingsFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB
};