import { prisma } from "../../lib/prisma";
import { IPaymentInitPayload, ISSLCommerzCallbackPayload } from "./payment.interface";
import SSLCommerzPayment from "sslcommerz-lts";
import crypto from "crypto";

// SSLCommerz configuration from environment variables
const STORE_ID = process.env.STORE_ID!;
const STORE_PASSWORD = process.env.STORE_PASSWORD!;
const IS_LIVE = process.env.NODE_ENV === "production";
const BACKEND_URL = process.env.APP_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.APP_URL || "http://localhost:3000";

/**
 * Generate a unique transaction ID using crypto
 */
const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(8).toString("hex");
  return `EDZ-${timestamp}-${randomPart}`.toUpperCase();
};


const initiatePayment = async (studentId: string, payload: IPaymentInitPayload) => {
  // Validate the tutor exists
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: payload.tutorId },
    include: { user: { select: { name: true } } },
  });

  if (!tutor) {
    throw new Error("Tutor not found");
  }

  // Generate a unique transaction ID
  const transactionId = generateTransactionId();

  // Create a PENDING booking in the database
  const booking = await prisma.booking.create({
    data: {
      studentId,
      tutorId: payload.tutorId,
      slot: payload.slot,
      date: new Date(payload.date),
      totalPrice: payload.amount,
      transactionId,
      status: "PENDING",
    },
  });

  // Prepare SSLCommerz init data
  const sslData = {
    total_amount: payload.amount,
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${BACKEND_URL}/api/payment/success`,
    fail_url: `${BACKEND_URL}/api/payment/fail`,
    cancel_url: `${BACKEND_URL}/api/payment/cancel`,
    ipn_url: `${BACKEND_URL}/api/payment/ipn`,
    shipping_method: "NO",
    product_name: `Tutor Session with ${tutor.user.name}`,
    product_category: "Education",
    product_profile: "non-physical-goods",
    cus_name: payload.studentName,
    cus_email: payload.studentEmail,
    cus_add1: payload.studentAddress || "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: payload.studentPhone || "01700000000",
  };

  // Initialize SSLCommerz payment session
  const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
  const apiResponse = await sslcz.init(sslData);

  if (apiResponse?.GatewayPageURL) {
    return {
      gatewayUrl: apiResponse.GatewayPageURL,
      transactionId,
      bookingId: booking.id,
    };
  } else {
    // Cleanup: mark the booking as FAILED if SSLCommerz init fails
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "FAILED" },
    });
    throw new Error("Failed to initialize payment session with SSLCommerz");
  }
};


const handlePaymentSuccess = async (payload: ISSLCommerzCallbackPayload) => {
  const { tran_id, val_id } = payload;

  // Find the booking by transactionId
  const booking = await prisma.booking.findUnique({
    where: { transactionId: tran_id },
  });

  if (!booking) {
    throw new Error("Booking not found for this transaction");
  }

  // Already processed
  if (booking.status === "PAID") {
    return booking;
  }

  // Validate the transaction with SSLCommerz
  const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
  const validationResponse = await sslcz.validate({ val_id });

  if (validationResponse.status === "VALID" || validationResponse.status === "VALIDATED") {
    // Update booking status to PAID
    const updatedBooking = await prisma.booking.update({
      where: { transactionId: tran_id },
      data: { status: "PAID" },
    });
    return updatedBooking;
  } else {
    // Validation failed — mark as FAILED
    await prisma.booking.update({
      where: { transactionId: tran_id },
      data: { status: "FAILED" },
    });
    throw new Error("Payment validation failed");
  }
};

const handlePaymentFail = async (transactionId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { transactionId },
  });

  if (!booking) {
    throw new Error("Booking not found for this transaction");
  }

  const updatedBooking = await prisma.booking.update({
    where: { transactionId },
    data: { status: "FAILED" },
  });

  return updatedBooking;
};


const handlePaymentCancel = async (transactionId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { transactionId },
  });

  if (!booking) {
    throw new Error("Booking not found for this transaction");
  }

  const updatedBooking = await prisma.booking.update({
    where: { transactionId },
    data: { status: "CANCELLED" },
  });

  return updatedBooking;
};


const handleIPN = async (payload: ISSLCommerzCallbackPayload) => {
  const { tran_id, val_id, status } = payload;

  const booking = await prisma.booking.findUnique({
    where: { transactionId: tran_id },
  });

  if (!booking) {
    throw new Error("Booking not found for this transaction");
  }

  // Already processed
  if (booking.status === "PAID") {
    return booking;
  }

  if (status === "VALID" || status === "VALIDATED") {
    // Validate the transaction with SSLCommerz
    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const validationResponse = await sslcz.validate({ val_id });

    if (validationResponse.status === "VALID" || validationResponse.status === "VALIDATED") {
      const updatedBooking = await prisma.booking.update({
        where: { transactionId: tran_id },
        data: { status: "PAID" },
      });
      return updatedBooking;
    }
  }

  if (status === "FAILED") {
    const updatedBooking = await prisma.booking.update({
      where: { transactionId: tran_id },
      data: { status: "FAILED" },
    });
    return updatedBooking;
  }

  if (status === "CANCELLED") {
    const updatedBooking = await prisma.booking.update({
      where: { transactionId: tran_id },
      data: { status: "CANCELLED" },
    });
    return updatedBooking;
  }

  return booking;
};

export const PaymentService = {
  initiatePayment,
  handlePaymentSuccess,
  handlePaymentFail,
  handlePaymentCancel,
  handleIPN,
};
