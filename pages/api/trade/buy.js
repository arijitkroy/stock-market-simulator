import { db } from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/auth";
import { getStockPrice } from "@/lib/market";

export default async function handler(req, res) {
  try {
    const user = await verifyUser(req);
    const { symbol, quantity } = req.body;

    const price = await getStockPrice(symbol);

    const userRef = db.collection("users").doc(user.uid);
    const portfolioRef = db.collection("portfolios").doc(user.uid);

    await db.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      const portfolioDoc = await tx.get(portfolioRef);

      const balance = userDoc.data()?.balance || 0;
      let holdings = portfolioDoc.data()?.holdings || [];

      const totalCost = price * quantity;
      if (balance < totalCost) {
        throw new Error("Insufficient balance");
      }

      const index = holdings.findIndex(h => h.symbol === symbol);
      if (index >= 0) {
        const existing = holdings[index];
        const newQty = existing.quantity + quantity;
        const newAvg = (existing.avgPrice * existing.quantity + price * quantity) / newQty;
        holdings[index] = { symbol, quantity: newQty, avgPrice: newAvg };
      } else {
        holdings.push({ symbol, quantity, avgPrice: price });
      }

      tx.update(userRef, { balance: balance - totalCost });
      tx.set(portfolioRef, { holdings }, { merge: true });
    });

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}