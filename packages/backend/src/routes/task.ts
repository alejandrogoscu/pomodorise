import { Router } from "express";
import {
  getTask,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completePomodoro,
} from "../controllers/taskController";
import { protect } from "../middlewares/auth";

const router: Router = Router();

router.use(protect);

router.get("/", getTask);

router.post("/", createTask);

router.get("/:id", getTaskById);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

router.patch("/:id/complete-pomodoro", completePomodoro);

export default router;
