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

const setupTutorProfileIntoDB = async (userId: string, tutorData: any) => {
  const isTutorExists = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (isTutorExists) {
    throw new Error('You are already a tutor!');
  }

  const result = await prisma.$transaction(async (tx) => {
    const newProfile = await tx.tutorProfile.create({
      data: {
        userId: userId,
        bio: tutorData.bio,
        pricePerHour: tutorData.pricePerHour,
        subjects: tutorData.subjects,
        categoryId: tutorData.categoryId,
      },
    });


    await tx.user.update({
      where: { id: userId },
      data: { role: 'TUTOR' },
    });

    return newProfile;
  });

  return result;
};

const setAvailabilityIntoDB = async (userId: string, slots: { day: string, startTime: string, endTime: string }[]) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!tutor) {
    throw new Error('Tutor profile not found. Please setup profile first.');
  }

  const result = await prisma.availability.createMany({
    data: slots.map((slot) => ({
      ...slot,
      tutorId: tutor.id,
    })),
  });

  return result;
};

const getTutorDashboardDataFromDB = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tutorProfile: {
        include: {
          _count: { select: { bookings: true, reviews: true } },
          bookings: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { student: { select: { name: true, image: true } } }
          }
        }
      }
    }
  });
  return result;
};

const updateTutorProfileInDB = async (userId: string, payload: any) => {
  const { name, image, bio, pricePerHour, subjects } = payload;

  const result = await prisma.$transaction(async (tx) => {

    await tx.user.update({
      where: { id: userId },
      data: { name, image }
    });


    const updatedProfile = await tx.tutorProfile.update({
      where: { userId },
      data: { bio, pricePerHour, subjects }
    });

    return updatedProfile;
  });

  return result;
};


const getAllTutorsFromDB = async (query: any) => {
  const { searchTerm, categoryId, minPrice, maxPrice, sortBy, sortOrder } = query;

  const whereConditions: any = {};


  if (searchTerm) {
    whereConditions.OR = [
      { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
      { subjects: { hasSome: [searchTerm] } },
    ];
  }


  if (categoryId) {
    whereConditions.categoryId = categoryId;
  }


  if (minPrice || maxPrice) {
    whereConditions.pricePerHour = {
      gte: Number(minPrice) || 0,
      lte: Number(maxPrice) || 100000,
    };
  }


  const result = await prisma.tutorProfile.findMany({
    where: whereConditions,
    include: {
      user: { select: { name: true, image: true } },
      category: true,
    },
    orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { rating: 'desc' },
  });

  return result;
};


const getSingleTutorFromDB = async (id: string) => {
  const result = await prisma.tutorProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, image: true, email: true } },
      category: true,
      availabilities: true,
      reviews: {
        include: { student: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return result;
};

export const TutorService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  setupTutorProfileIntoDB,
  setAvailabilityIntoDB,
  getTutorDashboardDataFromDB,
  updateTutorProfileInDB,
  getAllTutorsFromDB,
  getSingleTutorFromDB
};