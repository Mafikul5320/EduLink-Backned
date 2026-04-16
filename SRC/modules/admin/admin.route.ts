import express, { Router } from "express"
import { AdminController } from "./admin.controller";
import { Middleware } from "../../middleware/auth.middleware";
import { ROLE } from "../../types/role.type";

const router: Router = express.Router();


router.get('/dashboard', Middleware(ROLE.ADMIN), AdminController.getDashboardStats);
router.get('/users',Middleware(ROLE.ADMIN), AdminController.getAllUsers);
router.patch('/users/:userId/status',Middleware(ROLE.ADMIN), AdminController.changeUserStatus);
router.get('/bookings',Middleware(ROLE.ADMIN), AdminController.getAllBookings);

export const AdminRoutes = router;