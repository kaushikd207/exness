import { Router } from "express";
import { pg } from "../db";

const router = Router();

router.get("/candles/:symbol/:interval", async (req, res) => {
  const { symbol, interval } = req.params;
  const result = await pg.query(
    `SELECT * FROM ${symbol.toLowerCase()}_klines_${interval} ORDER BY bucket DESC LIMIT 100`
  );
  res.json(result.rows);
});

export default router;
