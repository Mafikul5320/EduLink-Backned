import express, { Router } from "express"
import { CategoryController } from "./tutor.controller";

const router: Router = express.Router();

router.post("/create/category", CategoryController.createCategory),
router.get("/all/category", CategoryController.getAllCategories)


export const TutorRouter = router;