import { prisma } from "../../lib/prisma";
import { IPaymentInitPayload, ISSLCommerzCallbackPayload } from "./payment.interface";
import SSLCommerzPayment from "sslcommerz-lts";
import crypto from "crypto";


const STORE_ID = process.env.STORE_ID!;
const STORE_PASSWORD = process.env.STORE_PASSWORD!;

const IS_LIVE = process.env.PAYMENT_MODE === "LIVE"; // Will be false by default

const BACKEND_URL = process.env.NODE_ENV === "production"
  ? (process.env.PROD_BACKEND_URL || process.env.APP_URL || "https://assignment-4-backend-liart.vercel.app")
  : (process.env.APP_URL || "http://localhost:5000");

const FRONTEND_URL = process.env.NODE_ENV === "production"
  ? (process.env.PROD_FRONTEND_URL || process.env.FRONTEND_URL || "https://assignment-4-frontend-red.vercel.app")
  : (process.env.FRONTEND_URL || "http://localhost:3000");

console.log("💳 Payment Configuration:");
console.log("- Environment:", process.env.NODE_ENV);
console.log("- Backend URL:", BACKEND_URL);
console.log("- Frontend URL:", FRONTEND_URL);
console.log("- SSLCommerz Mode:", IS_LIVE ? "LIVE ⚠️" : "SANDBOX ✅");
console.log("- Payment Mode Setting:", process.env.PAYMENT_MODE || "Not Set (Defaults to SANDBOX)");

/**
 * Generate a unique transaction ID using crypto
 */
const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(8).toString("hex");
  return `EDZ-${timestamp}-${randomPart}`.toUpperCase();
};


const initiatePayment = async (studentId: string, payload: IPaymentInitPayload) => {
  console.log("🚀 Starting payment initiation...");
  console.log("📋 Payload:", payload);

  // Validate SSLCommerz credentials
  if (!STORE_ID || !STORE_PASSWORD) {
    console.error("❌ Missing SSLCommerz credentials!");
    throw new Error("Payment gateway not configured. Please contact support.");
  }

  console.log("🔑 SSLCommerz Credentials:");
  console.log("- Store ID:", STORE_ID);
  console.log("- Password Length:", STORE_PASSWORD?.length);
  console.log("- Mode:", IS_LIVE ? "LIVE" : "SANDBOX");

  // Validate the tutor exists
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: payload.tutorId },
    include: { user: { select: { name: true } } },
  });

  if (!tutor) {
    console.error("❌ Tutor not found:", payload.tutorId);
    throw new Error("Tutor not found");
  }

  console.log("✅ Tutor found:", tutor.user.name);

  // Generate a unique transaction ID
  const transactionId = generateTransactionId();
  console.log("🔖 Generated Transaction ID:", transactionId);

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

  console.log("✅ Booking created:", booking.id);

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
    cus_name: payload.studentName || "Student",
    cus_email: payload.studentEmail || "student@example.com",
    cus_add1: payload.studentAddress || "Dhaka, Bangladesh",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: payload.studentPhone || "01700000000",
    cus_fax: "01700000000",
  };

  console.log("💳 Initiating SSLCommerz Payment:");
  console.log("- Transaction ID:", transactionId);
  console.log("- Amount:", payload.amount);
  console.log("- Success URL:", sslData.success_url);
  console.log("- Fail URL:", sslData.fail_url);
  console.log("- Cancel URL:", sslData.cancel_url);

  // Initialize SSLCommerz payment session
  const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
  
  try {
    console.log("📡 Calling SSLCommerz API...");
    const apiResponse = await sslcz.init(sslData);
    
    console.log("📥 SSLCommerz Full Response:", JSON.stringify(apiResponse, null, 2));

    // Check for GatewayPageURL in response
    if (apiResponse?.GatewayPageURL) {
      console.log("✅ Payment gateway URL received:", apiResponse.GatewayPageURL);
      return {
        gatewayUrl: apiResponse.GatewayPageURL,
        transactionId,
        bookingId: booking.id,
      };
    } 
    
    // Check alternative response format
    if (apiResponse?.status === "SUCCESS" && apiResponse?.data) {
      console.log("✅ Payment gateway URL (alt format):", apiResponse.data);
      return {
        gatewayUrl: apiResponse.data,
        transactionId,
        bookingId: booking.id,
      };
    }
    
    // Handle specific error cases
    if (apiResponse?.status === "FAILED") {
      console.error("❌ SSLCommerz returned FAILED status");
      console.error("Reason:", apiResponse.failedreason);
      
      // Cleanup booking
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "FAILED" },
      });
      
      // Get the failure reason as a string
      const failReason = String(apiResponse.failedreason || "Unknown error");
      
      // Provide specific error messages
      if (failReason.includes("Store Credential")) {
        throw new Error(
          "Payment gateway configuration error. " +
          "You are using SANDBOX credentials in LIVE mode. " +
          "Please either: 1) Get LIVE credentials from SSLCommerz, or 2) Set PAYMENT_MODE to SANDBOX in environment variables."
        );
      }
      
      throw new Error(`Payment initialization failed: ${failReason}`);
    }
    
    // If we get here, the response format is unexpected
    console.error("❌ SSLCommerz Init Failed - Unexpected response format");
    console.error("Response:", apiResponse);
    
    // Cleanup: mark the booking as FAILED if SSLCommerz init fails
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "FAILED" },
    });
    
    throw new Error("Failed to initialize payment: Unexpected response from payment gateway");
  } catch (error: any) {
    console.error("❌ SSLCommerz Init Error:", error);
    console.error("Error details:", error.message);
    
    // Cleanup: mark the booking as FAILED
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "FAILED" },
    });
    
    // Provide more helpful error message
    if (error.message?.includes("ENOTFOUND") || error.message?.includes("getaddrinfo")) {
      throw new Error("Cannot connect to payment gateway. Please check your internet connection.");
    }
    
    if (error.message?.includes("unauthorized") || error.message?.includes("401")) {
      throw new Error("Invalid payment gateway credentials. Please contact support.");
    }
    
    throw new Error(error.message || "Failed to initialize payment session");
  }
};


