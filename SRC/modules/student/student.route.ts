import express, { Router } from "express"
import { StudentController } from "./student.controller";
import { Middleware } from "../../middleware/auth.middleware";
import { ROLE } from "../../types/role.type";

const router: Router = express.Router()

router.post('/bookings', Middleware(ROLE.STUDENT), StudentController.createBooking);
router.get('/my-bookings', Middleware(ROLE.STUDENT), StudentController.getMyBookings);
router.post("/student/review", Middleware(ROLE.STUDENT), StudentController.createReview)
router.get("/student/dashboard", Middleware(ROLE.STUDENT), StudentController.getDashboardData)


export const StudentRouter = router;