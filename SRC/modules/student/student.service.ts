import { prisma } from "../../lib/prisma";

const createBookingIntoDB = async (studentId: string, payload: any) => {
  const { tutorId, slotId, date, totalPrice } = payload;


  const slotDetails = await prisma.availability.findUnique({
    where: { id: slotId },
  });

  if (!slotDetails || slotDetails.tutorId !== tutorId) {
    throw new Error('Invalid slot selected for this tutor!');
  }


  const result = await prisma.booking.create({
    data: {
      studentId,
      tutorId,
      date: new Date(date),
      slot: `${slotDetails.day}: ${slotDetails.startTime} - ${slotDetails.endTime}`,
      totalPrice,

    },
  });

  return result;
};

const getMyBookingsFromDB = async (studentId: string) => {
  const result = await prisma.booking.findMany({
    where: { studentId },
    include: {
      tutor: {
        include: { user: { select: { name: true } } }
      }
    }
  });
  return result;
};

const createReviewIntoDB = async (studentId: string, payload: any) => {
  const { tutorId, bookingId, rating, comment } = payload;


  const isBookingValid = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!isBookingValid || isBookingValid.studentId !== studentId) {
    throw new Error('You are not authorized to review this session!');
  }


  const result = await prisma.$transaction(async (tx) => {

    const newReview = await tx.review.create({
      data: {
        studentId,
        tutorId,
        bookingId,
        rating: Number(rating),
        comment,
      },
    });


    const stats = await tx.review.aggregate({
      where: { tutorId },
      _avg: { rating: true },
    });

    await tx.tutorProfile.update({
      where: { id: tutorId },
      data: {
        rating: stats._avg.rating || 0,
      },
    });

    return newReview;
  });

  return result;
};

const getStudentDashboardStats = async (userId: string) => {
  const stats = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { bookings: true, reviews: true }
      },
      bookings: {
        take: 5,
        orderBy: { date: 'desc' },
        include: { tutor: { include: { user: { select: { name: true } } } } }
      }
    }
  });

  return stats;
};

export const StudentService = {
  createBookingIntoDB,
  getMyBookingsFromDB,
  createReviewIntoDB,
  getStudentDashboardStats
};