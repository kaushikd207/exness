import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const candles = [
    {
      timestamp: Date.now(),
      open: 2000000,
      close: 2100000,
      high: 2200000,
      low: 1900000,
      decimal: 4,
    },
  ];
  res.json({ candles });
});

export default router;
