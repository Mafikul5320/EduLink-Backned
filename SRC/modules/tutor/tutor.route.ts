import express, { Router } from "express"
import { TutorController } from "./tutor.controller";
import { Middleware } from "../../middleware/auth.middleware";
import { ROLE } from "../../types/role.type";


const router: Router = express.Router();

router.post("/create/category", Middleware(ROLE.ADMIN), TutorController.createCategory);
router.get("/all/category", TutorController.getAllCategories);

// Tutor endpoints
router.post("/availability/tutor", Middleware(ROLE.TUTOR), TutorController.manageAvailability);
router.get("/all/data/tutor", Middleware(ROLE.TUTOR), TutorController.getDashboardData);
router.patch("/all/data/tutor", Middleware(ROLE.TUTOR), TutorController.updateProfile);

// Public/Student Tutor fetching
router.get('/tutor/filter', TutorController.getAllTutors);
router.get('/tutor/:id', TutorController.getSingleTutor);
router.get('/public/tutors', TutorController.getAllTutorProfiles);

// A Student can create a tutor profile to become a Tutor
router.post('/create/tutor-profile', Middleware(ROLE.TUTOR), TutorController.createTutorProfile);

export const TutorRouter = router;