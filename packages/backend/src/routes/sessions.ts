import { Router } from "express";
import {
  getSessions,
  createSession,
  completeSession,
  getSessionStats,
} from "../controllers/sessionController";
import { protect } from "../middlewares/auth";

const router: Router = Router();

router.use(protect);

router.get("/", getSessions);

router.post("/", createSession);

router.patch("/:id/complete", completeSession);

router.get("/stats", getSessionStats);

export default router;