const handlePaymentSuccess = async (payload: ISSLCommerzCallbackPayload) => {
  const { tran_id, val_id, status } = payload;

  console.log("💳 Processing Payment Success:");
  console.log("- Transaction ID:", tran_id);
  console.log("- Validation ID:", val_id);
  console.log("- Status:", status);

  // Find the booking by transactionId
  const booking = await prisma.booking.findUnique({
    where: { transactionId: tran_id },
  });

  if (!booking) {
    console.error(" Booking not found for transaction:", tran_id);
    throw new Error("Booking not found for this transaction");
  }

  console.log(" Booking found:", booking.id, "- Current status:", booking.status);

  // Already processed
  if (booking.status === "PAID") {
    console.log(" Payment already processed");
    return booking;
  }

  try {
    // Validate the transaction with SSLCommerz
    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const validationResponse = await sslcz.validate({ val_id });

    console.log(" SSLCommerz Validation Response:", validationResponse);

    if (validationResponse.status === "VALID" || validationResponse.status === "VALIDATED") {
      // Update booking status to PAID
      const updatedBooking = await prisma.booking.update({
        where: { transactionId: tran_id },
        data: { status: "PAID" },
      });
      console.log(" Booking updated to PAID:", updatedBooking.id);
      return updatedBooking;
    } else {
      // Validation failed — mark as FAILED
      console.error(" Payment validation failed:", validationResponse);
      await prisma.booking.update({
        where: { transactionId: tran_id },
        data: { status: "FAILED" },
      });
      throw new Error("Payment validation failed");
    }
  } catch (error) {
    console.error(" Error during payment validation:", error);
    throw error;
  }
};

const handlePaymentFail = async (transactionId: string) => {
  console.log("Processing Payment Fail for:", transactionId);

  const booking = await prisma.booking.findUnique({
    where: { transactionId },
  });

  if (!booking) {
    console.error(" Booking not found for transaction:", transactionId);
    throw new Error("Booking not found for this transaction");
  }

  console.log(" Booking found:", booking.id, "- Current status:", booking.status);

  const updatedBooking = await prisma.booking.update({
    where: { transactionId },
    data: { status: "FAILED" },
  });

  console.log(" Booking updated to FAILED:", updatedBooking.id);
  return updatedBooking;
};


const handlePaymentCancel = async (transactionId: string) => {
  console.log(" Processing Payment Cancel for:", transactionId);
  
  const booking = await prisma.booking.findUnique({
    where: { transactionId },
  });

  if (!booking) {
    console.error(" Booking not found for transaction:", transactionId);
    throw new Error("Booking not found for this transaction");
  }

  console.log(" Booking found:", booking.id, "- Current status:", booking.status);

  const updatedBooking = await prisma.booking.update({
    where: { transactionId },
    data: { status: "CANCELLED" },
  });

  console.log("Booking updated to CANCELLED:", updatedBooking.id);
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
