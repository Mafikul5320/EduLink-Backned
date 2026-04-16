import express, { Router } from "express"
import { TutorController } from "./tutor.controller";
import { Middleware } from "../../middleware/auth.middleware";
import { ROLE } from "../../types/role.type";


const router: Router = express.Router();

router.post("/create/category", Middleware(ROLE.ADMIN), TutorController.createCategory),
router.get("/all/category",  TutorController.getAllCategories),
router.patch("/upadte/tutor", Middleware(ROLE.ADMIN), TutorController.setupProfile)
router.post("/availability/tutor", Middleware(ROLE.TUTOR), TutorController.manageAvailability)
router.get("/all/data/tutor", Middleware(ROLE.TUTOR), TutorController.getDashboardData)
router.patch("/all/data/tutor", Middleware(ROLE.TUTOR), TutorController.updateProfile)
router.get('/tutor/filter', TutorController.getAllTutors);
router.get('/tutor/:id', TutorController.getSingleTutor);

export const TutorRouter = router;