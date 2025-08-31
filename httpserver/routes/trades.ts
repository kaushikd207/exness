import { Router } from "express";
import { trades, users } from "../data";
import { authMiddleware } from "../auth";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Create a new trade
router.post("/", authMiddleware, (req: any, res) => {
  const { type, margin, leverage, openPrice, orderId, closePrice } = req.body;

  // 👉 Close Trade
  if (orderId) {
    const trade = trades.find(
      (t) => t.orderId === orderId && t.userId === req.user.id
    );
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }
    if (trade.status === "closed") {
      return res.status(400).json({ message: "Trade already closed" });
    }

    trade.status = "closed";
    trade.closePrice = closePrice; // ✅ save exit price from frontend (live WebSocket)

    // refund margin back to user
    const user = users.find((u) => u.id === req.user.id);
    if (user) {
      user.usd_balance += trade.margin;
    }

    console.log("❌ Trade closed:", trade);
    return res.json({ trade });
  }

  // 👉 Create New Trade
  const marginNum = Number(margin);
  const leverageNum = Number(leverage);
  const openPriceNum = Number(openPrice);

  if (!["buy", "sell"].includes(type)) {
    return res.status(400).json({ message: "type must be 'buy' or 'sell'" });
  }
  if (!Number.isFinite(marginNum) || marginNum <= 0) {
    return res
      .status(400)
      .json({ message: "margin must be a positive number" });
  }
  if (!Number.isFinite(leverageNum) || leverageNum < 0) {
    return res.status(400).json({ message: "leverage must be >= 0" });
  }
  if (!Number.isFinite(openPriceNum) || openPriceNum <= 0) {
    return res
      .status(400)
      .json({ message: "openPrice must be a positive number" });
  }

  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.usd_balance < marginNum) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  user.usd_balance -= marginNum; // ✅ Deduct margin when trade opens

  const newOrderId = uuidv4();
  const newTrade = {
    orderId: newOrderId,
    userId: user.id,
    type,
    margin: marginNum,
    leverage: leverageNum,
    openPrice: openPriceNum,
    status: "open",
  };

  trades.push(newTrade);

  console.log("✅ Trade created:", newTrade);
  res.json({ trade: newTrade });
});

// router.patch(":orderId/close", authMiddleware, (req: any, res) => {
//   const { orderId } = req.params;
//   const user = users.find((u) => u.id === req.user.id);

//   const trade = trades.find((t: any) => t.orderId === orderId);
//   if (!trade) return res.status(404).json({ error: "Trade not found" });

//   trade.status = "closed";
//   res.json({ success: true, trade });
// });

// Get all open trades for logged-in user
router.get("/open", authMiddleware, (req: any, res) => {
  console.log("🔑 Current user:", req.user);
  console.log("📊 All trades:", trades);

  const openTrades = trades.filter(
    (t) => t.userId === req.user.id && t.status === "open"
  );

  console.log("📂 Open trades for user:", openTrades);

  res.json({ trades: openTrades });
});

// Get all closed trades for logged-in user
router.get("/", authMiddleware, (req: any, res) => {
  const closedTrades = trades.filter(
    (t) => t.userId === req.user.id && t.status === "closed"
  );
  res.json({ trades: closedTrades });
});

export default router;
