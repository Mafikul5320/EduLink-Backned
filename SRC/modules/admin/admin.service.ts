import { prisma } from "../../lib/prisma";

const getAdminDashboardStatsFromDB = async () => {
  const totalUsers = await prisma.user.count();
  const totalTutors = await prisma.tutorProfile.count();
  const totalBookings = await prisma.booking.count();
  const totalRevenue = await prisma.booking.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { totalPrice: true }
  });

  return {
    totalUsers,
    totalTutors,
    totalStudents: totalUsers - totalTutors,
    totalBookings,
    totalRevenue: totalRevenue._sum.totalPrice || 0
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

export const AdminService = {
  getAdminDashboardStatsFromDB,
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllBookingsFromDB
};