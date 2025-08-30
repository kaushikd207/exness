import { Router } from "express";

import { assets } from "../data";

const router = Router();

router.get("/", (req, res) => {
  res.json({ assets });
});

export default router;
