import { Router } from "express";
import { getSessionStats } from "../controllers/sessionController";
import { protect } from "../middlewares/auth";

const router: Router = Router();

router.use(protect);

router.get("/", getSessionStats);

export default router;
