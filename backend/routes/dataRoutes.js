import { Router } from "express";
import { getRecords, getFilterOptions, getAggregations } from "../controllers/dataController.js";

const router = Router();
router.get("/records", getRecords);
router.get("/filters", getFilterOptions);
router.get("/aggregations", getAggregations);

export default router;