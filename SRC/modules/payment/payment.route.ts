import express, { Router } from "express";
import { PaymentController } from "./payment.controller";
import { Middleware } from "../../middleware/auth.middleware";
import { ROLE } from "../../types/role.type";

const router: Router = express.Router();


router.post("/initiate", Middleware(ROLE.STUDENT), PaymentController.initiatePayment);


router.post("/success", PaymentController.paymentSuccess);
router.post("/fail", PaymentController.paymentFail);
router.post("/cancel", PaymentController.paymentCancel);


router.post("/ipn", PaymentController.handleIPN);

export const PaymentRouter = router;
