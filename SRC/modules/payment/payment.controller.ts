import { NextFunction, Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { ISSLCommerzCallbackPayload } from "./payment.interface";

const FRONTEND_URL = process.env.APP_URL || "http://localhost:3000";

/**
 * POST /api/payment/initiate
 * Validates request, creates PENDING booking, returns SSLCommerz GatewayPageURL
 */
const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Student not found" });
    }

    const { tutorId, slot, date, amount, studentName, studentEmail, studentPhone, studentAddress } = req.body;
    console.log(req.body)

    // Validate required fields
    if (!tutorId || !slot || !date || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: tutorId, slot, date, and amount are required",
      });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    const result = await PaymentService.initiatePayment(studentId, {
      tutorId,
      slot,
      date,
      amount,
      studentName: studentName || req.user?.name || "Student",
      studentEmail: studentEmail || req.user?.email || "student@example.com",
      studentPhone,
      studentAddress,
    });

    res.status(200).json({
      success: true,
      message: "Payment session initiated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payment/success
 * SSLCommerz redirects here on successful payment
 * Validates payment and redirects user to frontend success page
 */
const paymentSuccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body as ISSLCommerzCallbackPayload;
    await PaymentService.handlePaymentSuccess(payload);
    res.redirect(`${FRONTEND_URL}/payment/success?transactionId=${payload.tran_id}`);
  } catch (error) {
    console.error("Payment success handler error:", error);
    res.redirect(`${FRONTEND_URL}/payment/fail`);
  }
};

/**
 * POST /api/payment/fail
 * SSLCommerz redirects here on failed payment
 * Updates booking status and redirects to frontend fail page
 */
const paymentFail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tran_id } = req.body as ISSLCommerzCallbackPayload;
    await PaymentService.handlePaymentFail(tran_id);
    res.redirect(`${FRONTEND_URL}/payment/fail?transactionId=${tran_id}`);
  } catch (error) {
    console.error("Payment fail handler error:", error);
    res.redirect(`${FRONTEND_URL}/payment/fail`);
  }
};

/**
 * POST /api/payment/cancel
 * SSLCommerz redirects here on cancelled payment
 * Updates booking status and redirects to frontend cancel page
 */
const paymentCancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tran_id } = req.body as ISSLCommerzCallbackPayload;
    await PaymentService.handlePaymentCancel(tran_id);
    res.redirect(`${FRONTEND_URL}/payment/cancel?transactionId=${tran_id}`);
  } catch (error) {
    console.error("Payment cancel handler error:", error);
    res.redirect(`${FRONTEND_URL}/payment/cancel`);
  }
};

/**
 * POST /api/payment/ipn
 * Server-to-server IPN notification from SSLCommerz
 * Ensures database is updated even if user closes browser
 */
const handleIPN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body as ISSLCommerzCallbackPayload;
    await PaymentService.handleIPN(payload);
    res.status(200).json({ message: "IPN received successfully" });
  } catch (error) {
    console.error("IPN handler error:", error);
    // Always return 200 to SSLCommerz to prevent retries
    res.status(200).json({ message: "IPN received" });
  }
};

export const PaymentController = {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  handleIPN,
};
